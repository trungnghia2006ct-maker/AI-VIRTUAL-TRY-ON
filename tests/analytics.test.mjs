import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { randomUUID } from 'node:crypto';

// Compile pure TypeScript modules in memory; no new test dependency or generated repo files.
function load(file) {
  const source = readFileSync(new URL(file, import.meta.url),'utf8');
  const output = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  // Only sibling pure modules may be required; anything else would mean a runtime dependency slipped in.
  const localRequire = name => { if (name === './ftqs') return load('../lib/ftqs.ts'); throw new Error(`Unexpected import in pure module: ${name}`); };
  const exports = {}; new Function('exports','require',output)(exports,localRequire); return exports;
}
const { summarize, ratio } = load('../lib/analytics-summary.ts');
const { ftqsComposite, ftqsGateFailed, ftqsAccepted, wilson, FTQS_DIMENSIONS } = load('../lib/ftqs.ts');
const { isClientEvent } = load('../lib/analytics-schema.ts');
const now = Date.parse('2026-11-01T12:00:00Z');
const day = 86400000;
const filters = {days:30,page:'',feature:'',source:'',device:''};
const base = {visitor:'visitor-a',session:'session-a',firstSeen:new Date(now-3*day).toISOString(),source:'direct',device:'desktop',landing:'/',page:'/',feature:'page',view:'view-a',suspect:null};
const event = (extra={}) => ({...base,id:randomUUID(),at:new Date(now-60000).toISOString(),kind:'page_view',...extra});
const dataset = events => ({events,feedback:[],quality:[]});
test('empty ratios remain null with an explicit zero sample',()=>{
  assert.deepEqual(ratio(0,0),{count:0,sample:0,percent:null});
  assert.equal(summarize(dataset([]),filters,now).conversion.rate.percent,null);
});
test('validation rejects payload fields, unbounded time, query paths and unknown targets',()=>{
  const item={id:randomUUID(),view:randomUUID(),page:'/',feature:'page',kind:'page_view'};
  assert.equal(isClientEvent(item),true);
  for(const patch of [{page:'/?email=private'}, {email:'private'}, {kind:'engagement',value:15001}, {kind:'scroll',value:26}, {kind:'click',target:'arbitrary text'}]) assert.equal(isClientEvent({...item,...patch}),false);
  assert.equal(isClientEvent({...item,kind:'engagement',value:5000}),true);
});
test('whole suspect session is excluded, including earlier unflagged events',()=>{
  const result=summarize(dataset([event(),event({kind:'click',feature:'tryon',target:'tryon-open',suspect:'burst'}),event({session:'session-b',visitor:'visitor-b',view:'view-b'})]),filters,now);
  assert.equal(result.traffic.sessions,1); assert.equal(result.traffic.views,1);
  assert.equal(result.quality.excludedEvents,2); assert.equal(result.quality.abnormalClicks,1);
});
test('CTR deduplicates repeated clicks and excludes clicks without exposure from numerator',()=>{
  const result=summarize(dataset([event(),event({kind:'impression',target:'tryon-open'}),event({kind:'click',target:'tryon-open'}),event({kind:'click',target:'tryon-open'}),event({view:'other',kind:'click',target:'tryon-open'})]),filters,now);
  assert.deepEqual(result.interactions.ctr[0],{label:'tryon-open',count:1,sample:1,percent:100});
});
test('funnel respects step order and requires all steps in the same session',()=>{
  const result=summarize(dataset([event(),event({kind:'conversion',target:'tryon-success',order:0}),event({kind:'conversion',target:'tryon-start',order:1}),event({kind:'conversion',target:'add-to-cart',order:2}),event({session:'b',kind:'conversion',target:'tryon-success',order:3})]),filters,now);
  assert.deepEqual(result.conversion.funnel.map(r=>r.count),[1,0,0]);
});
test('feature filter preserves page-view denominators for the matching view only',()=>{
  const result=summarize(dataset([event(),event({kind:'click',feature:'tryon',target:'tryon-open'}),event({view:'unrelated',session:'other'})]),{...filters,feature:'tryon'},now);
  assert.equal(result.traffic.views,1); assert.equal(result.traffic.sessions,1);
});
test('retention excludes immature cohorts and checks actual return windows',()=>{
  const first=new Date(now-3*day).toISOString();
  const result=summarize(dataset([event({at:first,firstSeen:first}),event({at:new Date(now-1.5*day).toISOString(),firstSeen:first,session:'return'}),event({visitor:'too-new',firstSeen:new Date(now-day/2).toISOString(),session:'new',view:'new'})]),filters,now);
  assert.equal(result.retention[0].sample,1); assert.equal(result.retention[0].count,1);
  assert.equal(result.retention[1].sample,0); assert.equal(result.retention[2].percent,null);
});
test('filters affect feedback; global invalid-request counters remain explicitly global',()=>{
  const data=dataset([event()]); data.feedback=[{...base,id:'f',at:new Date(now-1000).toISOString(),rating:'up',comment:'hello',feature:'cart'}]; data.quality=[{at:new Date(now-1000).toISOString(),reason:'invalid',count:3}];
  const result=summarize(data,{...filters,feature:'tryon'},now);
  assert.equal(result.feedback.total,0); assert.equal(result.quality.counters[0].count,3);
});

