-- New evidence has an explicit version. No historic version is backfilled.
alter table public.profiles add column safe_use_notice_version text
  check (safe_use_notice_version is null or safe_use_notice_version ~ '^[a-zA-Z0-9.-]{3,80}$');
alter table public.craft_prompt_attempts add column rubric_version text
  check (rubric_version is null or rubric_version ~ '^[a-zA-Z0-9.-]{3,80}$');

create table public.consent_receipts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.profiles(id) on delete cascade,
  notice_version text not null check (notice_version ~ '^[a-zA-Z0-9.-]{3,80}$'),
  accepted_at timestamptz not null default now()
);
alter table public.consent_receipts enable row level security;
revoke all on public.consent_receipts from anon, authenticated;
grant select on public.consent_receipts to authenticated;
grant all on public.consent_receipts to service_role;
create policy "participant reads own consent receipts" on public.consent_receipts
for select to authenticated using (participant_id = (select auth.uid()));
create index consent_receipts_participant_idx on public.consent_receipts(participant_id, accepted_at desc);

-- Only service_role can write participant_states. This trigger extends its
-- existing atomic save transaction; clients cannot directly issue receipts.
create function public.sync_consent_version_from_state()
returns trigger language plpgsql security definer set search_path = '' as $$
declare version_value text; previous_version text;
begin
  version_value := case when coalesce((new.state->>'safeUseAccepted')::boolean, false)
    then nullif(new.state->>'safeUseNoticeVersion', '') else null end;
  select safe_use_notice_version into previous_version from public.profiles
    where id = new.participant_id for update;
  -- Omitted versions from legacy clients cannot erase a recorded version.
  if version_value is null and coalesce((new.state->>'safeUseAccepted')::boolean, false) then
    return new;
  end if;
  if version_value is not null and version_value is distinct from previous_version then
    insert into public.consent_receipts(participant_id, notice_version)
      values(new.participant_id, version_value);
    update public.profiles set safe_use_accepted_at = now()
      where id = new.participant_id;
  end if;
  update public.profiles set safe_use_notice_version = version_value
    where id = new.participant_id;
  return new;
end;
$$;
revoke all on function public.sync_consent_version_from_state() from public, anon, authenticated;
create trigger participant_consent_version_saved
after insert or update of state on public.participant_states
for each row execute function public.sync_consent_version_from_state();
