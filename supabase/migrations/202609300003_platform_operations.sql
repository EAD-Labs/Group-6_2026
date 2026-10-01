-- Staff operations, private source resources and verifiable course completion.
-- Apply after 202609300002. Privileged mutations are transaction-scoped RPCs.
create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  facilitator_id uuid references public.profiles(id) on delete set null,
  starts_on date,
  ends_on date,
  status text not null default 'active' check (status in ('planned','active','completed','archived')),
  created_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);
create table public.cohort_members (
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  participant_id uuid not null references public.profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (cohort_id, participant_id)
);
create table public.content_versions (
  id uuid primary key default gen_random_uuid(),
  module_number smallint not null check (module_number between 1 and 4),
  lesson_slug text not null check (char_length(lesson_slug) between 3 and 120),
  title text not null check (char_length(title) between 3 and 180),
  body text not null check (char_length(body) between 30 and 16000),
  version integer not null check (version > 0),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  author_id uuid references public.profiles(id) on delete set null,
  published_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (module_number, lesson_slug, version)
);
create unique index one_published_lesson_addendum on public.content_versions(module_number,lesson_slug) where status='published';
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.profiles(id) on delete cascade,
  participant_name text not null,
  rule_version text not null default '2026-09-open-course-v1',
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revocation_reason text,
  unique (participant_id, rule_version)
);
create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table public.teacher_resources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  source_text text not null check (char_length(source_text) between 80 and 20000),
  audience text not null check (char_length(audience) between 3 and 160),
  objective text not null check (char_length(objective) between 10 and 500),
  output_format text not null check (output_format in ('summary','worksheet','quiz','study-guide','slides','audio-script')),
  draft text not null check (char_length(draft) <= 24000),
  permission text not null check (permission in ('own','licensed','public-domain')),
  reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

alter table public.cohorts enable row level security;
alter table public.cohort_members enable row level security;
alter table public.content_versions enable row level security;
alter table public.certificates enable row level security;
alter table public.audit_events enable row level security;
alter table public.teacher_resources enable row level security;
revoke all on public.cohorts, public.cohort_members, public.content_versions, public.certificates, public.audit_events, public.teacher_resources from anon, authenticated;
grant all on public.cohorts, public.cohort_members, public.content_versions, public.certificates, public.audit_events, public.teacher_resources to service_role;
grant usage, select on sequence public.audit_events_id_seq to service_role;
grant select on public.cohorts, public.cohort_members, public.content_versions, public.certificates, public.teacher_resources to authenticated;
grant insert, delete on public.teacher_resources to authenticated;
grant update (title,audience,objective,source_text,output_format,draft,permission,reviewed,updated_at) on public.teacher_resources to authenticated;

create policy "cohort participant or assigned facilitator reads" on public.cohorts for select to authenticated
using (facilitator_id=auth.uid() or public.is_admin() or exists(select 1 from public.cohort_members m where m.cohort_id=cohorts.id and m.participant_id=auth.uid()));
create policy "participant reads own membership" on public.cohort_members for select to authenticated using (participant_id=auth.uid() or public.is_admin());
create policy "published content is readable" on public.content_versions for select to authenticated using (status='published' or author_id=auth.uid() or public.is_admin());
create policy "certificate owner reads record" on public.certificates for select to authenticated using (participant_id=auth.uid());
create policy "source owner reads unexpired resources" on public.teacher_resources for select to authenticated using (owner_id=auth.uid() and expires_at>now());
create policy "source owner creates bounded resources" on public.teacher_resources for insert to authenticated with check (owner_id=auth.uid() and expires_at<=now()+interval '30 days');
create policy "source owner updates unexpired resources" on public.teacher_resources for update to authenticated using (owner_id=auth.uid() and expires_at>now()) with check (owner_id=auth.uid() and expires_at<=now()+interval '30 days');
create policy "source owner deletes resources" on public.teacher_resources for delete to authenticated using (owner_id=auth.uid());

