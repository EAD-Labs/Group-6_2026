# Staging Deployment Plan

## Initial approach

Use Vercel for the Next.js application and a dedicated Supabase staging project for authentication and PostgreSQL. A protected `staging` branch receives approved feature branches and has a stable Vercel Preview alias for client demonstrations. Production remains tied to `main` and is not promoted until release approval.

## Environment separation

| Environment | Web application | Supabase | Data |
|---|---|---|---|
| Local | `pnpm dev` | Local Supabase or developer sandbox | Disposable fictional test data |
| Staging | Vercel Preview tracking `staging` | Dedicated staging project | Ten fictional/pilot accounts only |
| Production | Vercel Production tracking `main` | Dedicated production project | Created only after pilot approval |

Never reuse a Supabase project or secret across these environments.

## One-time setup

1. Create separate Supabase staging and production projects in the organisation account.
2. Create a Vercel project connected to `EAD-Labs/Group-6_2026`.
3. Configure `main` as the Vercel production branch but keep production promotion controlled until release approval.
4. Create and protect a `staging` branch in GitHub.
5. Assign the `staging` branch a stable Vercel Preview URL or alias.
6. Add staging values for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` (the exact stable preview origin), and `NEXT_PUBLIC_APP_ENV=staging` to the Vercel Preview environment. Configure Supabase Auth site/redirect URLs for that origin and `/auth/callback`.
7. Add `GEMINI_API_KEY` and `GEMINI_CRAFT_MODEL` as optional server-only values only when enabling approved live AI. Never expose either value with a `NEXT_PUBLIC_` prefix. Guided practice and supported deterministic fallbacks remain available without them.
8. Add `SUPABASE_SERVICE_ROLE_KEY` as a server-only value: trusted progress writes, staff operations, certificate issuance and account deletion require it. Add a separate random `CRON_SECRET` for retention cleanup. Run `node scripts/check-environment.mjs --strict`; this checks presence, not credential validity or connectivity.
9. Apply migrations to staging using an authorised maintainer account.
10. Provision only the approved ten pilot users and one or two administrators.

## Deployment flow

1. Developer opens a pull request from a Jira-linked feature branch.
2. GitHub Actions installs the frozen lockfile, lints, type-checks, tests, and builds.
3. Vercel creates an ephemeral Preview for interface review.
4. After review, merge the feature into `staging`.
5. Review pending SQL, back up staging, and apply migrations in filename order.
6. Run the current four-module smoke and acceptance tests against the stable staging URL, including account recovery, sync retry, role isolation and certificate operations.
7. Record results and defects in Jira.
8. Demonstrate the accepted module to the client.
9. Open a release pull request from `staging` to `main` only after module acceptance.

## Staging smoke test

- `/health` returns status `ok` and environment `staging`.
- Public home and sign-in pages load on mobile and desktop.
- A provisioned participant can sign in and sign out.
- A signed-out visitor is redirected from `/dashboard`, `/learn/**`, and `/settings/**`.
- Participant A cannot read Participant B’s profile, progress, attempts, or responses.
- Module 1 is available after onboarding.
- Lessons and quizzes can be opened for practice; completion requires all of the module's lessons and required evidence.
- Three of five answers fails; four of five passes.
- A failed attempt can be retried and remains in attempt history.
- All four learning modules are accessible from the start. Completion records require their lessons, passed quiz and required practice evidence; retries retain the best score.
- The course's evaluator key stays on the server and never appears in the browser or response payloads. An optional personal key stays in the open tab's memory, is forwarded server-side only for explicit AI requests, and clears on refresh, sign-out and account change.
- The CRAFT endpoint returns five 0–3 scores, a total out of 15 and a safe deterministic fallback.
- Checked CRAFT attempts save the task, prompt text and feedback privately under the signed-in account, together with fingerprints and scores. Apply `202610100002_private_craft_prompts.sql`; verify owner-only reads, server-only writes, account export and account-deletion cascades.
- Keyboard navigation, visible focus, zoom, and screen-reader feedback are checked.
- Drafts remain scoped to the signed-in account; offline changes retry visibly and concurrent saves do not silently overwrite reviewed evidence.
- Recovery emails return to the correct environment, expired links fail safely, and account export/deletion affect only the authenticated participant.
- Certificate issuance requires saved trusted progress; repeated requests are idempotent, PDFs download only for their owner, and public verification reflects revocation without exposing account email or private evidence.
- Staff actions respect facilitator/content-manager/admin scope, and daily cleanup deletes expired synthetic resources without deleting current resources.

See [Operations](OPERATIONS.md) for migration ordering, first-administrator setup, cleanup rehearsal, backup/restore and the remaining release evidence. A local test or a configured health response does not establish deployed acceptance.

## Rollback

- Web failure: redeploy the last accepted Vercel deployment.
- Migration failure before commit: roll back the transaction.
- Migration failure after release: apply a reviewed forward-fix migration; do not edit an applied migration file.
- Data problem: stop pilot activity, export evidence, restore the staging backup if approved, and log the incident in Jira.

## Release evidence

Attach the GitHub Actions run, Vercel Preview URL, migration list, smoke-test result, accessibility result, known limitations, and client decision to the relevant Jira issue.
