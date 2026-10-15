# Environment and deployment plan

Updated 15 October 2026. The user chose the **existing production Supabase project for this release**; no new paid project or deletion of another project is required. Isolation below remains the future test/recovery arrangement, not an implemented claim. Separate staging/full restore/25-user workload remain unexecuted and must not be run against production. Use [current delivery register](final/FINAL_DELIVERY_RECORD.md).

## Local

Each developer runs the Next.js application locally with Node.js 24.19.0 and pnpm 11.19.0 using a personal `.env.local`. Local Supabase development data is disposable and fictional. Secrets remain outside Git.

## Staging

Use a Vercel Preview deployment tracking a protected `staging` branch, with a separate Supabase staging project. Approved feature branches merge into `staging`; every module is smoke-tested at the stable staging URL before a release pull request targets `main`. See `docs/STAGING_DEPLOYMENT.md`.

## Production

Production uses Vercel’s Production environment from `main` and a separate Supabase production project. Promote only after integration QA, client review, and the final presentation readiness check. Production credentials and database access are restricted to the release owner.

## Deployment decisions

- Initial approach: Vercel Preview for the protected `staging` branch with Supabase staging.
- Release gate: pull request review, automated checks, module test report, and manual smoke test.
- Data safety: separate local, staging, and production credentials and databases.
- Rollback: redeploy an approved source revision compatible with the current schema. Use a reviewed forward fix or an authorised verified recovery procedure for data/schema problems; do not blindly reverse applied migrations or restore over production.
