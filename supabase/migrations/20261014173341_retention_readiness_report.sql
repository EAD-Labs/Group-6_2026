-- Planning only. This does not extend the existing cleanup routine or change
-- account deletion/certificate semantics. New long-term deletion stays disabled.
create schema if not exists promptshala_private;
revoke all on schema promptshala_private from public, anon, authenticated;
grant usage on schema promptshala_private to service_role;

create table promptshala_private.retention_policy_versions (
  version text primary key check (char_length(version) between 3 and 80),
  inactivity_months integer not null check (inactivity_months between 1 and 120),
  certificate_years integer not null check (certificate_years between 1 and 20),
  approval_status text not null check (approval_status in ('awaiting_approval', 'approved_for_planning')),
  decision_reference text check (char_length(decision_reference) between 3 and 300),
  long_term_cleanup text not null default 'disabled' check (long_term_cleanup = 'disabled'),
  created_at timestamptz not null default now(),
  check (approval_status <> 'approved_for_planning' or decision_reference is not null)
);
alter table promptshala_private.retention_policy_versions enable row level security;
revoke all on promptshala_private.retention_policy_versions from public, anon, authenticated, service_role;
-- Append-only configuration history. Normal service callers cannot rewrite or
-- remove an earlier policy decision. The database owner retains owner powers.
grant select, insert on promptshala_private.retention_policy_versions to service_role;
insert into promptshala_private.retention_policy_versions
  (version, inactivity_months, certificate_years, approval_status)
  values ('2026-10-14-proposed-v1', 12, 3, 'awaiting_approval');

create function public.retention_readiness_report(p_as_of timestamptz default now())
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  policy promptshala_private.retention_policy_versions;
  inactive_accounts bigint;
  certificates_at_risk bigint;
begin
  if p_as_of is null or not isfinite(p_as_of) then
    raise exception 'A finite report time is required' using errcode = '22023';
  end if;
  select * into strict policy from promptshala_private.retention_policy_versions
    where created_at <= p_as_of order by created_at desc, version desc limit 1;
  -- Sign-in, saved learning and profile activity all postpone the proposed
  -- inactivity date. These are planning signals, not proof of study withdrawal.
  with candidates as (
    select u.id from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.participant_states s on s.participant_id = u.id
    where greatest(u.created_at, u.last_sign_in_at, p.updated_at, s.updated_at)
      < p_as_of - make_interval(months => policy.inactivity_months)
  )
  select count(*), (select count(*) from public.certificates c join candidates x on x.id = c.participant_id)
    into inactive_accounts, certificates_at_risk from candidates;
  return jsonb_build_object(
    'schemaVersion', 'retention-readiness/1', 'asOf', p_as_of, 'mode', 'read_only',
    'policy', jsonb_build_object('version', policy.version, 'approvalStatus', policy.approval_status,
      'decisionReference', policy.decision_reference, 'inactivityMonths', policy.inactivity_months,
      'certificateYears', policy.certificate_years, 'longTermCleanup', policy.long_term_cleanup),
    'existingCleanupCandidates', jsonb_build_object(
      'expiredResources', (select count(*) from public.teacher_resources where expires_at <= p_as_of),
      'auditEventsOver90Days', (select count(*) from public.audit_events where created_at < p_as_of - interval '90 days'),
      'learningEventsOver90Days', (select count(*) from public.learning_events where received_at < p_as_of - interval '90 days')),
    'proposedPolicyCandidates', jsonb_build_object('inactiveAccounts', inactive_accounts,
      'certificatesDeletedWithThoseAccounts', certificates_at_risk,
      'certificatesOlderThanProposedRegisterPeriod', (select count(*) from public.certificates where issued_at < p_as_of - make_interval(years => policy.certificate_years))),
    'requiresDecision', jsonb_build_array('Account and learning-record retention', 'Certificate preservation versus account deletion', 'Backup retention and removal', 'Participant notice and recovery window'),
    'deletedRows', 0
  );
end; $$;
revoke all on function public.retention_readiness_report(timestamptz) from public, anon, authenticated;
grant execute on function public.retention_readiness_report(timestamptz) to service_role;
