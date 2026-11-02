-- Chạy migration này TRƯỚC khi deploy code mới: code ghi cột prompt_version.
alter table public.tryon_metrics
  add column if not exists prompt_version text;

alter table public.tryon_feedback
  add column if not exists prompt_version text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tryon_metrics_prompt_version_format'
  ) then
    alter table public.tryon_metrics
      add constraint tryon_metrics_prompt_version_format
      check (prompt_version is null or prompt_version ~ '^[a-z0-9-]+@[0-9]+\.[0-9]+\.[0-9]+$');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'tryon_feedback_prompt_version_format'
  ) then
    alter table public.tryon_feedback
      add constraint tryon_feedback_prompt_version_format
      check (prompt_version is null or prompt_version ~ '^[a-z0-9-]+@[0-9]+\.[0-9]+\.[0-9]+$');
  end if;
end
$$;
