import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

async function proxy(request: NextRequest, predict: boolean) {
  const base = process.env.AI3D_SERVICE_URL;
  if (!base) return NextResponse.json({error:'Chưa bật model 3D. Chạy start_web.py trên máy chứa bộ SMPL.'},{status:503});
  try {
    if (predict) {
      const origin = request.headers.get('origin');
      if (origin && origin !== request.nextUrl.origin && new URL(origin).host !== request.headers.get('host'))
        return NextResponse.json({error:'Nguồn yêu cầu không hợp lệ.'},{status:403});
    }
    let body: string | undefined;
    if (predict) {
      const bytes = await request.arrayBuffer();
      if (bytes.byteLength > 4096) return NextResponse.json({error:'Yêu cầu quá lớn.'},{status:413});
      const input = JSON.parse(new TextDecoder().decode(bytes));
      if (!input || typeof input !== 'object' || !['male','female'].includes(input.gender)
        || !Number.isFinite(input.height_cm) || input.height_cm < 130 || input.height_cm > 220
        || !Number.isFinite(input.weight_kg) || input.weight_kg < 30 || input.weight_kg > 180)
        return NextResponse.json({error:'Nhập chiều cao 130–220 cm, cân nặng 30–180 kg.'},{status:422});
      // Style is fixed at the canonical middle style in the consumer interface.
      body=JSON.stringify({gender:input.gender,height_cm:input.height_cm,weight_kg:input.weight_kg});
    }
    const res=await fetch(new URL(predict ? '/predict' : '/health',base),{
      method:predict?'POST':'GET',headers:predict?{'Content-Type':'application/json'}:undefined,
      body,cache:'no-store',signal:AbortSignal.timeout(120000),
    });
    return new NextResponse(await res.arrayBuffer(),{status:res.status,headers:{
      'Content-Type':res.headers.get('content-type')||'application/json','Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff',
    }});
  } catch(e) {
    if (e instanceof SyntaxError) return NextResponse.json({error:'Dữ liệu không hợp lệ.'},{status:400});
    return NextResponse.json({error:'Chưa kết nối được model 3D. Giữ terminal start_web.py đang chạy rồi thử lại.'},{status:503});
  }
}
export function GET(request:NextRequest) { return proxy(request,false); }
export function POST(request:NextRequest) { return proxy(request,true); }
