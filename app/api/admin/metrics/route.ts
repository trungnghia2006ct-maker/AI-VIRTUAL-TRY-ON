import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc('get_tryon_admin_metrics');
    if (error) {
      console.error('Không thể truy vấn metrics Supabase.', error.code);
      return NextResponse.json({ error: 'Không thể tải số liệu quản trị lúc này.' }, { status: 503 });
    }
    return NextResponse.json(
      { metrics: data },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
    );
  } catch {
    console.error('Không thể kết nối Supabase để tải metrics quản trị.');
    return NextResponse.json({ error: 'Dịch vụ metrics chưa được cấu hình.' }, { status: 503 });
  }
}