// FTQS: fixtures below are synthetic and exist only inside these tests; they are never inserted into the dashboard.
const all = value => Object.fromEntries(FTQS_DIMENSIONS.map(d => [d.key, value]));
const ftqsRow = (extra = {}) => ({...base,id:randomUUID(),resultId:randomUUID(),at:new Date(now-60000).toISOString(),page:'/',productId:'linen-jacket-loose',color:'Beige',size:'M',provider:'gemini',promptVersion:'tryon-gemini@1.0.0',scores:all(5),suspect:null,...extra});
test('FTQS composite follows the documented weights and needs all six dimensions',()=>{
  assert.equal(ftqsComposite(all(5)),100);
  assert.equal(ftqsComposite(all(1)),0);
  assert.equal(ftqsComposite({identity:4,garment:3,fit:4,body:5,scene:4,trust:3}),71.25);
  assert.equal(ftqsComposite({identity:5,garment:5}),null);
  assert.equal(ftqsComposite({...all(5),fit:6}),null);
  assert.equal(FTQS_DIMENSIONS.reduce((sum,d)=>sum+d.weight,0),100);
});
test('critical gate rejects an otherwise high score and applies to partial ratings too',()=>{
  const gated={...all(5),identity:1};
  assert.equal(ftqsComposite(gated),80); assert.equal(ftqsGateFailed(gated),true); assert.equal(ftqsAccepted(gated),false);
  assert.equal(ftqsGateFailed({scene:1,trust:1,fit:1}),false);
  assert.equal(ftqsGateFailed({body:1}),true);
  assert.equal(ftqsAccepted({identity:5}),null);
  assert.equal(ftqsAccepted({...all(4)}),true);
});
test('Wilson interval is conservative for small samples and null for empty samples',()=>{
  assert.equal(wilson(0,0),null);
  const interval=wilson(5,5); assert.equal(interval.high,100); assert.ok(interval.low>50&&interval.low<60);
});
test('FTQS summary is empty, not zero, when nobody has rated',()=>{
  const result=summarize(dataset([event()]),filters,now).ftqs;
  assert.equal(result.total,0); assert.equal(result.composite.mean,null); assert.equal(result.acceptance.percent,null);
  assert.equal(result.dimensions[0].mean,null); assert.deepEqual(result.byProvider,[]);
});
test('FTQS summary aggregates dimensions, acceptance, providers and prompt versions',()=>{
  const data=dataset([event()]);
  data.ftqs=[
    ftqsRow(),
    ftqsRow({scores:all(4),provider:'huggingface',promptVersion:'tryon-huggingface@1.0.0'}),
    ftqsRow({scores:{...all(5),identity:1},provider:'huggingface',promptVersion:'tryon-huggingface@1.0.0'}),
    ftqsRow({scores:{identity:3,garment:3},promptVersion:null}),
  ];
  const result=summarize(data,filters,now).ftqs;
  assert.equal(result.total,4); assert.equal(result.complete,3);
  assert.deepEqual(result.acceptance.percent,66.7); assert.equal(result.acceptance.count,2); assert.equal(result.acceptance.sample,3);
  assert.deepEqual(result.gateFailures,{count:1,sample:4,percent:25});
  const identity=result.dimensions.find(d=>d.key==='identity');
  assert.equal(identity.sample,4); assert.equal(identity.mean,3.3); assert.equal(identity.median,3.5);
  assert.equal(result.dimensions.find(d=>d.key==='trust').sample,3);
  assert.deepEqual(result.byProvider.map(r=>[r.label,r.total]),[['gemini',2],['huggingface',2]]);
  assert.equal(result.byProvider[1].acceptance.percent,50);
  assert.ok(result.byPromptVersion.some(r=>r.label==='Không rõ'));
});
test('FTQS respects time, device, suspect-session and feature filters',()=>{
  const data=dataset([event()]);
  data.ftqs=[ftqsRow(),ftqsRow({at:new Date(now-40*day).toISOString()}),ftqsRow({device:'mobile'}),ftqsRow({session:'bot-session',suspect:'bot'}),ftqsRow({session:'bot-session'})];
  assert.equal(summarize(data,filters,now).ftqs.total,2);
  assert.equal(summarize(data,{...filters,device:'mobile'},now).ftqs.total,1);
  assert.equal(summarize(data,{...filters,days:90},now).ftqs.total,3);
  assert.equal(summarize(data,{...filters,feature:'tryon'},now).ftqs.total,2);
  assert.equal(summarize(data,{...filters,feature:'cart'},now).ftqs.total,0);
});
