-- Apply after the Modules 2/3 and Staffroom migration.
-- Store practice metadata and the participant-authored portfolio, not uploaded source files.
alter table public.profiles add column if not exists source_portfolio jsonb not null default '{}'::jsonb
  check (jsonb_typeof(source_portfolio) = 'object');
grant insert (source_portfolio) on public.profiles to authenticated;
grant update (source_portfolio) on public.profiles to authenticated;
-- Existing profiles RLS continues to restrict participants to their own profile.

update public.learning_modules set is_published = true, estimated_minutes = 260,
  title = 'Working with Teacher-Owned Sources', updated_at = now()
where id = '00000000-0000-4000-8000-000000000004';

insert into public.lessons (id, module_id, slug, title, position, is_required, is_published)
values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000004', 'grounded-vs-fluent', 'Begin with evidence, not a polished answer', 1, true, true),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000004', 'choose-safe-sources', 'Build a source pack you can safely use', 2, true, true),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000004', 'build-source-notebook', 'Set up a notebook with a clear purpose', 3, true, true),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000004', 'ask-with-evidence', 'Write requests that expose the evidence', 4, true, true),
  ('00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000004', 'citation-detective', 'The Citation Detective: inspect three claims', 5, true, true),
  ('00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000004', 'transform-without-drift', 'Turn a source into something teachable', 6, true, true),
  ('00000000-0000-4000-8000-000000000507', '00000000-0000-4000-8000-000000000004', 'review-share-responsibly', 'Give the draft a teacher''s final review', 7, true, true),
  ('00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000004', 'source-to-classroom-capstone', 'Your source-to-classroom portfolio', 8, true, true)
on conflict (id) do update set title = excluded.title, slug = excluded.slug,
  position = excluded.position, is_required = true, is_published = true, updated_at = now();

insert into public.quizzes (id, module_id, title, is_published)
values ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000004', 'Module 4 knowledge check', true)
on conflict (id) do update set title = excluded.title, is_published = true, updated_at = now();
