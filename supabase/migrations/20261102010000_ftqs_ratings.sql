-- FTQS (Fashion Try-On Quality Scale): điểm người dùng tự chấm cho từng kết quả thử đồ.
-- Không lưu ảnh. Chạy một lần trong Supabase SQL Editor; an toàn khi chạy lại.
begin;

create table if not exists public.product_ftqs (
  id uuid primary key,
  occurred_at timestamptz not null,
  data jsonb not null check (
    jsonb_typeof(data) = 'object'
    and jsonb_typeof(data->'scores') = 'object'
  )
);
create index if not exists product_ftqs_time on public.product_ftqs (occurred_at desc, id);

alter table public.product_ftqs enable row level security;
revoke all on public.product_ftqs from public, anon, authenticated;
grant select, insert, update, delete on public.product_ftqs to service_role;

-- Cập nhật hàm dọn dẹp 90 ngày để bao gồm bảng FTQS (giữ nguyên các bảng cũ).
create or replace function public.prune_product_analytics()
returns void language sql security invoker set search_path = public as $$
  delete from public.product_events where occurred_at < now() - interval '90 days';
  delete from public.product_feedback where occurred_at < now() - interval '90 days';
  delete from public.product_quality where occurred_at < now() - interval '90 days';
  delete from public.product_ftqs where occurred_at < now() - interval '90 days';
$$;
revoke all on function public.prune_product_analytics() from public, anon, authenticated;
grant execute on function public.prune_product_analytics() to service_role;

commit;

-- Yêu cầu PostgREST nạp lại schema để API thấy bảng mới ngay.
notify pgrst, 'reload schema';
