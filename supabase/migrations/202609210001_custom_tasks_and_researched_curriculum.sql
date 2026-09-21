update public.learning_modules
set
  estimated_minutes = 180,
  description = 'Understand how generative AI works, verify its output and use it responsibly in teaching.',
  updated_at = now()
where id = '00000000-0000-4000-8000-000000000001';

update public.learning_modules
set
  estimated_minutes = 240,
  description = 'Turn teaching intentions into clear prompts, test the output and build a reusable prompt library.',
  is_published = true,
  updated_at = now()
where id = '00000000-0000-4000-8000-000000000002';

insert into public.lessons (
  id,
  module_id,
  slug,
  title,
  position,
  is_required,
  is_published
)
values
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000001', 'verify-ai-claims', 'Hallucinations and verification', 4, true, true),
  ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000001', 'choose-the-right-tool', 'Choose the right AI assistance', 5, true, true),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000001', 'responsible-use-challenge', 'Responsible-use challenge', 6, true, true),
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000002', 'repair-vague-prompt', 'Repair a vague prompt', 1, true, true),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000002', 'context-constraints-examples', 'Context, constraints and examples', 2, true, true),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000002', 'learning-first-planning', 'Lesson planning that begins with learning', 3, true, true),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000002', 'questions-rubrics-feedback', 'Questions, rubrics and actionable feedback', 4, true, true),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000002', 'differentiate-without-lowering', 'Differentiate without lowering the goal', 5, true, true),
  ('00000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000002', 'prompt-laboratory', 'Prompt laboratory: test, compare, revise', 6, true, true),
  ('00000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000002', 'teaching-prompt-library', 'Build your teaching prompt library', 7, true, true)
on conflict (id) do update
set
  module_id = excluded.module_id,
  slug = excluded.slug,
  title = excluded.title,
  position = excluded.position,
  is_required = excluded.is_required,
  is_published = excluded.is_published,
  updated_at = now();

alter table public.craft_prompt_attempts
  drop constraint if exists craft_prompt_attempts_scenario_id_check;

alter table public.craft_prompt_attempts
  add constraint craft_prompt_attempts_scenario_id_check
  check (scenario_id in ('custom', 'concept', 'quiz', 'lesson-plan', 'parent-message', 'worksheet')),
  add column if not exists task_fingerprint text,
  add column if not exists task_source text not null default 'suggestion',
  add column if not exists suggestion_id text;

update public.craft_prompt_attempts
set task_fingerprint = encode(digest(scenario_id, 'sha256'), 'hex')
where task_fingerprint is null;

alter table public.craft_prompt_attempts
  alter column task_fingerprint set not null,
  add constraint craft_prompt_attempts_task_fingerprint_check
  check (char_length(task_fingerprint) = 64),
  add constraint craft_prompt_attempts_task_source_check
  check (task_source in ('custom', 'suggestion')),
  add constraint craft_prompt_attempts_suggestion_id_check
  check (
    suggestion_id is null
    or suggestion_id in ('concept', 'quiz', 'lesson-plan', 'parent-message', 'worksheet')
  );
