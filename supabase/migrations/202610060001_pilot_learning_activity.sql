-- Account-owned learning telemetry. Writes and cross-account reads are server-only.
create table public.learning_events (
  id uuid primary key,
  participant_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid not null,
  attempt_id uuid,
  kind text not null check (kind in ('page_view','page_time','click','question_view','question_answer','quiz_submit')),
  path text not null check (char_length(path) between 1 and 180),
  target text check (char_length(target) <= 160),
  module_number smallint check (module_number between 1 and 4),
  question_id text check (char_length(question_id) <= 60),
  selected_options jsonb,
  correct boolean,
  active_ms integer not null default 0 check (active_ms between 0 and 3600000),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  content_version text
);
create index learning_events_participant_time on public.learning_events(participant_id,occurred_at desc,id);
create index learning_events_received on public.learning_events(received_at);
alter table public.learning_events enable row level security;
revoke all on public.learning_events from anon,authenticated;
grant select on public.learning_events to authenticated;
create policy learning_events_owner_read on public.learning_events for select to authenticated using (participant_id = auth.uid());
grant all on public.learning_events to service_role;

create function public.record_learning_events(p_participant uuid,p_events jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
  if jsonb_typeof(p_events)<>'array' or jsonb_array_length(p_events) not between 1 and 50 then raise exception 'Invalid event batch'; end if;
  perform pg_advisory_xact_lock(hashtext('telemetry:'||p_participant::text));
  if (select count(*) from public.learning_events where participant_id=p_participant and received_at>now()-interval '1 hour') + jsonb_array_length(p_events)>2000 then
    raise exception 'Activity rate limit' using errcode='P0001';
  end if;
  insert into public.learning_events(id,participant_id,session_id,attempt_id,kind,path,target,module_number,question_id,selected_options,correct,active_ms,occurred_at,content_version)
  select (e->>'id')::uuid,p_participant,(e->>'sessionId')::uuid,(e->>'attemptId')::uuid,e->>'kind',e->>'path',e->>'target',
    (e->>'module')::smallint,e->>'questionId',e->'selectedOptions',(e->>'correct')::boolean,(e->>'activeMs')::integer,(e->>'occurredAt')::timestamptz,e->>'contentVersion'
  from jsonb_array_elements(p_events) e on conflict(id) do nothing;
  get diagnostics n=row_count;
  return n;
end; $$;
revoke all on function public.record_learning_events(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.record_learning_events(uuid,jsonb) to service_role;

-- Explicit projection excludes reflection, prompt, assistant and source text.
create function public.admin_learning_roster(p_actor uuid,p_search text default '',p_page integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  if not exists(select 1 from public.profiles where id=p_actor and role::text='admin') then raise exception 'Administrator access required' using errcode='42501'; end if;
  if p_page<0 or p_page>100000 or char_length(p_search)>100 then raise exception 'Invalid roster query'; end if;
  with filtered as (
    select p.id,p.display_name,p.role,u.email,u.created_at,u.last_sign_in_at
    from public.profiles p join auth.users u on u.id=p.id
    where p_search='' or position(lower(p_search) in lower(p.display_name))>0 or position(lower(p_search) in lower(u.email))>0
  ), page as (select * from filtered order by created_at desc,id limit 25 offset p_page*25)
  select jsonb_build_object('total',(select count(*) from filtered),'page',p_page,'people',coalesce((select jsonb_agg(jsonb_build_object(
    'id',p.id,'name',p.display_name,'email',p.email,'role',p.role,'createdAt',p.created_at,'lastSignInAt',p.last_sign_in_at,
    'completedLessons',coalesce(jsonb_array_length(s.state->'completedLessonSlugs'),0)+coalesce(jsonb_array_length(s.state->'moduleTwoCompletedLessonIds'),0)+coalesce(jsonb_array_length(s.state->'moduleThreeCompletedLessonIds'),0)+coalesce(jsonb_array_length(s.state->'moduleFourCompletedLessonIds'),0),
    'modules',coalesce((select jsonb_agg(jsonb_build_object('module',m.position,'status',mp.status,'bestScore',mp.best_score_percent) order by m.position) from public.module_progress mp join public.learning_modules m on m.id=mp.module_id where mp.participant_id=p.id),'[]'::jsonb),
    'lastActivityAt',(select max(occurred_at) from public.learning_events where participant_id=p.id),
    'activeMs',coalesce((select sum(active_ms) from public.learning_events where participant_id=p.id and kind='page_time'),0)
  ) order by p.created_at desc,p.id) from page p left join public.participant_states s on s.participant_id=p.id),'[]'::jsonb)) into result;
  return result;
end; $$;
revoke all on function public.admin_learning_roster(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.admin_learning_roster(uuid,text,integer) to service_role;

-- Preserve the existing resource/audit cleanup contract and add pilot telemetry.
create or replace function public.cleanup_expired_learning_data()
returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
  delete from public.teacher_resources where expires_at<=now();
  get diagnostics n=row_count;
  delete from public.audit_events where created_at<now()-interval '90 days';
  delete from public.learning_events where received_at<now()-interval '90 days';
  return n;
end; $$;

-- Access is open during the pilot; completion is still recorded separately.
update public.module_progress set status='available' where status='locked';
