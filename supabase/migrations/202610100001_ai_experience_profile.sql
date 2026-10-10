-- Keep optional onboarding answers with the participant's private profile.
alter table public.profiles
  drop constraint if exists profiles_ai_familiarity_check,
  add constraint profiles_ai_familiarity_check check (ai_familiarity in ('New to AI', 'Tried it a few times', 'Use it sometimes', 'Use it regularly')),
  add column ai_tools_used text[] not null default '{}' check (
    ai_tools_used <@ array['ChatGPT', 'Gemini', 'Copilot', 'Claude', 'Other', 'None yet']::text[]
    and cardinality(ai_tools_used) <= 6
    and not ('None yet' = any(ai_tools_used) and cardinality(ai_tools_used) > 1)
  ),
  add column ai_tool_other text not null default '' check (char_length(ai_tool_other) <= 120),
  add column current_ai_use text not null default '' check (char_length(current_ai_use) <= 1000),
  add column ai_use_frequency text not null default 'Prefer not to say' check (
    ai_use_frequency in ('Not yet', 'Occasionally', 'Every week', 'Most days', 'Prefer not to say')
  );

-- The existing service-only save transaction owns profile and state changes.
-- A trigger keeps the new columns atomic with that transaction, including old
-- clients that omit the new optional fields. Profile RLS remains owner-only.
create function public.sync_ai_experience_from_state()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set
    ai_tools_used = array(select jsonb_array_elements_text(coalesce(new.state->'aiToolsUsed', '[]'::jsonb))),
    ai_tool_other = coalesce(new.state->>'aiToolOther', ''),
    current_ai_use = coalesce(new.state->>'currentAiUse', ''),
    ai_use_frequency = coalesce(new.state->>'aiUseFrequency', 'Prefer not to say')
  where id = new.participant_id;
  return new;
end;
$$;
revoke all on function public.sync_ai_experience_from_state() from public, anon, authenticated;
create trigger participant_ai_experience_saved
after insert or update of state on public.participant_states
for each row execute function public.sync_ai_experience_from_state();

update public.profiles as profile set
  ai_tools_used = array(select jsonb_array_elements_text(coalesce(snapshot.state->'aiToolsUsed', '[]'::jsonb))),
  ai_tool_other = coalesce(snapshot.state->>'aiToolOther', ''),
  current_ai_use = coalesce(snapshot.state->>'currentAiUse', ''),
  ai_use_frequency = coalesce(snapshot.state->>'aiUseFrequency', 'Prefer not to say')
from public.participant_states as snapshot
where profile.id = snapshot.participant_id;
