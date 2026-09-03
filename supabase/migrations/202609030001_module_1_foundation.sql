create type public.app_role as enum ('participant', 'admin');
create type public.module_progress_status as enum ('locked', 'available', 'in_progress', 'passed');
create type public.question_kind as enum ('single_choice', 'multiple_choice');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  role public.app_role not null default 'participant',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  position smallint not null unique check (position > 0),
  estimated_minutes smallint not null check (estimated_minutes > 0),
  pass_threshold_percent smallint not null default 70 check (pass_threshold_percent between 0 and 100),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  slug text not null,
  title text not null,
  position smallint not null check (position > 0),
  is_required boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug),
  unique (module_id, position)
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null unique references public.learning_modules(id) on delete cascade,
  title text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  kind public.question_kind not null,
  position smallint not null check (position > 0),
  points smallint not null default 1 check (points > 0),
  unique (quiz_id, position)
);

create table public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  label text not null,
  option_text text not null,
  position smallint not null check (position > 0),
  unique (question_id, label),
  unique (question_id, position)
);

create table public.quiz_answer_keys (
  question_id uuid primary key references public.quiz_questions(id) on delete cascade,
  correct_option_ids uuid[] not null check (cardinality(correct_option_ids) > 0),
  explanation text not null
);

create table public.module_progress (
  participant_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  status public.module_progress_status not null default 'locked',
  best_score_percent smallint check (best_score_percent between 0 and 100),
  started_at timestamptz,
  passed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (participant_id, module_id)
);

create table public.lesson_progress (
  participant_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (participant_id, lesson_id)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete restrict,
  attempt_number integer not null check (attempt_number > 0),
  score_percent smallint not null check (score_percent between 0 and 100),
  passed boolean not null,
  submitted_at timestamptz not null default now(),
  unique (participant_id, quiz_id, attempt_number)
);

create table public.quiz_responses (
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete restrict,
  selected_option_ids uuid[] not null default '{}',
  is_correct boolean not null,
  primary key (attempt_id, question_id)
);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.learning_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.module_progress enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_responses enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, onboarding_completed_at) on public.profiles to authenticated;
grant select on public.learning_modules, public.lessons, public.quizzes, public.quiz_questions, public.quiz_options to authenticated;
grant select on public.module_progress, public.lesson_progress, public.quiz_attempts, public.quiz_responses to authenticated;

create policy "participants read own profile"
on public.profiles for select to authenticated
using (auth.uid() is not null and (id = auth.uid() or public.is_admin()));

create policy "participants update own profile"
on public.profiles for update to authenticated
using (auth.uid() is not null and id = auth.uid())
with check (auth.uid() is not null and id = auth.uid());

create policy "participants read published modules"
on public.learning_modules for select to authenticated
using (is_published or public.is_admin());

create policy "participants read published lessons"
on public.lessons for select to authenticated
using (is_published or public.is_admin());

create policy "participants read published quizzes"
on public.quizzes for select to authenticated
using (is_published or public.is_admin());

create policy "participants read published questions"
on public.quiz_questions for select to authenticated
using (
  exists (
    select 1 from public.quizzes
    where quizzes.id = quiz_questions.quiz_id and quizzes.is_published
  ) or public.is_admin()
);

create policy "participants read published options"
on public.quiz_options for select to authenticated
using (
  exists (
    select 1
    from public.quiz_questions
    join public.quizzes on quizzes.id = quiz_questions.quiz_id
    where quiz_questions.id = quiz_options.question_id and quizzes.is_published
  ) or public.is_admin()
);

create policy "admins read answer keys"
on public.quiz_answer_keys for select to authenticated
using (public.is_admin());

create policy "participants read own module progress"
on public.module_progress for select to authenticated
using (participant_id = auth.uid() or public.is_admin());

create policy "participants read own lesson progress"
on public.lesson_progress for select to authenticated
using (participant_id = auth.uid() or public.is_admin());

create policy "participants read own attempts"
on public.quiz_attempts for select to authenticated
using (participant_id = auth.uid() or public.is_admin());

create policy "participants read own responses"
on public.quiz_responses for select to authenticated
using (
  exists (
    select 1 from public.quiz_attempts
    where quiz_attempts.id = quiz_responses.attempt_id
      and quiz_attempts.participant_id = auth.uid()
  ) or public.is_admin()
);

insert into public.learning_modules (
  id,
  slug,
  title,
  description,
  position,
  estimated_minutes,
  pass_threshold_percent,
  is_published
) values (
  '00000000-0000-4000-8000-000000000001',
  'module-1',
  'AI Foundations and Responsible Use',
  'Recognise what generative AI can do and apply a responsible teacher-review process.',
  1,
  20,
  70,
  true
);

insert into public.lessons (id, module_id, slug, title, position, is_required, is_published)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'meet-generative-ai', 'Meet generative AI', 1, true, true),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'useful-teacher-tasks', 'Useful teacher tasks', 2, true, true),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'review-before-use', 'Review before use', 3, true, true);
