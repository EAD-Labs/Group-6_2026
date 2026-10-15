# PromptShala operations and recovery

Updated 15 October 2026. The [open pilot release](PILOT_RELEASE_2026-10-06.md) adds public immediate-login signup and administrator learning telemetry; earlier execution evidence retains its original revision/date. **Runbook; actual outcomes are in [the release review](testing/RELEASE_REVIEW.md) and [current delivery register](final/FINAL_DELIVERY_RECORD.md).** Production owner access is restored; database RLS/server grants, account isolation, saving, grading, certificates, staff operations and expiry cleanup have dated synthetic checks. The daily automatic job returned 200 at 09:05 India time on 2 October. The first approved real administrator was assigned on 6 October. Approved encrypted affected-table backups and integrity/local migration rehearsals exist. Complete managed recovery, successful live AI, current-release UAT/load/accessibility and monitored operation require their own evidence. **On 15 October the user chose the existing production Supabase project for this release and deferred emails for now.** Do not provision a paid staging project, delete another project or enable SMTP to complete this release. Separate recovery/load rehearsal remains unexecuted; password-recovery delivery is a recorded deferral, not a passed test.

The final source adds public `/try`/`/review-lab`, notice/rubric versions, provider changes, structured lesson/cohort packages and immutable knowledge-check/threshold releases. Final assessment migration and ordinary-role write denials were verified on 15 October without changing existing profile/state/CRAFT counts. Equivalent cached checks in 27 RLS policies and 11 relationship indexes were applied; performance advisors reported zero warnings. Keep the known security-helper/plan-level password limitations visible. Deploy the reviewed source, then verify actual live routes before poster submission on 20 October or the 23 October demonstration. The [handover checklist](final/HANDOVER_CHECKLIST.md) records receiving-owner execution.

## Ownership and environment register

Before operating a real cohort, record an accountable application owner, Supabase owner, Vercel owner, curriculum reviewer, privacy contact and alternate incident contact. Record the source revision, environment URL, Supabase project reference, deployment identifier, migration list and review date. Keep credentials in the approved secret store, outside this document and Git.

### Student-team working responsibility

This is the working allocation for release support, not an institution's acceptance of long-term ownership. Confirm reachability before study/event sessions; do not imply unattended 24-hour coverage.

| Responsibility | Named student-team lead | Required action |
| --- | --- | --- |
| Release coordination and first incident triage | Darshan Sonawane | Check Actions and deployment status before sessions and daily during the pilot; keep the actual incident/decision register and coordinate the receiving owner. |
| Runtime, database and recovery investigation | Raghuram Gundi | Investigate health/configuration/cron/database symptoms through authorised access; preserve counts/status/request IDs and rehearse fixes on an isolated target when available. |
| Regression, browser and permission verification | Vishal Patel | Reproduce defects with fictional data; retain current test/retest evidence and verify restored learner/staff boundaries. |
| Curriculum, participant guidance and educator feedback | Ashok Kumar | Check published learning materials, teacher-facing guidance and consented feedback; escalate content/source/privacy concerns without collecting private pupil material. |

Receiving application/service owner: ______. Alternate incident contact: ______. Contact channel/service hours: ______. Owner acknowledgement/reference/date: ______. These fields remain blank until real handover; student code delivery cannot supply institutional sign-off.

Use separate staging and production databases, credentials and participant records. Never point a local test or a preview at production to bypass a configuration problem. Protect staging access and use synthetic participants. Vercel team/project roles determine the owner's available actions; a deployment URL or a successful local build does not grant management access. See [Vercel access roles](https://vercel.com/docs/rbac/access-roles).

## Local setup and configuration

Use Node.js 24.19.0 (`.nvmrc`) and pnpm 11.19.0. The package engine restricts hosted runtime selection to Node 24; Vercel applies supported minor/patch updates within that major. See [Vercel Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). From the application directory:

```sh
cp .env.example .env.local
pnpm install --frozen-lockfile
node scripts/check-environment.mjs
pnpm dev --port 3005
```

