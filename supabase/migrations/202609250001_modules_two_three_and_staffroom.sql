-- Participant learning records and private Agent Passports for Modules 2 and 3.
alter table public.lesson_progress add column if not exists evidence text;
alter table public.profiles add column if not exists craft_practice_count integer not null default 0 check (craft_practice_count >= 0);
alter table public.profiles add column if not exists prompt_library jsonb not null default '[]'::jsonb check (jsonb_typeof(prompt_library) = 'array');
grant update (craft_practice_count) on public.profiles to authenticated;
grant insert (craft_practice_count) on public.profiles to authenticated;
grant update (prompt_library) on public.profiles to authenticated;
grant insert (prompt_library) on public.profiles to authenticated;
update public.learning_modules set is_published = true, estimated_minutes = 360, updated_at = now()
where id = '00000000-0000-4000-8000-000000000003';

insert into public.lessons (id, module_id, slug, title, position, is_required, is_published)
values
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000003', 'prompt-versus-assistant', 'Meet the AI Staffroom', 1, true, true),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000003', 'assistant-passport', 'Write an assistant job description', 2, true, true),
  ('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000003', 'build-assistant', 'Configure and run a reusable assistant', 3, true, true),
  ('00000000-0000-4000-8000-000000000406', '00000000-0000-4000-8000-000000000003', 'source-pack-gaps', 'Supply a knowledge pack and handle gaps', 4, true, true),
  ('00000000-0000-4000-8000-000000000407', '00000000-0000-4000-8000-000000000003', 'classroom-rehearsal', 'Rehearse teaching with a simulated learner', 5, true, true),
  ('00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000003', 'test-two-contexts', 'The Repair Clinic', 6, true, true),
  ('00000000-0000-4000-8000-000000000408', '00000000-0000-4000-8000-000000000003', 'workflow-handoffs', 'Build a teaching workflow with handoffs', 7, true, true),
  ('00000000-0000-4000-8000-000000000405', '00000000-0000-4000-8000-000000000003', 'repair-and-remix', 'Staffroom exchange and transfer challenge', 8, true, true)
on conflict (id) do update set title = excluded.title, is_published = true, updated_at = now();

insert into public.quizzes (id, module_id, title, is_published)
values
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000002', 'Module 2 knowledge check', true),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000003', 'Module 3 knowledge check', true)
on conflict (id) do update set title = excluded.title, is_published = true, updated_at = now();

create table public.assistant_specs (
  id uuid primary key,
  participant_id uuid not null references public.profiles(id) on delete cascade,
  spec jsonb not null check (jsonb_typeof(spec) = 'object'),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index assistant_specs_participant_idx on public.assistant_specs (participant_id, updated_at desc);
alter table public.assistant_specs enable row level security;
revoke all on public.assistant_specs from anon, authenticated;
grant select, insert, update on public.assistant_specs to authenticated;
create policy "participants read own assistants" on public.assistant_specs
  for select to authenticated using (participant_id = auth.uid());
create policy "participants create own assistants" on public.assistant_specs
  for insert to authenticated with check (participant_id = auth.uid());
create policy "participants update own assistants" on public.assistant_specs
  for update to authenticated using (participant_id = auth.uid()) with check (participant_id = auth.uid());
