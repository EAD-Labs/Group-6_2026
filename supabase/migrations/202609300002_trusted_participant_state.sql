-- Apply before platform operations. Server routes grade answers; only the service
-- role may commit the resulting state, progress and immutable response snapshots.
alter type public.app_role add value if not exists 'facilitator';
alter type public.app_role add value if not exists 'content_manager';

create table public.participant_states (
  participant_id uuid primary key references public.profiles(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now()
);
create table public.verified_quiz_submissions (
  participant_id uuid not null references public.profiles(id) on delete cascade,
  attempt_id text not null,
  quiz_id uuid not null references public.quizzes(id),
  content_version text not null,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  score_percent smallint not null check (score_percent between 0 and 100),
  passed boolean not null,
  submitted_at timestamptz not null,
  verified_at timestamptz not null default now(),
  primary key (participant_id, attempt_id)
);
alter table public.participant_states enable row level security;
alter table public.verified_quiz_submissions enable row level security;
revoke all on public.participant_states, public.verified_quiz_submissions from anon, authenticated;
grant select on public.participant_states, public.verified_quiz_submissions to authenticated;
grant all on public.participant_states, public.verified_quiz_submissions to service_role;
create policy "owners read state" on public.participant_states for select to authenticated using (participant_id = auth.uid());
create policy "owners read verified assessments" on public.verified_quiz_submissions for select to authenticated using (participant_id = auth.uid());

revoke insert, update, delete on public.module_progress, public.lesson_progress, public.quiz_attempts, public.quiz_responses from authenticated;
revoke insert, update, delete on public.profiles from authenticated;
-- Existing column privileges must also be removed explicitly. The application
-- writes profile changes atomically through the service-only transaction below.
revoke insert (id, display_name, onboarding_completed_at, primary_subject, teaching_level, years_teaching, institution, ai_familiarity, learning_goals, captions_enabled, larger_text, reduced_motion, safe_use_accepted_at, updated_at, craft_practice_count, prompt_library, source_portfolio) on public.profiles from authenticated;
revoke update (display_name, onboarding_completed_at, primary_subject, teaching_level, years_teaching, institution, ai_familiarity, learning_goals, captions_enabled, larger_text, reduced_motion, safe_use_accepted_at, craft_practice_count, prompt_library, source_portfolio) on public.profiles from authenticated;
revoke insert, update, delete on public.assistant_specs from authenticated;
-- Private participant artifacts are not exposed through staff analytics.
drop policy if exists "participants read own profile" on public.profiles;
create policy "participants read own profile" on public.profiles for select to authenticated using (id = auth.uid());
-- Aggregate staff services use selected columns through an authorized server.
-- An administrator's browser session does not expose participant-authored notes.
drop policy if exists "participants read own lesson progress" on public.lesson_progress;
create policy "participants read own lesson progress" on public.lesson_progress for select to authenticated using (participant_id = auth.uid());
drop policy if exists "participants read own responses" on public.quiz_responses;
create policy "participants read own responses" on public.quiz_responses for select to authenticated using (
  exists(select 1 from public.quiz_attempts where id = quiz_responses.attempt_id and participant_id = auth.uid())
);
-- Old scores were supplied by clients; they cannot establish certificate eligibility.
update public.module_progress set status = 'in_progress', passed_at = null where status = 'passed';

create function public.save_participant_state(p_participant_id uuid, p_expected_revision bigint, p_state jsonb, p_progress jsonb, p_attempts jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; item jsonb; completed text[]; item_slug text; new_revision bigint;
begin
  if p_expected_revision < 0 or jsonb_typeof(p_state) <> 'object' then raise exception 'invalid state'; end if;
  insert into public.participant_states(participant_id, state) values(p_participant_id, '{}'::jsonb) on conflict do nothing;
  select revision into current_revision from public.participant_states where participant_id = p_participant_id for update;
  if current_revision <> p_expected_revision then raise exception 'revision_conflict' using errcode = '40001'; end if;

  update public.profiles set display_name = p_state->>'displayName', institution = nullif(p_state->>'institution', ''),
    primary_subject = p_state->>'primarySubject', teaching_level = p_state->>'teachingLevel',
    years_teaching = (p_state->>'yearsTeaching')::smallint, ai_familiarity = p_state->>'aiFamiliarity',
    learning_goals = array(select jsonb_array_elements_text(p_state->'goals')),
    captions_enabled = (p_state->>'captionsEnabled')::boolean, larger_text = (p_state->>'largerText')::boolean,
    reduced_motion = (p_state->>'reducedMotion')::boolean,
    safe_use_accepted_at = case when (p_state->>'safeUseAccepted')::boolean then coalesce(safe_use_accepted_at, now()) else null end,
    onboarding_completed_at = case when (p_state->>'onboardingCompleted')::boolean then coalesce(onboarding_completed_at, now()) else null end,
    craft_practice_count = (p_state->>'craftPracticeCount')::integer, prompt_library = p_state->'promptLibrary',
    source_portfolio = p_state->'sourcePortfolio', updated_at = now()
  where id = p_participant_id;
  if not found then raise exception 'profile_missing'; end if;

  completed = array(select jsonb_array_elements_text((p_state->'completedLessonSlugs') || (p_state->'moduleTwoCompletedLessonIds') || (p_state->'moduleThreeCompletedLessonIds') || (p_state->'moduleFourCompletedLessonIds')));
  foreach item_slug in array completed loop
    insert into public.lesson_progress(participant_id, lesson_id, completed_at, evidence)
      select p_participant_id, id, now(), p_state->'lessonEvidence'->>item_slug from public.lessons where slug = item_slug
    on conflict (participant_id, lesson_id) do update set completed_at = coalesce(public.lesson_progress.completed_at, excluded.completed_at), evidence = excluded.evidence, updated_at = now();
  end loop;

  for item in select * from jsonb_array_elements(p_attempts) loop
    insert into public.verified_quiz_submissions(participant_id, attempt_id, quiz_id, content_version, answers, score_percent, passed, submitted_at)
      values(p_participant_id, item->>'id', (item->>'quizId')::uuid, item->>'contentVersion', item->'answers', (item->>'scorePercent')::smallint, (item->>'passed')::boolean, (item->>'attemptedAt')::timestamptz)
    on conflict (participant_id, attempt_id) do nothing;
    insert into public.quiz_attempts(participant_id, quiz_id, attempt_number, score_percent, passed, submitted_at)
      values(p_participant_id, (item->>'quizId')::uuid, (item->>'attemptNumber')::integer, (item->>'scorePercent')::smallint, (item->>'passed')::boolean, (item->>'attemptedAt')::timestamptz)
    on conflict (participant_id, quiz_id, attempt_number) do nothing;
  end loop;

  for item in select * from jsonb_array_elements(p_progress) loop
    insert into public.module_progress(participant_id, module_id, status, best_score_percent, started_at, passed_at)
      values(p_participant_id, (item->>'moduleId')::uuid, (item->>'status')::public.module_progress_status, (item->>'scorePercent')::smallint, now(), case when item->>'status' = 'passed' then now() else null end)
    on conflict (participant_id, module_id) do update set status = excluded.status, best_score_percent = excluded.best_score_percent,
      passed_at = case when excluded.status = 'passed' then coalesce(public.module_progress.passed_at, now()) else null end, updated_at = now();
  end loop;
  for item in select * from jsonb_array_elements(p_state->'assistants') loop
    if exists(select 1 from public.assistant_specs where id = (item->>'id')::uuid and participant_id <> p_participant_id) then raise exception 'assistant ownership conflict'; end if;
    insert into public.assistant_specs(id, participant_id, spec, deleted_at)
      values((item->>'id')::uuid, p_participant_id, item, nullif(item->>'deletedAt', '')::timestamptz)
    on conflict (id) do update set spec = excluded.spec, deleted_at = excluded.deleted_at, updated_at = now();
  end loop;
  new_revision = current_revision + 1;
  update public.participant_states set state = p_state, revision = new_revision, updated_at = now() where participant_id = p_participant_id;
  return new_revision;
end;
$$;
revoke all on function public.save_participant_state(uuid,bigint,jsonb,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.save_participant_state(uuid,bigint,jsonb,jsonb,jsonb) to service_role;

create table public.ai_rate_windows (
  participant_id uuid not null references public.profiles(id) on delete cascade,
  operation text not null,
  window_start timestamptz not null,
  requests integer not null default 1,
  primary key(participant_id, operation, window_start)
);
alter table public.ai_rate_windows enable row level security;
revoke all on public.ai_rate_windows from public, anon, authenticated;
grant all on public.ai_rate_windows to service_role;
create function public.consume_ai_rate_limit(p_participant_id uuid, p_operation text, p_limit integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare request_count integer;
begin
  delete from public.ai_rate_windows where window_start < now() - interval '1 day';
  insert into public.ai_rate_windows(participant_id, operation, window_start)
    values(p_participant_id, p_operation, date_trunc('minute', now()))
  on conflict(participant_id, operation, window_start) do update set requests = public.ai_rate_windows.requests + 1
  returning requests into request_count;
  return request_count <= least(greatest(p_limit, 1), 12);
end;
$$;
revoke all on function public.consume_ai_rate_limit(uuid,text,integer) from public, anon, authenticated;
grant execute on function public.consume_ai_rate_limit(uuid,text,integer) to service_role;