Fill `.env.local` through the approved local secret mechanism. Connected credentials are required for participant login and account progress. The guided demo entry point and authentication bypass have been removed. For a connected release, set:

| Variable | Purpose and boundary |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Intended environment's Supabase project URL; bundled into the browser build. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public client key; safe only with correct RLS and server checks. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only trusted progress, staff, resource and certificate operations. Never use a `NEXT_PUBLIC_` prefix. |
| `NEXT_PUBLIC_APP_ENV` | Local, staging or production display/configuration label. |
| `NEXT_PUBLIC_SITE_URL` | Exact public site origin for recovery redirects; local example is `http://localhost:3005`. |
| `GEMINI_API_KEY` | Optional server-only provider credential for live operations. Without it, supported local/fallback paths remain; live assistant calls cannot run. |
| `GEMINI_CRAFT_MODEL` | Configured provider model used by the current integration. The repository default is configuration, not evidence that a provider call succeeds. Verify availability and response compatibility before enabling. |
| `CRON_SECRET` | Server-only random bearer secret for retention maintenance; do not reuse a database or provider key. |

`node scripts/check-environment.mjs --strict` reports missing required settings without printing their values and exits nonzero if any are missing. It checks presence only. `GET /api/health` likewise reports configuration flags, not database connectivity, valid credentials, applied migrations or successful AI evaluation.

Run `pnpm check` and `pnpm build` for release validation. Record command, source revision, date, exit status and output artifact. A Dockerfile provides a non-root standalone Next.js runtime. Supply `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_ENV` through Docker build arguments; public settings are frozen into the application build. Supply server secrets only at runtime. Do not bake `.env.local` into an image. A Dockerfile in the repository is not a successful image build or a container smoke test. The certificate download trace includes both bundled Noto fonts; the container also copies `public/`. Verify English, Hindi and mixed-script sample downloads in the deployed runtime.

## Database rollout and first administrator

1. Inventory the target project's migration history and compare it with every file in `supabase/migrations`, in filename order. Identify the exact project before any write. Follow the current [Supabase migration workflow](https://supabase.com/docs/guides/deployment/database-migrations); `db push` changes the linked remote database.
2. Record a recoverable pre-change backup and rehearse the relevant restore path in an isolated project. Keep the app version compatible with the schema during rollout.
3. Apply pending migrations to staging first. The latest trusted-progress migration removes reliance on client-claimed quiz passes; legacy score-only attempts require retaking the quiz. Notify any affected test or real participants before enabling it. The platform migration adds cohorts, addenda, certificates, audit events, resource retention and privileged functions.
4. Confirm RLS and grants on all participant/staff tables, owner-only resource reads, service-only privileged functions, and the auth profile-creation trigger. Do not substitute a service-role client for participant tests: doing so bypasses the boundary being tested.
5. Provision the first approved operator through Supabase Authentication → Users. The open pilot enables public email/password signup with immediate login; email format is validated but mailbox ownership is not confirmed. The authorised Supabase owner verifies its identity and UUID, then assigns `admin` in `public.profiles` through the secure database administration channel. Record who authorised and performed this bootstrap; it occurs outside the app audit flow. Verify the profile trigger prevents self-assigned role metadata from promoting other new users.
6. Test two participants and each staff role through ordinary authenticated sessions. Verify the missing-service, expired-session and forbidden-role cases. Only after staging acceptance should the owner repeat the controlled production rollout.

Do not use `db reset` on a live project. Do not repair migration history or remove policies merely to make a failing deployment proceed. Investigate the mismatch and retain the failure evidence.

## Authentication and deployment

Set Supabase Auth site/redirect URLs for the intended origins and callback. Preserve the approved immediate password signup/login policy. **Email configuration and observed recovery delivery were deferred by the user on 15 October; custom SMTP was OFF in the 14 October dashboard check.** Do not send email or seek SMTP credentials for the current release. `/account-recovery` intentionally gives a uniform response and must not be represented as proof of delivery. If the owner later reactivates email, approve provider/sender/recipient and test arrival, expired links and complete reset; the callback returns to `/reset-password`, a valid session and matching 12-128 character password are required, and success signs out for a fresh login.

