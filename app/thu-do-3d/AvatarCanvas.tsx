'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { MeasurementResult } from './client';

type Props={data:ArrayBuffer|null;color:string;onResult:(info:MeasurementResult)=>void};
function disposeModel(model:THREE.Object3D) { model.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose(); const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}}); }
export function AvatarCanvas({data,color,onResult}:Props) {
  const host=useRef<HTMLDivElement>(null);
  const state=useRef<{scene:THREE.Scene;camera:THREE.PerspectiveCamera;controls:OrbitControls;model:THREE.Group|null}|null>(null);
  const [error,setError]=useState('');
  const resultCallback=useRef(onResult); resultCallback.current=onResult;
  const colorRef=useRef(color); colorRef.current=color;
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const el=host.current; if(!el)return;
    let renderer:THREE.WebGLRenderer;
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); }
    catch { setError('Trình duyệt chưa hỗ trợ WebGL. Thử Chrome/Cốc Cốc với tăng tốc đồ họa.');return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    if ('outputColorSpace' in renderer) renderer.outputColorSpace='srgb';
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.2;
    renderer.domElement.setAttribute('aria-label','Mô hình thử áo 3D; dùng chuột hoặc các nút đổi góc nhìn');
    el.appendChild(renderer.domElement);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,1,.01,100);camera.position.set(0,1.05,3.6);
    const controls=new OrbitControls(camera,renderer.domElement); controls.target.set(0,.88,0);
    controls.enableDamping=true;controls.minDistance=1.2;controls.maxDistance=6;
    controls.maxPolarAngle=Math.PI*.64; controls.enablePan=false;
    scene.add(new THREE.HemisphereLight(0xffffff,0x78746a,2.2));
    const key=new THREE.DirectionalLight(0xfff6e6,3);key.position.set(-2,3,4);scene.add(key);
    const rim=new THREE.DirectionalLight(0xb6d5ff,2);rim.position.set(3,2,-2);scene.add(rim);
    const floor=new THREE.Mesh(new THREE.CircleGeometry(1,64),new THREE.MeshBasicMaterial({color:0xddd9d0,transparent:true,opacity:.5,side:THREE.DoubleSide}));
    floor.rotation.x=-Math.PI/2;floor.position.y=-.006;scene.add(floor);
    state.current={scene,camera,controls,model:null};
    const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};
    const observer=new ResizeObserver(resize);observer.observe(el);resize();
    renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});setReady(true);
    return()=>{renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();if(state.current?.model)disposeModel(state.current.model);floor.geometry.dispose();floor.material.dispose();renderer.dispose();renderer.domElement.remove();state.current=null;};
  },[]);
  useEffect(()=>{
    if(!data||!ready||!state.current)return;
    let cancelled=false;setError('');
    new GLTFLoader().parse(data,'',gltf=>{
      if(cancelled||!state.current){disposeModel(gltf.scene);return;}
      const s=state.current;if(s.model){s.scene.remove(s.model);disposeModel(s.model);}
      gltf.scene.traverse(o=>{if(o instanceof THREE.Mesh&&o.name==='TShirt'&&o.material instanceof THREE.MeshStandardMaterial)o.material.color.set(colorRef.current);});
      s.model=gltf.scene;s.scene.add(gltf.scene);
      const box=new THREE.Box3().setFromObject(gltf.scene);const h=box.max.y-box.min.y;
      s.controls.target.set(0,h*.5,0);s.camera.position.set(0,h*.55,h*2.05);s.controls.update();
      resultCallback.current(gltf.scene.userData as MeasurementResult);
    },()=>{if(!cancelled)setError('Không đọc được mô hình 3D trả về.');});
    return()=>{cancelled=true;};
  },[data,ready]);
  useEffect(()=>{state.current?.model?.traverse(o=>{if(o instanceof THREE.Mesh&&o.name==='TShirt'&&o.material instanceof THREE.MeshStandardMaterial)o.material.color.set(color);});},[color]);
  function angle(side:number){const s=state.current;if(!s)return;const radius=s.camera.position.distanceTo(s.controls.target);s.camera.position.set(Math.sin(side)*radius,s.controls.target.y,Math.cos(side)*radius);s.controls.update();}
  return <div className="relative h-full min-h-[450px] w-full">
    <div ref={host} className="absolute inset-0"/>
    {error&&<p role="alert" className="absolute inset-x-6 top-20 rounded-xl bg-white p-4 text-sm text-red-700">{error}</p>}
    {!data&&!error&&<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center"><div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-ink/15 bg-white/50 text-2xl font-light text-moss">3D</div><p className="font-display text-2xl">Dáng của bạn, góc nhìn của bạn</p><p className="mt-3 max-w-xs text-sm leading-6 text-ink/55">Nhập chiều cao và cân nặng, rồi chọn “Tạo dáng & thử áo”.</p></div>}
    <div className="absolute inset-x-4 bottom-5 flex flex-wrap justify-center gap-2">
      {[[0,'Trước'],[Math.PI/2,'Nghiêng'],[Math.PI,'Sau']].map(([a,label])=><button key={label} type="button" disabled={!data||!ready} onClick={()=>angle(Number(a))} className="rounded-full border border-ink/10 bg-white/90 px-4 py-2 text-xs font-medium shadow-sm disabled:opacity-40">{label}</button>)}
    </div>
  </div>;
}
