# PromptShala operations and recovery

Updated 1 October 2026. **Runbook, not execution evidence.** Cloud migration, email recovery, live Gemini, production deployment, scheduled cleanup and backup/restore rehearsal have not been verified in this work session. Local Supabase/Gemini configuration is absent. The current Vercel connection cannot access team `sus-co` (403); the owner must reauthenticate or restore authorised access before release work can proceed.

## Ownership and environment register

Before operating a real cohort, record an accountable application owner, Supabase owner, Vercel owner, curriculum reviewer, privacy contact and alternate incident contact. Record the source revision, environment URL, Supabase project reference, deployment identifier, migration list and review date. Keep credentials in the approved secret store, outside this document and Git.

Use separate staging and production databases, credentials and participant records. Never point a local test or a preview at production to bypass a configuration problem. Protect staging access and use synthetic participants. Vercel team/project roles determine the owner's available actions; a deployment URL or a successful local build does not grant management access. See [Vercel access roles](https://vercel.com/docs/rbac/access-roles).

## Local setup and configuration

Use Node.js 24.19.0 (`.nvmrc`) and pnpm 11.19.0. From the application directory:

```sh
cp .env.example .env.local
pnpm install --frozen-lockfile
node scripts/check-environment.mjs
pnpm dev --port 3005
```

Fill `.env.local` through the approved local secret mechanism. Demo reading and practice work without connected credentials. For a connected release, set:

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
5. Create the first operator account through the normal account flow. The authorised Supabase owner verifies its identity and UUID, then assigns `admin` in `public.profiles` through the secure database administration channel. Record who authorised and performed this bootstrap; it occurs outside the app audit flow. Verify the profile trigger prevents self-assigned role metadata from promoting other new users.
6. Test two participants and each staff role through ordinary authenticated sessions. Verify the missing-service, expired-session and forbidden-role cases. Only after staging acceptance should the owner repeat the controlled production rollout.

Do not use `db reset` on a live project. Do not repair migration history or remove policies merely to make a failing deployment proceed. Investigate the mismatch and retain the failure evidence.

## Authentication and deployment

Set the Supabase Auth site URL and allowed redirect URLs to the intended origins and callback route. Configure the approved email provider/templates and test signup, sign-in, sign-out, expired links and recovery on staging. `/account-recovery` intentionally gives a uniform email response; this does not confirm email delivery. The callback returns to `/reset-password`; a valid session and matching 12–128 character password are required. Successful reset signs the account out for a fresh sign-in.

Set Vercel variables in the correct Development, Preview or Production environment and redeploy for changed variables to take effect. Public variables are build-time values. Verify the deployed origin and callback configuration after each domain change. See [Vercel environment variables](https://vercel.com/docs/environment-variables).

For each deployment record the revision and migration state, run health and real session smoke checks, verify headers, load a lesson and a saved draft, perform a quiz retry, request/download a test certificate and inspect public verification. Run the complete acceptance cases before calling the deployment accepted. Historical preview URLs in earlier reports do not establish the state of this revision.

## Retention and cleanup

| Data | Implemented behaviour | Remaining operational decision |
| --- | --- | --- |
| Privately saved teacher sources/drafts | `expires_at` is 30 days from creation; updates do not renew it. Owner queries exclude expired rows. Cleanup physically deletes expired rows. | Verify daily job, deleted-row evidence and backup retention. |
| Own-source browser draft | Account-scoped local draft expires after 30 days; participant can clear it. | Explain shared-device and exported-copy limits. |
| Audit events | Cleanup deletes events older than 90 days. | Verify execution and approved incident/archive needs. |
| Accounts, progress and assistant records | Kept until account deletion or an authorised future policy; account deletion cascades dependent records. | HLD proposal of 12 months after inactivity has no automated job. Approve and implement before promising it. |
| Certificates | Connected register supports issuance/revocation; account deletion can remove its certificate records. | HLD three-year retention is not implemented as a separate archive; resolve its interaction with deletion. |
| Downloads, external AI copies and backups | Not retrieved by application deletion. | Document provider/backup policy and access with the owner. |

The own-source workspace stores text in PostgreSQL; it does not create a private object-storage bucket. If file storage is added later, its objects require their own access, deletion and backup controls.

`GET /api/maintenance` requires `Authorization: Bearer <CRON_SECRET>`. It invokes the service-only `cleanup_expired_learning_data()` function. `vercel.json` requests a daily run at **03:00 UTC**. Configure the secret before deployment, verify the platform schedule actually exists, and monitor executions. See [Vercel cron-job security](https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs).

Expected results: missing/incorrect secret → `401`; successful cleanup → `200` with `{ "deletedResources": N }`; service/database failure → `503`. The count is deleted teacher-resource rows, not deleted audit events. Do not put the secret in a query string, screenshot or shared terminal transcript.

Rehearse in staging with synthetic rows: one expired resource, one unexpired resource, one audit event older than 90 days and one recent event. Record baseline counts, invoke through an authorised scheduler or secure HTTP client, confirm only the expired/old records disappear, verify an expired resource was inaccessible even before purge, and rerun to confirm the count is zero. Record timestamps, status and counts without source text. This rehearsal has not yet run. A repeated 503 or missed execution needs operator investigation; do not mark retention verified from code alone.

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

Record template: source revision; source and restore project references; backup timestamp/checksum; approved operators; start/end; counts before/after; migration/RLS/auth results; measured data loss/outage; deviations; corrective owner/date; reviewer decision. **No backup or restore result is recorded yet.**

## Monitoring, incidents and rollback

Monitor deployment failures, API error rates, provider timeouts, sync conflicts, database capacity and cron failures without logging raw prompts, source text, tokens or full account exports. Health configuration flags alone cannot detect these failures. Keep a secure incident record with time, affected environment, symptom, request identifier when available, impact and action.

For a suspected data exposure, restrict the affected feature/environment, preserve non-sensitive diagnostic evidence, involve the owner/privacy contact and rotate a compromised credential. Verify the corrected access boundary with separate accounts before reopening. Follow the organisation's incident process for participant communication; this runbook does not define legal reporting obligations.

An application rollback must use a revision compatible with the current schema and trusted-progress contract. Database reversal is a planned recovery operation: stop conflicting writes, choose a verified recovery point, assess loss of newer work and obtain the owner's operational decision. Do not blindly roll back migrations or restore over a live database. Re-run the affected acceptance cases and document the resulting state.

## Release evidence to retain

Keep the current build/test report, 19-case acceptance record, permission/isolation evidence, accessibility review, measured 25-user performance report, backup/restore rehearsal, successful maintenance execution, content approval, three delivery reports and handover sign-off. Use [UAT and pilot plan](testing/UAT_AND_PILOT.md) for the pending work. This repository supplies the runbooks; it does not contain a completed production acceptance or a completed pilot.
