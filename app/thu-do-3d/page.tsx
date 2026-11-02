'use client';
import './styles.css';
import dynamic from 'next/dynamic';
import { useCallback,useEffect,useRef,useState } from 'react';
import { ArrowRight,Box,Check,Download,LoaderCircle,Rotate3D } from './icons';
import { predictAvatar,type Profile3D,type MeasurementResult } from './client';
const AvatarCanvas=dynamic(()=>import('./AvatarCanvas').then(m=>m.AvatarCanvas),{ssr:false});
const colors=[{name:'Xanh biển',hex:'#247b9a'},{name:'Kem',hex:'#d8cbb4'},{name:'Than',hex:'#303936'},{name:'Đất nung',hex:'#a4644e'}];
export default function Avatar3DPage(){
  const [gender,setGender]=useState<'male'|'female'>('male');
  const [height,setHeight]=useState('170'),[weight,setWeight]=useState('65');
  const [color,setColor]=useState(colors[0].hex);
  const [data,setData]=useState<ArrayBuffer|null>(null),[info,setInfo]=useState<MeasurementResult|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const request=useRef<AbortController|null>(null);
  useEffect(()=>()=>request.current?.abort(),[]);
  const h=Number(height),w=Number(weight);const valid=height!==''&&weight!==''&&h>=130&&h<=220&&w>=30&&w<=180;
  const dirty=!!info&&(info.gender!==gender||Math.abs(info.height_cm-h)>.001||Math.abs(info.weight_kg-w)>.001);
  const onResult=useCallback((next:MeasurementResult)=>setInfo(next),[]);
  async function submit(e:React.FormEvent){e.preventDefault();if(!valid)return;request.current?.abort();const ctrl=new AbortController();request.current=ctrl;setBusy(true);setError('');
    try{const result=await predictAvatar({gender,height_cm:h,weight_kg:w} satisfies Profile3D,ctrl.signal);if(!ctrl.signal.aborted)setData(result);}
    catch(e){if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:'Có lỗi kết nối.');}
    finally{if(!ctrl.signal.aborted)setBusy(false);}
  }
  function download(){if(!data)return;const url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='ao-ao-that-3d.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <div className="nhom07-ai3d-scope"><main className="container-wide py-8 lg:py-12">
    <div className="mb-7 flex items-center gap-2 text-xs text-ink/50"><a href="/">Về trang chính</a><span>/</span><span className="text-ink">Phòng thử 3D</span></div>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Áo Ảo Thật / Phòng thử 3D</p><h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Thử áo theo dáng của bạn.</h1></div><span className="flex items-center gap-2 rounded-full border border-moss/20 px-4 py-2 text-xs font-medium text-moss"><Box size={14}/> Bản thử nghiệm · Áo thun</span></div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-label="Xem mô hình" className="relative min-h-[540px] overflow-hidden rounded-3xl border border-ink/5 bg-[#eeece5] lg:min-h-[660px]">
        <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs text-ink/60"><Rotate3D size={15}/> Kéo để xoay · Cuộn để phóng to</div>
        <AvatarCanvas data={data} color={color} onResult={onResult}/>
        {busy&&<div role="status" className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-cream/80 backdrop-blur-sm"><LoaderCircle className="animate-spin" size={30}/><p className="mt-4 font-medium">Đang tạo dáng và dự đoán áo…</p><p className="mt-2 text-xs text-ink/60">Lần đầu cần nạp model.</p></div>}
      </section>
      <div className="space-y-5">
        <form onSubmit={submit} className="rounded-3xl border border-ink/10 bg-white p-6">
          <p className="eyebrow">01 / Số đo của bạn</p><h2 className="mb-5 mt-2 font-display text-xl">Bắt đầu từ dáng người</h2>
          <fieldset className="mb-5"><legend className="mb-2 text-sm font-medium">Dáng cơ thể</legend><div className="grid grid-cols-2 gap-2">{(['male','female'] as const).map(g=><button key={g} type="button" disabled={busy} aria-pressed={gender===g} onClick={()=>setGender(g)} className={`rounded-xl border px-4 py-3 text-sm ${gender===g?'border-ink bg-ink text-white':'border-ink/15 hover:bg-sand/50'}`}>{g==='male'?'Nam':'Nữ'}</button>)}</div></fieldset>
          <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Chiều cao (cm)<input type="number" min="130" max="220" step="0.1" required disabled={busy} value={height} onChange={e=>setHeight(e.target.value)} className="mt-2 w-full rounded-xl border border-ink/20 bg-cream/40 px-3 py-3 text-lg"/></label><label className="text-sm font-medium">Cân nặng (kg)<input type="number" min="30" max="180" step="0.1" required disabled={busy} value={weight} onChange={e=>setWeight(e.target.value)} className="mt-2 w-full rounded-xl border border-ink/20 bg-cream/40 px-3 py-3 text-lg"/></label></div>
          <div className="my-4 flex justify-between rounded-xl bg-sand/40 px-4 py-3 text-sm"><span className="text-ink/60">BMI · tự tính</span><output className="font-semibold">{valid?(w/(h/100)**2).toFixed(2):'—'}</output></div>
          <button type="submit" disabled={busy||!valid} className="btn-primary w-full disabled:opacity-50">{busy?'Đang xử lý…':'Tạo dáng & thử áo'}{!busy&&<ArrowRight size={17}/>}</button>
          <p className="mt-3 text-xs leading-5 text-ink/55">Dành cho người lớn. Cùng chiều cao và cân nặng vẫn có thể có nhiều dáng người khác nhau.</p>
          {error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-800">{error}</p>}
          {dirty&&!busy&&<p role="status" className="mt-3 text-xs text-moss">Số đo đã đổi. Bấm tạo dáng để cập nhật mô hình.</p>}
        </form>
        <section className="rounded-3xl border border-ink/10 bg-white p-6"><p className="eyebrow">02 / Chiếc áo</p><div className="mt-3 flex justify-between text-sm"><span className="font-semibold">Áo thun tay ngắn</span><span className="text-ink/50">TailorNet</span></div><p className="mt-2 text-xs leading-5 text-ink/55">Mẫu áo từ bộ dữ liệu 3D. Màu chỉ thay đổi cách hiển thị, không thay đổi chất liệu vật lý.</p><div className="mt-4 flex gap-3">{colors.map(c=><button type="button" key={c.hex} title={c.name} aria-label={c.name} aria-pressed={color===c.hex} onClick={()=>setColor(c.hex)} style={{backgroundColor:c.hex}} className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 ring-offset-2 aria-pressed:ring-2 aria-pressed:ring-ink">{color===c.hex&&<Check size={16} color={c.name==='Kem'?'#1d2420':'white'}/>}</button>)}</div></section>
        {info&&<section aria-label="Kết quả" className={`rounded-2xl p-4 text-xs leading-5 ${info.limited?'bg-amber-50 text-amber-900':'bg-moss/10 text-ink/70'}`}><strong>{info.limited?'Số đo vượt phạm vi dáng của model':'Đã tạo dáng ước lượng'}</strong><p className="mt-1">{info.height_cm} cm · {info.weight_kg} kg · BMI {info.bmi.toFixed(2)}</p>{info.limited&&<p>Dáng gần nhất quy đổi khoảng {info.mass_proxy_kg.toFixed(1)} kg. Chưa biểu diễn được đúng cân nặng đã nhập.</p>}<p className="mt-2">Kết quả giúp hình dung trang phục, chưa dùng để xác nhận size hay độ chật/rộng thực tế.</p></section>}
        <button type="button" onClick={download} disabled={!data||busy||dirty} className="btn-secondary w-full disabled:opacity-40"><Download size={16}/> Tải mô hình GLB</button><p className="text-center text-[11px] text-ink/45">GLB dùng màu áo gốc. Giữ file dùng nội bộ theo giấy phép dữ liệu.</p>
      </div>
    </div>
  </main></div>;
}
