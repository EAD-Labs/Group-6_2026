-- A knowledge-check release is global, immutable and independent of previously
-- verified passes. Mandatory lessons/practice/safe-use requirements stay fixed.
create table public.assessment_releases (
  id uuid primary key default gen_random_uuid(),
  module_number smallint not null check(module_number between 1 and 4),
  title text not null check(char_length(title) between 3 and 180),
  questions jsonb not null check(jsonb_typeof(questions)='array' and jsonb_array_length(questions) between 5 and 40 and octet_length(questions::text)<=250000),
  pass_threshold smallint not null check(pass_threshold between 70 and 100),
  version integer not null check(version>0),
  status text not null default 'draft' check(status in ('draft','published','archived')),
  author_id uuid references public.profiles(id) on delete set null,
  published_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique(module_number,version)
);
create unique index one_published_assessment_per_module on public.assessment_releases(module_number) where status='published';
create index assessment_releases_author_idx on public.assessment_releases(author_id);
create index assessment_releases_publisher_idx on public.assessment_releases(published_by);
alter table public.assessment_releases enable row level security;
revoke all on public.assessment_releases from public,anon,authenticated;
grant select on public.assessment_releases to authenticated;
grant all on public.assessment_releases to service_role;
create policy "published checks staff drafts or own historical checks" on public.assessment_releases for select to authenticated using (
  status='published' or public.is_admin() or author_id=(select auth.uid())
  or exists(select 1 from public.verified_quiz_submissions submission where submission.participant_id=(select auth.uid()) and submission.content_version='assessment:'||assessment_releases.id::text)
);
create function public.protect_assessment_release()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if tg_op='DELETE' then raise exception 'Assessment releases cannot be deleted'; end if;
  if (new.id,new.module_number,new.title,new.questions,new.pass_threshold,new.version,new.created_at)
    is distinct from (old.id,old.module_number,old.title,old.questions,old.pass_threshold,old.version,old.created_at)
    or (new.author_id is distinct from old.author_id and new.author_id is not null)
    or (old.published_at is not null and new.published_at is distinct from old.published_at)
  then raise exception 'Assessment releases are immutable; save a new draft'; end if;
  return new;
end; $$;
revoke all on function public.protect_assessment_release() from public,anon,authenticated;
create trigger assessment_release_is_immutable before update or delete on public.assessment_releases for each row execute function public.protect_assessment_release();

