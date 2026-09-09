insert into public.quizzes (id, module_id, title, is_published)
values (
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000001',
  'Module 1 knowledge check',
  true
)
on conflict (id) do update
set title = excluded.title, is_published = excluded.is_published, updated_at = now();

grant insert (
  id,
  display_name,
  onboarding_completed_at,
  primary_subject,
  teaching_level,
  years_teaching,
  institution,
  ai_familiarity,
  learning_goals,
  captions_enabled,
  larger_text,
  reduced_motion,
  safe_use_accepted_at,
  updated_at
) on public.profiles to authenticated;
grant insert, update on public.module_progress to authenticated;
grant insert, update on public.lesson_progress to authenticated;
grant insert, update on public.quiz_attempts to authenticated;

create policy "participants create own profile"
on public.profiles for insert to authenticated
with check (id = auth.uid());

create policy "participants create own module progress"
on public.module_progress for insert to authenticated
with check (participant_id = auth.uid());

create policy "participants update own module progress"
on public.module_progress for update to authenticated
using (participant_id = auth.uid())
with check (participant_id = auth.uid());

create policy "participants create own lesson progress"
on public.lesson_progress for insert to authenticated
with check (participant_id = auth.uid());

create policy "participants update own lesson progress"
on public.lesson_progress for update to authenticated
using (participant_id = auth.uid())
with check (participant_id = auth.uid());

create policy "participants create own attempts"
on public.quiz_attempts for insert to authenticated
with check (participant_id = auth.uid());

create policy "participants update own attempts"
on public.quiz_attempts for update to authenticated
using (participant_id = auth.uid())
with check (participant_id = auth.uid());

create table public.craft_prompt_attempts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.profiles(id) on delete cascade,
  scenario_id text not null check (scenario_id in ('concept', 'quiz', 'lesson-plan', 'parent-message', 'worksheet')),
  prompt_fingerprint text not null check (char_length(prompt_fingerprint) = 64),
  dimension_scores jsonb not null check (jsonb_typeof(dimension_scores) = 'object'),
  overall_score smallint not null check (overall_score between 0 and 15),
  score_percent smallint not null check (score_percent between 0 and 100),
  evaluation_source text not null check (evaluation_source in ('gemini', 'rule-based')),
  model text not null,
  safety_flags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.craft_prompt_attempts enable row level security;
grant select, insert on public.craft_prompt_attempts to authenticated;

create policy "participants read own craft attempts"
on public.craft_prompt_attempts for select to authenticated
using (participant_id = auth.uid() or public.is_admin());

create policy "participants create own craft attempts"
on public.craft_prompt_attempts for insert to authenticated
with check (participant_id = auth.uid());
