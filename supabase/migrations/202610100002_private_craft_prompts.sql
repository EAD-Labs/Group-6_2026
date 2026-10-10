-- Save submitted CRAFT text privately, alongside its validated feedback.
-- Historical fingerprint-only attempts retain null text; nothing is reconstructed.
alter table public.craft_prompt_attempts
  add column task_text text,
  add column prompt_text text,
  add column evaluation jsonb,
  add constraint craft_prompt_attempts_task_text_check check (task_text is null or char_length(task_text) between 3 and 300),
  add constraint craft_prompt_attempts_prompt_text_check check (prompt_text is null or char_length(prompt_text) between 3 and 2500),
  add constraint craft_prompt_attempts_evaluation_check check (evaluation is null or jsonb_typeof(evaluation) = 'object'),
  add constraint craft_prompt_attempts_text_pair_check check ((task_text is null) = (prompt_text is null));

-- Private prompt text must not appear in the administrator/facilitator workspace.
drop policy if exists "participants read own craft attempts" on public.craft_prompt_attempts;
create policy "participants read own craft attempts"
on public.craft_prompt_attempts for select to authenticated
using (participant_id = auth.uid());

-- The server verifies identity and feedback before writing a submitted attempt.
drop policy if exists "participants create own craft attempts" on public.craft_prompt_attempts;
revoke insert on public.craft_prompt_attempts from authenticated;
grant select on public.craft_prompt_attempts to authenticated;
grant insert on public.craft_prompt_attempts to service_role;

create index craft_prompt_attempts_owner_created_idx
on public.craft_prompt_attempts (participant_id, created_at desc);

-- The existing participant_id -> profiles -> auth.users cascade includes these
-- new fields when a participant permanently deletes their account.