create function public.assessment_release_operation(p_actor uuid,p_action text,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_role text; v_id uuid; v_module smallint; v_version integer; v_questions jsonb; question jsonb; choice jsonb; v_correct jsonb; v_option_ids jsonb; v_target public.assessment_releases;
begin
  select role::text into v_role from public.profiles where id=p_actor;
  if v_role is null or v_role not in ('admin','facilitator','content_manager') then raise exception 'Staff access required' using errcode='42501'; end if;
  if p_action='save_assessment_release' then
    v_module := (p_payload->>'module')::smallint; v_questions := p_payload->'questions';
    if v_module not between 1 and 4 or (p_payload->>'passThresholdPercent')::smallint not between 70 and 100
      or jsonb_typeof(v_questions) is distinct from 'array' then raise exception 'Valid module, questions and passing score required'; end if;
    if jsonb_array_length(v_questions) not between 5 and 40 then raise exception 'A knowledge check needs 5–40 questions'; end if;
    if (select count(distinct value->>'id') from jsonb_array_elements(v_questions))<>jsonb_array_length(v_questions) then raise exception 'Duplicate question identifiers'; end if;
    for question in select value from jsonb_array_elements(v_questions) loop
      if jsonb_typeof(question)<>'object' or coalesce(question->>'id','') !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$'
        or question->>'id' in ('constructor','toString','toLocaleString','valueOf','hasOwnProperty','isPrototypeOf','propertyIsEnumerable')
        or coalesce(question->>'kind','') not in ('single','multiple')
        or coalesce(char_length(trim(question->>'prompt')),0) not between 10 and 2500
        or coalesce(char_length(trim(question->>'concept')),0) not between 3 and 200
        or coalesce(char_length(trim(question->>'explanation')),0) not between 10 and 3000
        or not exists(select 1 from public.lessons lesson where lesson.slug=question->>'lessonSlug' and lesson.module_id=('00000000-0000-4000-8000-00000000000'||v_module::text)::uuid)
        or jsonb_typeof(question->'options') is distinct from 'array' or jsonb_typeof(question->'correctOptionIds') is distinct from 'array'
      then raise exception 'Invalid question or lesson'; end if;
      if jsonb_array_length(question->'options') not between 2 and 6 or jsonb_array_length(question->'correctOptionIds')<1
        or (question->>'kind'='single' and jsonb_array_length(question->'correctOptionIds')<>1)
      then raise exception 'Invalid answer choices'; end if;
      if (select count(distinct value->>'id') from jsonb_array_elements(question->'options'))<>jsonb_array_length(question->'options')
        or (select count(distinct value) from jsonb_array_elements(question->'correctOptionIds'))<>jsonb_array_length(question->'correctOptionIds')
      then raise exception 'Duplicate answer choices'; end if;
      for choice in select value from jsonb_array_elements(question->'options') loop
        if coalesce(choice->>'id','') !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$' or choice->>'id' in ('constructor','toString','toLocaleString','valueOf','hasOwnProperty','isPrototypeOf','propertyIsEnumerable') or coalesce(char_length(trim(choice->>'label')),0) not between 1 and 1500 then raise exception 'Invalid answer choice'; end if;
      end loop;
      select jsonb_agg(value->'id') into v_option_ids from jsonb_array_elements(question->'options');
      for v_correct in select value from jsonb_array_elements(question->'correctOptionIds') loop
        if jsonb_typeof(v_correct)<>'string' or not v_option_ids @> jsonb_build_array(v_correct) then raise exception 'Correct choice not found'; end if;
      end loop;
    end loop;
    perform pg_advisory_xact_lock(hashtext('assessment:'||v_module::text));
    select coalesce(max(version),0)+1 into v_version from public.assessment_releases where module_number=v_module;
    insert into public.assessment_releases(module_number,title,questions,pass_threshold,version,author_id)
      values(v_module,p_payload->>'title',v_questions,(p_payload->>'passThresholdPercent')::smallint,v_version,p_actor) returning id into v_id;
  elsif p_action in ('publish_assessment_release','archive_assessment_release') then
    if v_role<>'admin' then raise exception 'Administrator approval required' using errcode='42501'; end if;
    v_id := (p_payload->>'id')::uuid;
    select * into v_target from public.assessment_releases where id=v_id;
    if not found then raise exception 'Assessment release not found'; end if;
    perform pg_advisory_xact_lock(hashtext('assessment:'||v_target.module_number::text));
    select * into v_target from public.assessment_releases where id=v_id for update;
    v_version := v_target.version; v_module := v_target.module_number;
    if p_action='publish_assessment_release' then
      update public.assessment_releases set status='archived' where module_number=v_module and status='published' and id<>v_id;
      update public.assessment_releases set status='published',published_at=coalesce(published_at,now()),published_by=p_actor where id=v_id;
    else update public.assessment_releases set status='archived' where id=v_id; end if;
  else raise exception 'Unknown assessment action'; end if;
  insert into public.audit_events(actor_id,action,resource_id,details) values(p_actor,p_action,v_id::text,jsonb_build_object('module',v_module,'version',v_version));
  return jsonb_build_object('id',v_id,'version',v_version);
end; $$;
revoke all on function public.assessment_release_operation(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.assessment_release_operation(uuid,text,jsonb) to service_role;

alter table public.verified_quiz_submissions add column pass_threshold smallint not null default 70 check(pass_threshold between 70 and 100),
  add column assessment_release_id uuid references public.assessment_releases(id) on delete restrict,
  add column grading_receipt jsonb check(grading_receipt is null or jsonb_typeof(grading_receipt)='object');
create index verified_submission_release_idx on public.verified_quiz_submissions(assessment_release_id);
create function public.capture_assessment_release_on_submission()
returns trigger language plpgsql security invoker set search_path='' as $$
declare v_release public.assessment_releases;
begin
  if new.grading_receipt is not null then
    perform pg_advisory_xact_lock(hashtext('assessment:'||right(new.quiz_id::text,1)));
  end if;
  if new.content_version like 'assessment:%' then
    select * into v_release from public.assessment_releases where id=substring(new.content_version from 12)::uuid;
    if not found or new.quiz_id<>('00000000-0000-4000-8000-00000000020'||v_release.module_number::text)::uuid then raise exception 'Assessment version does not match this module'; end if;
    if new.grading_receipt is not null and v_release.status<>'published' then raise exception 'Assessment publication changed'; end if;
    new.assessment_release_id := v_release.id; new.pass_threshold := v_release.pass_threshold;
  else
    if new.grading_receipt is not null and exists(select 1 from public.assessment_releases where module_number=right(new.quiz_id::text,1)::integer and status='published') then raise exception 'Assessment publication changed'; end if;
    new.assessment_release_id := null; new.pass_threshold := 70;
  end if;
  new.passed := new.score_percent>=new.pass_threshold;
  if new.grading_receipt is not null and (new.grading_receipt->>'id' is distinct from new.attempt_id
    or new.grading_receipt->>'contentVersion' is distinct from new.content_version
    or new.grading_receipt->'answers' is distinct from new.answers
    or (new.grading_receipt->>'passThresholdPercent')::integer is distinct from new.pass_threshold
    or (new.grading_receipt->>'scorePercent')::integer is distinct from new.score_percent
    or (new.grading_receipt->>'passed')::boolean is distinct from new.passed)
  then raise exception 'Grading receipt does not match this verified result'; end if;
  return new;
end; $$;
revoke all on function public.capture_assessment_release_on_submission() from public,anon,authenticated;
create trigger verified_attempt_captures_assessment_release before insert on public.verified_quiz_submissions for each row execute function public.capture_assessment_release_on_submission();
create function public.protect_verified_assessment()
returns trigger language plpgsql security invoker set search_path='' as $$
begin if new is distinct from old then raise exception 'Verified assessment attempts are immutable'; end if; return new; end; $$;
revoke all on function public.protect_verified_assessment() from public,anon,authenticated;
create trigger verified_assessment_is_immutable before update on public.verified_quiz_submissions for each row execute function public.protect_verified_assessment();

-- New certificates retain the passing bank and threshold from the participant's
-- verified history. Previously issued certificates are not reinterpreted.
alter table public.certificates add column assessment_evidence jsonb;
create function public.capture_certificate_assessment_evidence()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  new.assessment_evidence := coalesce((select jsonb_agg(jsonb_build_object('module',chosen.module,'contentVersion',chosen.content_version,'passThresholdPercent',chosen.pass_threshold,'scorePercent',chosen.score_percent)) from (
    select distinct on (quiz_id) right(quiz_id::text,1)::integer as module,content_version,pass_threshold,score_percent
    from public.verified_quiz_submissions where participant_id=new.participant_id and passed
      and quiz_id in ('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000204')
    order by quiz_id,submitted_at,attempt_id
  ) chosen),'[]'::jsonb);
  return new;
end; $$;
revoke all on function public.capture_certificate_assessment_evidence() from public,anon,authenticated;
create trigger certificate_captures_assessment_evidence before insert on public.certificates for each row execute function public.capture_certificate_assessment_evidence();
create function public.protect_certificate_assessment_evidence()
returns trigger language plpgsql security invoker set search_path='' as $$
begin if new.assessment_evidence is distinct from old.assessment_evidence then raise exception 'Issued certificate evidence is immutable'; end if; return new; end; $$;
revoke all on function public.protect_certificate_assessment_evidence() from public,anon,authenticated;
create trigger certificate_assessment_evidence_is_immutable before update of assessment_evidence on public.certificates for each row execute function public.protect_certificate_assessment_evidence();
