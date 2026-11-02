export type Profile3D = {gender:'male'|'female';height_cm:number;weight_kg:number};
export type MeasurementResult = Profile3D & {bmi:number;estimated:boolean;limited:boolean;mass_proxy_kg:number;mass_residual_kg:number;notice:string};
export async function predictAvatar(profile:Profile3D,signal:AbortSignal):Promise<ArrayBuffer> {
  const res=await fetch('/api/nhom07-3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(profile),signal,cache:'no-store'});
  if (!res.ok) { const data=await res.json().catch(()=>({})); throw new Error(data.error||'Không tạo được mô hình. Hãy thử lại.'); }
  return res.arrayBuffer();
}
