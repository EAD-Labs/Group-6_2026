# Environment and deployment plan

## Local

Each developer runs the Next.js application locally with a personal `.env.local`. Local Supabase development data is disposable. Secrets remain outside Git.

## Staging

Use a preview deployment connected to the `main` branch, with a separate Supabase staging project. Every merged pull request must be smoke-tested in staging before release work continues. This is the initial staging approach because it gives the team a shareable URL and supports module-by-module testing.

## Production

Production is a separate deployment and Supabase project. Promote only after integration QA, client review, and the final presentation readiness check. Production credentials and database access are restricted to the release owner.

## Deployment decisions

- Initial approach: Next.js preview/staging deployment with Supabase staging.
- Release gate: pull request review, automated checks, module test report, and manual smoke test.
- Data safety: separate local, staging, and production credentials and databases.
- Rollback: redeploy the last approved production commit and restore the previous database migration if required.
