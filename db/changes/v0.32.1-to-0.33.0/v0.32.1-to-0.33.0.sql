create table public.studyset_settings (
  id uuid primary key default gen_random_uuid(),
  studyset_id uuid references public.studysets (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  settings jsonb not null,
  updated_at timestamptz default now()
);

grant select on public.studyset_settings to quizfreely_api;
grant insert on public.studyset_settings to quizfreely_api;
grant update on public.studyset_settings to quizfreely_api;
grant delete on public.studyset_settings to quizfreely_api;

alter table public.studyset_settings enable row level security;

create policy select_studyset_settings on public.studyset_settings
as permissive
for select
to quizfreely_api
using (
  (select current_setting('qzfr_api.scope', true)) = 'user' and
  (select current_setting('qzfr_api.user_id', true))::uuid = user_id
);

create policy insert_studyset_settings on public.studyset_settings
as permissive
for insert
to quizfreely_api
with check (
  (select current_setting('qzfr_api.scope', true)) = 'user' and
  (select current_setting('qzfr_api.user_id', true))::uuid = user_id
);

create policy update_studyset_settings on public.studyset_settings
as permissive
for update
to quizfreely_api
using (
  (select current_setting('qzfr_api.scope', true)) = 'user' and
  (select current_setting('qzfr_api.user_id', true))::uuid = user_id
)
with check (true);

create policy delete_studyset_settings on public.studyset_settings
as permissive
for delete
to quizfreely_api
using (
  (select current_setting('qzfr_api.scope', true)) = 'user' and
  (select current_setting('qzfr_api.user_id', true))::uuid = user_id
);

alter table public.studysets