create function public.staff_operation(p_actor uuid, p_action text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_role text; v_id uuid; v_version integer; v_target uuid; v_count integer; v_cohort uuid;
begin
  select role::text into v_role from public.profiles where id=p_actor;
  if v_role is null or v_role not in ('admin','facilitator','content_manager') then raise exception 'Staff access required' using errcode='42501'; end if;
  if p_action='save_content' then
    perform pg_advisory_xact_lock(hashtext((p_payload->>'module') || ':' || (p_payload->>'lessonSlug')));
    select coalesce(max(version),0)+1 into v_version from public.content_versions where module_number=(p_payload->>'module')::smallint and lesson_slug=p_payload->>'lessonSlug';
    insert into public.content_versions(module_number,lesson_slug,title,body,version,author_id)
    values ((p_payload->>'module')::smallint,p_payload->>'lessonSlug',p_payload->>'title',p_payload->>'body',v_version,p_actor) returning id into v_id;
  elsif p_action in ('publish_content','archive_content') then
    if v_role<>'admin' then raise exception 'Administrator approval required' using errcode='42501'; end if;
    v_id := (p_payload->>'id')::uuid;
    perform 1 from public.content_versions where id=v_id for update;
    if not found then raise exception 'Content version not found'; end if;
    if p_action='publish_content' then
      update public.content_versions set status='archived' where status='published' and (module_number,lesson_slug)=(select module_number,lesson_slug from public.content_versions where id=v_id);
      update public.content_versions set status='published',published_at=now(),published_by=p_actor where id=v_id;
    else update public.content_versions set status='archived' where id=v_id; end if;
  else
    if v_role<>'admin' then raise exception 'Administrator access required' using errcode='42501'; end if;
    case p_action
      when 'create_cohort' then
        if nullif(p_payload->>'facilitatorId','') is not null and not exists(select 1 from public.profiles where id=(p_payload->>'facilitatorId')::uuid and role::text in ('facilitator','admin')) then raise exception 'Choose an existing facilitator or administrator'; end if;
        insert into public.cohorts(title,facilitator_id,starts_on,ends_on,status) values(p_payload->>'title',nullif(p_payload->>'facilitatorId','')::uuid,nullif(p_payload->>'startsOn','')::date,nullif(p_payload->>'endsOn','')::date,coalesce(p_payload->>'status','active')) returning id into v_id;
      when 'update_cohort' then
        v_id := (p_payload->>'id')::uuid;
        if nullif(p_payload->>'facilitatorId','') is not null and not exists(select 1 from public.profiles where id=(p_payload->>'facilitatorId')::uuid and role::text in ('facilitator','admin')) then raise exception 'Choose an existing facilitator or administrator'; end if;
        update public.cohorts set title=trim(p_payload->>'title'),facilitator_id=nullif(p_payload->>'facilitatorId','')::uuid,
          starts_on=nullif(p_payload->>'startsOn','')::date,ends_on=nullif(p_payload->>'endsOn','')::date,status=p_payload->>'status' where id=v_id;
        if not found then raise exception 'Cohort not found'; end if;
      when 'enrol' then
        v_id := (p_payload->>'cohortId')::uuid;
        if not exists(select 1 from public.profiles where id=(p_payload->>'participantId')::uuid and role::text='participant') then raise exception 'Choose an existing participant account'; end if;
        insert into public.cohort_members(cohort_id,participant_id) values(v_id,(p_payload->>'participantId')::uuid) on conflict do nothing;
      when 'unenrol' then
        v_id := (p_payload->>'cohortId')::uuid;
        delete from public.cohort_members where cohort_id=v_id and participant_id=(p_payload->>'participantId')::uuid;
      when 'set_role' then
        perform pg_advisory_xact_lock(hashtext('promptshala:role-administration'));
        -- Recheck after taking the shared lock so concurrent administrators
        -- cannot demote each other after both read an obsolete authorization.
        if not exists(select 1 from public.profiles where id=p_actor and role::text='admin') then
          raise exception 'Administrator access required' using errcode='42501';
        end if;
        v_id := (p_payload->>'participantId')::uuid;
        if v_id=p_actor then raise exception 'You cannot change your own role'; end if;
        if (p_payload->>'role') not in ('participant','facilitator','content_manager','admin') then raise exception 'Invalid role'; end if;
        update public.profiles set role=(p_payload->>'role')::public.app_role,updated_at=now() where id=v_id;
        if not found then raise exception 'Account not found'; end if;
      when 'revoke_certificate' then
        v_id := (p_payload->>'id')::uuid;
        if char_length(trim(coalesce(p_payload->>'reason','')))<10 then raise exception 'Explain the reason for revocation'; end if;
        update public.certificates set revoked_at=now(),revocation_reason=left(p_payload->>'reason',500) where id=v_id and revoked_at is null;
        if not found then raise exception 'Active certificate not found'; end if;
      when 'update_module' then
        v_id := (p_payload->>'id')::uuid;
        update public.learning_modules set estimated_minutes=(p_payload->>'estimatedMinutes')::smallint, updated_at=now() where id=v_id;
        if not found then raise exception 'Module not found'; end if;
      else raise exception 'Unknown staff action';
    end case;
  end if;
  -- Deliberately excludes private content and source text from the audit stream.
  insert into public.audit_events(actor_id,action,resource_id,details) values(p_actor,p_action,v_id::text,jsonb_build_object('version',v_version,'role',case when p_action='set_role' then p_payload->>'role' end));
  return jsonb_build_object('id',v_id,'version',v_version);
end; $$;
revoke all on function public.staff_operation(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.staff_operation(uuid,text,jsonb) to service_role;

-- Raw assessment selections are available only to the trusted server for
-- aggregation. Browser staff sessions retain owner-only assessment/profile RLS.
create function public.staff_cohort_evidence(p_actor uuid,p_cohort uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_role text; v_facilitator uuid;
begin
  select role::text into v_role from public.profiles where id=p_actor;
  if v_role is null or v_role not in ('admin','facilitator','content_manager') then raise exception 'Staff access required' using errcode='42501'; end if;
  select facilitator_id into v_facilitator from public.cohorts where id=p_cohort;
  if not found or (v_role<>'admin' and v_facilitator is distinct from p_actor) then raise exception 'Cohort access denied' using errcode='42501'; end if;
  return jsonb_build_object(
    'roster',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'display_name',p.display_name) order by p.display_name,p.id) from public.cohort_members m join public.profiles p on p.id=m.participant_id where m.cohort_id=p_cohort),'[]'::jsonb),
    'progress',coalesce((select jsonb_agg(jsonb_build_object('participant_id',p.participant_id,'module_id',p.module_id,'status',p.status,'best_score_percent',p.best_score_percent)) from public.module_progress p join public.cohort_members m on m.participant_id=p.participant_id where m.cohort_id=p_cohort),'[]'::jsonb),
    'submissions',coalesce((select jsonb_agg(jsonb_build_object('participant_id',s.participant_id,'attempt_id',s.attempt_id,'quiz_id',s.quiz_id,'content_version',s.content_version,'answers',s.answers,'verified_at',s.verified_at)) from public.verified_quiz_submissions s join public.cohort_members m on m.participant_id=s.participant_id where m.cohort_id=p_cohort),'[]'::jsonb)
  );
