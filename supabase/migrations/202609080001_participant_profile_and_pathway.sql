alter table public.profiles
  add column primary_subject text,
  add column teaching_level text check (teaching_level in ('Classes 5–7', 'Classes 8–10', 'Both')),
  add column years_teaching smallint check (years_teaching between 0 and 70),
  add column institution text check (institution is null or char_length(institution) <= 160),
  add column ai_familiarity text check (ai_familiarity in ('New to AI', 'Tried it a few times', 'Use it sometimes')),
  add column learning_goals text[] not null default '{}',
  add column captions_enabled boolean not null default true,
  add column larger_text boolean not null default false,
  add column reduced_motion boolean not null default false,
  add column safe_use_accepted_at timestamptz;

grant update (
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
  safe_use_accepted_at
) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1), 'Participant')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

update public.learning_modules
set
  title = 'AI Foundations and Responsible Use',
  description = 'Understand what generative AI can do and use a safe teacher-review process.',
  estimated_minutes = 25,
  updated_at = now()
where id = '00000000-0000-4000-8000-000000000001';

insert into public.learning_modules (
  id,
  slug,
  title,
  description,
  position,
  estimated_minutes,
  pass_threshold_percent,
  is_published
)
values
  (
    '00000000-0000-4000-8000-000000000002',
    'module-2',
    'Classroom Prompt Writing',
    'Turn classroom needs into clear prompts using the CRAFT framework.',
    2,
    35,
    70,
    false
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'module-3',
    'Reusable Teacher Assistants',
    'Convert a strong prompt into a reusable assistant for recurring teacher tasks.',
    3,
    35,
    70,
    false
  ),
  (
    '00000000-0000-4000-8000-000000000004',
    'module-4',
    'Working with Teacher-Owned Sources',
    'Use teacher-owned sources to build grounded worksheets, quizzes and slide outlines.',
    4,
    40,
    70,
    false
  )
on conflict (id) do update
set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  position = excluded.position,
  estimated_minutes = excluded.estimated_minutes,
  pass_threshold_percent = excluded.pass_threshold_percent,
  updated_at = now();
