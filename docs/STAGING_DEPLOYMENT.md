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
6. Add staging values for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_APP_ENV=staging` to the Vercel Preview environment.
7. Keep `SUPABASE_SERVICE_ROLE_KEY` absent from the web deployment unless a reviewed server-only requirement is introduced.
8. Apply migrations to staging using an authorised maintainer account.
9. Provision only the approved ten pilot users and one or two administrators.

## Deployment flow

1. Developer opens a pull request from a Jira-linked feature branch.
2. GitHub Actions installs the frozen lockfile, lints, type-checks, tests, and builds.
3. Vercel creates an ephemeral Preview for interface review.
4. After review, merge the feature into `staging`.
5. Review pending SQL, back up staging, and apply migrations in filename order.
6. Run the Module 1 smoke test against the stable staging URL.
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
- The quiz remains unavailable until required lessons are complete.
- Three of five answers fails; four of five passes.
- A failed attempt can be retried and remains in attempt history.
- Passing unlocks the next module without reducing the best score.
- API-key copy states that the key is session-only; removing it clears `sessionStorage`.
- Keyboard navigation, visible focus, zoom, and screen-reader feedback are checked.

## Rollback

- Web failure: redeploy the last accepted Vercel deployment.
- Migration failure before commit: roll back the transaction.
- Migration failure after release: apply a reviewed forward-fix migration; do not edit an applied migration file.
- Data problem: stop pilot activity, export evidence, restore the staging backup if approved, and log the incident in Jira.

## Release evidence

Attach the GitHub Actions run, Vercel Preview URL, migration list, smoke-test result, accessibility result, known limitations, and client decision to the relevant Jira issue.