end; $$;
revoke all on function public.staff_cohort_evidence(uuid,uuid) from public,anon,authenticated;
grant execute on function public.staff_cohort_evidence(uuid,uuid) to service_role;

create function public.issue_completion_certificate(p_participant uuid)
returns public.certificates language plpgsql security definer set search_path='' as $$
declare v_record public.certificates; v_name text;
begin
  perform pg_advisory_xact_lock(hashtext(p_participant::text));
  perform 1 from public.participant_states where participant_id=p_participant for share;
  if not found then raise exception 'A verified saved learning record is required'; end if;
  if (select count(*) from public.module_progress where participant_id=p_participant and status='passed' and best_score_percent>=70 and module_id in ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000004')) <> 4 then
    raise exception 'Complete every module and its required evidence before requesting a certificate' using errcode='23514';
  end if;
  select display_name into v_name from public.profiles where id=p_participant and safe_use_accepted_at is not null and onboarding_completed_at is not null;
  if v_name is null or char_length(trim(v_name))<2 then raise exception 'Complete your profile and safe-use acknowledgement'; end if;
  insert into public.certificates(participant_id,participant_name) values(p_participant,v_name) on conflict(participant_id,rule_version) do nothing returning * into v_record;
  if v_record.id is not null then
    insert into public.audit_events(actor_id,action,resource_id) values(p_participant,'issue_certificate',v_record.id::text);
  else select * into v_record from public.certificates where participant_id=p_participant and rule_version='2026-09-open-course-v1'; end if;
  return v_record;
end; $$;
revoke all on function public.issue_completion_certificate(uuid) from public,anon,authenticated;
grant execute on function public.issue_completion_certificate(uuid) to service_role;

create function public.cleanup_expired_learning_data()
returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
  delete from public.teacher_resources where expires_at<=now();
  get diagnostics n=row_count;
  delete from public.audit_events where created_at<now()-interval '90 days';
  return n;
end; $$;
revoke all on function public.cleanup_expired_learning_data() from public,anon,authenticated;
grant execute on function public.cleanup_expired_learning_data() to service_role;