Set Vercel variables in the correct Development, Preview or Production environment and redeploy for changed variables to take effect. Public variables are build-time values. Verify the deployed origin and callback configuration after each domain change. See [Vercel environment variables](https://vercel.com/docs/environment-variables).

For each deployment record the revision and migration state, run health and real session smoke checks, verify headers, load a lesson and a saved draft, perform a quiz retry, request/download a test certificate and inspect public verification. Run the complete acceptance cases before calling the deployment accepted. Historical preview URLs in earlier reports do not establish the state of this revision.

## Retention and cleanup

The final code provides read-only `GET /api/maintenance/report`, authenticated with the `CRON_SECRET` bearer and calling service-only `retention_readiness_report()`. It returns aggregate inventory and disabled long-term-policy state; it does not delete accounts or certificate records. Append-only policy history is stored in `promptshala_private.retention_policy_versions`. The initial twelve-month inactivity/three-year certificate proposal explicitly awaits approval, and review cannot enable destructive cleanup through this report. Verify migration/deployment and denied unauthorised access before treating it as operational.

| Data | Implemented behaviour | Remaining operational decision |
| --- | --- | --- |
| Privately saved teacher sources/drafts | `expires_at` is 30 days from creation; updates do not renew it. Owner queries exclude expired rows. Cleanup physically deletes expired rows. | Verify daily job, deleted-row evidence and backup retention. |
| Own-source browser draft | Account-scoped local draft expires after 30 days; participant can clear it. | Explain shared-device and exported-copy limits. |
| Learning activity | Cleanup deletes events older than 90 days; account deletion cascades events. | Review approximate timing and verify daily retention runs. |
| Audit events | Cleanup deletes events older than 90 days. | Verify execution and approved incident/archive needs. |
| Accounts, progress and assistant records | Kept until account deletion or an authorised future policy; account deletion cascades dependent records. | HLD proposal of 12 months after inactivity has no automated job. Approve and implement before promising it. |
| Certificates | Connected register supports issuance/revocation; account deletion can remove its certificate records. | HLD three-year retention is not implemented as a separate archive; resolve its interaction with deletion. |
| Downloads, external AI copies and backups | Not retrieved by application deletion. | Document provider/backup policy and access with the owner. |

The own-source workspace stores text in PostgreSQL; it does not create a private object-storage bucket. If file storage is added later, its objects require their own access, deletion and backup controls.

`GET /api/maintenance` requires `Authorization: Bearer <CRON_SECRET>`. It invokes the service-only `cleanup_expired_learning_data()` function. `vercel.json` requests a daily run at **03:00 UTC**. The current Hobby plan has a one-hour scheduling window: **08:30–09:30 India time**. The production schedule is registered, the secret is configured and a manual Vercel invocation returned 200. The automatic run on 2 October returned 200 at 09:05 India time; continue monitoring subsequent executions. See [Vercel cron-job security](https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs).

Expected results: missing/incorrect secret → `401`; successful cleanup → `200` with `{ "deletedResources": N }`; service/database failure → `503`. The count is deleted teacher-resource rows, not deleted audit events. Do not put the secret in a query string, screenshot or shared terminal transcript.

Rehearse in staging with synthetic rows: one expired resource, one unexpired resource, one audit event older than 90 days and one recent event. Record baseline counts, invoke through an authorised scheduler or secure HTTP client, confirm only the expired/old records disappear, verify an expired resource was inaccessible even before purge, and rerun to confirm the count is zero. Record timestamps, status and counts without source text. A synthetic-only production rehearsal passed on 2 October 2026: the owner could not read the expired resource before purge; a manual Vercel invocation removed the expired resource and old audit event while preserving both current rows; a repeat function call deleted zero resources. See [retention evidence](testing/assets/release-review/production-retention-smoke.json). The subsequent automatic run is separately verified by its `vercel-cron/1.0` request and HTTP 200 [execution evidence](testing/assets/release-review/production-automatic-maintenance.json). A repeated 503 or missed execution needs operator investigation.

## Backup and restore rehearsal

The owner must choose an actual backup arrangement for the project plan and state a recovery-point objective (acceptable lost work) and recovery-time objective (acceptable outage). Check available backups and their dates in the provider dashboard. Supabase backup availability depends on the plan; database backups do not contain Storage API objects. See [Supabase database backups](https://supabase.com/docs/guides/platform/backups).

Use the provider's current [CLI backup/restore procedure](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) for a logical export/restore, including roles, schema, data, migration history and any managed-schema customisations. This project has an auth trigger and RLS that must survive. Keep exports encrypted, access-controlled and outside the repository; record a checksum and backup timestamp. Secrets, email-provider settings, redirect configuration and deployment variables need a separate controlled configuration inventory.

Rehearsal procedure:

1. Select a staging backup containing known synthetic participants A and B, a cohort, addendum versions, quiz attempts, an assistant, a teacher resource and a certificate. Record identifiers and expected counts, not private payloads.
2. Create an isolated restore target, with outbound email and live AI disabled. Confirm in writing that its project reference differs from production and the source. Never practise by overwriting the live project.
3. Restore using the provider's supported path. Preserve migration history and necessary auth-trigger customisations. Record start/end times, tool versions and any errors; do not silently ignore a partially failed restore.
4. Point a protected test deployment at the restored project. Check table counts and migration versions; log in as A and B through ordinary accounts; verify each sees only their own state and resource. Test staff cohort scope, a saved quiz attempt, a newly saved change, published addendum and certificate download/verification.
5. Run maintenance against deliberately expired synthetic records and verify the restored permissions and cleanup function. Confirm the newly restored system does not send real recovery messages or provider requests unexpectedly.
6. Compare the achieved recovery point/time with the agreed objectives. Record failures and corrective work. Delete the isolated rehearsal project and temporary exports according to the approved backup policy after review; preserve the non-sensitive rehearsal report.

Record template: source revision; source and restore project references; backup timestamp/checksum; approved operators; start/end; counts before/after; migration/RLS/auth results; measured data loss/outage; deviations; corrective owner/date; reviewer decision. The approved 10 October backup contains the three affected application tables and schema catalogue; decryption integrity and an isolated local PostgreSQL-compatible restore/migration rehearsal passed. It does not constitute a full managed PostgreSQL/Auth recovery exercise. The complete procedure above remains a separate gate.

## Monitoring, incidents and rollback

Monitor deployment failures, API error rates, provider timeouts, sync conflicts, database capacity and cron failures without logging raw prompts, source text, tokens or full account exports. Health configuration flags alone cannot detect these failures. Keep a secure incident record with time, affected environment, symptom, request identifier when available, impact and action.

### Maintained public health samples

`scripts/probe-availability.ts` reads only the canonical `/health` and `/api/health` routes, with a five-second per-endpoint deadline, no redirects/credentials, a 4 KB response limit and safe fixed failure codes. It checks the public response contract, never calls AI/Auth/email and stores no response body or exception detail. Run with Node 24:

```sh
node scripts/probe-availability.ts artifacts/operations/availability.json
```

The command exits nonzero for an unhealthy sample; its JSON retains endpoint/status/duration/outcome so a failure is reviewable. The origin is fixed to production; an explicit loopback option is reserved for the container smoke test. A timeout or network failure remains a failed sample, not a substituted success.

`.github/workflows/public-health.yml` schedules a sample every 30 minutes and permits manual dispatch after merging to the default branch. It uploads the safe report even on failure and fails the job for unhealthy status. GitHub scheduling may be delayed or skipped; keep missing runs visible. The workflow does not send email/Slack messages or configure a paging service. The first [actual 15 October public sample](../artifacts/operations/availability-2026-10-15.json) found both routes healthy; scheduled CI execution still needs actual run evidence.

**These are public-endpoint samples, not full application availability or a measured 99.5% result.** Configuration can be healthy while login, writes, AI or learning fails. Any future availability summary must state the actual measurement window, expected/received/missing samples, failures, downtime interpretation and exclusions. A sample success rate alone is not elapsed-time uptime or an accepted HLD SLO.

### Failure triage and escalation

1. Darshan reviews the failed run and its safe artifact. Repeat one manual sample and check the public site; record whether failure was endpoint, network, timeout, protection page or wrong release/environment. Do not erase the original failure.
2. Raghuram checks deployment status, recent compatible changes, provider/DB health, limits and maintenance through authorised dashboards. Preserve non-sensitive diagnostics. A passing health sample does not close a failed learner report.
3. Vishal reproduces the affected learner/staff task with synthetic data and records severity, exact release, expected/actual behaviour and retest. Ashok reviews any content/safe-use explanation affected by the issue.
4. During an active study/demo, pause the affected task when privacy/data integrity or a primary journey is at risk, and use the declared fallback. Darshan records the incident and the receiving owner's decision; external communication follows the owner's approved process. No automated outbound messages are implemented here.
5. Use a compatible application rollback or reviewed forward fix; do not reverse migrations blindly. Re-run the sample and affected genuine journey after correction, record the new result alongside the failed run, then resume under the recorded decision.

Incident fields: actual date/time; source/deployment; symptom; severity/impact; safe evidence; lead; next review; correction; retest; owner decision. Owner contact/review date remain blank until designated: ______.

### Portable container verification

The Docker install layer copies `pnpm-workspace.yaml` and `patches/` before the frozen install, so security overrides and dependency patches participate in reproducible installation. `.dockerignore` excludes credentials, local outputs, private evidence and unrelated delivery material. The runner is UID 1001.

`.github/workflows/container-smoke.yml` builds on Linux with only explicit public fictional settings, starts a read-only non-root runtime with temporary `/tmp`, probes its test-environment health and loads the public home/visitor/review pages without provider/database secrets. It uploads safe health evidence and removes the temporary runtime. **No Docker executable is installed on the local authoring host; a successful Linux CI run is required before claiming the container works.** This is a portability smoke, not managed service, mixed-script certificate or institutional hosting acceptance.

For a suspected data exposure, restrict the affected feature/environment, preserve non-sensitive diagnostic evidence, involve the owner/privacy contact and rotate a compromised credential. Verify the corrected access boundary with separate accounts before reopening. Follow the organisation's incident process for participant communication; this runbook does not define legal reporting obligations.

An application rollback must use a revision compatible with the current schema and trusted-progress contract. Database reversal is a planned recovery operation: stop conflicting writes, choose a verified recovery point, assess loss of newer work and obtain the owner's operational decision. Do not blindly roll back migrations or restore over a live database. Re-run the affected acceptance cases and document the resulting state.

## Release evidence to retain

Keep the current build/test report, 19-case acceptance record, permission/isolation evidence, accessibility review, measured 25-user performance report, backup/restore rehearsal, successful maintenance execution, content approval, three delivery reports and handover sign-off. Use [UAT and pilot plan](testing/UAT_AND_PILOT.md) for the pending work. This repository supplies the runbooks; it does not contain a completed production acceptance or a completed pilot.

The isolated `scripts/isolated-load.ts` harness is ready for representative **25 distinct synthetic-account** staging work; it rejects production targets and excludes AI/email workloads. Run it only against a verified isolated staging/test deployment. Its existence and local guard tests are not hosted measurements. Retain ramp/duration, actual session count, errors and distributions from a real run. Use [final 15 October QA](../artifacts/qa/final-validation-2026-10-15.json) and [current register](final/FINAL_DELIVERY_RECORD.md) for evidence boundaries.
