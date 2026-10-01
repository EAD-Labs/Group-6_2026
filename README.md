# PromptShala

PromptShala helps beginner primary-school teachers understand AI, write classroom prompts, test reusable assistants and turn permitted source material into reviewed teaching drafts.

## Current implementation

The local review build contains four learning modules with **29 lessons**, four retryable quizzes (25 questions), CRAFT practice and prompt library, AI Staffroom and guided Source Studio. All modules are accessible from the start; assessed completion separately requires lessons, quizzes and applicable practical evidence. See the [29-lesson review matrix](docs/content/LESSON_REVIEW.md).

Connected-service code now includes trusted progress saving, server-validated quiz answers, account-scoped recovery, optional Gemini calls, a separate own-source text transformation workspace, private resource expiry/deletion, certificate PDF/verification, staff roles, lesson addenda, cohort reporting, account export/deletion and retention maintenance. The [participant guide](docs/PARTICIPANT_GUIDE.md) and [admin guide](docs/ADMIN_GUIDE.md) explain the workflows and limits.

**Implementation is not production acceptance.** Production Supabase access is restored. Four missing migrations were applied after an encrypted application-data/schema backup; 22 tables have RLS, 29 lessons and four quizzes are published, and privileged functions are server-only. The trusted server key, cleanup secret and recovery origin are configured. The connected production deployment and synthetic-account checks are in progress. Live Gemini, email delivery, complete UAT, measured load, isolated restore rehearsal and the ten-person pilot remain unverified. [Progress and remaining work](progress.md) tracks these boundaries.

## Run locally

Use Node.js 24.19.0 and pnpm 11.19.0:

```sh
cp .env.example .env.local
pnpm install --frozen-lockfile
node scripts/check-environment.mjs
pnpm dev --port 3005
```

Demo reading and practice can run without cloud credentials. For connected accounts, configure the public Supabase URL/publishable key and server-only service key, apply migrations to the intended environment and verify isolation. Live AI additionally requires an approved server-side Gemini configuration. Never commit secrets. The environment checker tests presence only; `--strict` fails when required settings are missing.

```sh
pnpm check
pnpm build
```

The repository includes a standalone Dockerfile. Image/deployment validation is a separate check. Follow [Operations](docs/OPERATIONS.md) for variables, migration rollout, auth/recovery redirects, first-admin setup, daily cleanup and backup/restore rehearsal.

## Stack and contribution

Next.js 16, React 19 and TypeScript; Supabase Auth/PostgreSQL with RLS; optional server-side Gemini; Vitest/Testing Library and local PGlite integration tests. GitHub is the source repository, Vercel the intended deployment platform, and Jira project `KAN` tracks delivery. Read [branching workflow](docs/BRANCHING.md) before contributing; use reviewed pull requests for merges.

Team: Ashok Chilka, Darshan Sonawane, Raghuram Gundi and Vishal Patel.

## Handover and evidence

- [Participant guide](docs/PARTICIPANT_GUIDE.md), [administrator guide](docs/ADMIN_GUIDE.md), [operations and recovery](docs/OPERATIONS.md)
- [HLD v1.3](docs/HLD/PromptShala_HLD_v1.3_CRAFT_Updated.pdf) and [implementation plan](docs/HLD/IMPLEMENTATION_PLAN.md)
- [Final local release review](docs/testing/RELEASE_REVIEW.md) and [19-case UAT and ten-participant pilot plan](docs/testing/UAT_AND_PILOT.md)
- Delivery report drafts: [1 · Foundation/core](docs/testing/DELIVERY_MODULE_1_REPORT.md), [2 · AI practice/workflows](docs/testing/DELIVERY_MODULE_2_REPORT.md), [3 · Certification/admin](docs/testing/DELIVERY_MODULE_3_REPORT.md)
- [Curriculum](docs/content/CURRICULUM.md), [lesson review/source register](docs/content/LESSON_REVIEW.md), [quiz bank](docs/content/QUIZ_BANK.md)
- [Trusted progress and sync](docs/architecture/TRUSTED_PROGRESS_AND_SYNC.md), [AI evaluation](docs/architecture/AI_CRAFT_EVALUATION.md), [CRAFT decision](docs/PROMPT_FRAMEWORK_DECISION.md)
- [Design records](docs/design/), [meeting records](docs/meetings/), [earlier presentation evidence](docs/presentations/)

Dated earlier reports remain historical evidence for their own revision. Use current implementation, test outputs and acceptance records when making release claims.
