# Application Stack Decision

## Confirmed stack

PromptShala will use:

- Next.js 16 App Router for the web application and server routes;
- React 19 for the participant interface;
- TypeScript 5.9 in strict mode;
- Supabase Auth with `@supabase/ssr` cookie sessions;
- Supabase PostgreSQL with Row Level Security for application data;
- Vitest, Testing Library, and jsdom for Module 1 unit and component tests;
- GitHub Actions for pull-request validation; and
- Vercel Preview plus a separate Supabase staging project for client testing.

## Why this stack

- One TypeScript codebase supports responsive participant pages, server-rendered authenticated routes, and server endpoints.
- App Router provides layouts, loading/error states, route handlers, and server components without a separate web server.
- Supabase combines authentication, PostgreSQL, migrations, and database-level authorisation suitable for a ten-user pilot.
- Row Level Security protects participant data even when requests use the generated data API.
- Vercel provides shareable Preview deployments for review without changing the production site.
- The team can test pure learning rules without a network connection or paid AI service.

## Version policy

The baseline uses exact dependency versions in `package.json` and a committed `pnpm-lock.yaml`. Node.js 24.19.0 and pnpm 11.19.0 are used locally and in CI. Dependency updates require a dedicated pull request with lint, type-check, test, build, and migration review.

## Official references

- Next.js installation and Node.js requirements: https://nextjs.org/docs/app/getting-started/installation
- Next.js deployment options: https://nextjs.org/docs/app/getting-started/deploying
- Supabase server-side authentication: https://supabase.com/docs/guides/auth/server-side
- Supabase SSR client setup: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Vercel environments: https://vercel.com/docs/deployments/environments

## Boundaries

- Module 1 works without an AI API.
- No participant Gemini key is stored in Supabase or application environment variables.
- Static export is not selected because authenticated server rendering and future grading routes require a server runtime.
- Production deployment remains gated until the pilot schema, security policies, accessibility checks, and client acceptance are complete.

