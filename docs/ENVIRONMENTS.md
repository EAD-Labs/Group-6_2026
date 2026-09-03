# Environment and deployment plan

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
- Rollback: redeploy the last approved production commit and restore the previous database migration if required.
