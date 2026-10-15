# PromptShala

PromptShala helps beginner school teachers understand AI, write classroom requests, test reusable teaching helpers and turn permitted source material into reviewed teaching drafts. The HLD's primary persona teaches Classes 5-10; examples can be adapted to other learner groups.

## Current implementation

The course contains four learning modules with **29 lessons**, four retryable quizzes (**75 base questions**), two or three chapter checks per lesson, CRAFT practice/history, guided teaching helpers and Source Studio. All modules are accessible from the start; assessed completion separately requires lessons, verified quizzes and applicable practice. Final staff tools author immutable lesson/cohort packages and question-bank releases with a 70-100% passing score, preserving historical verified passes. Administrator reports include account progress, scores, page activity and retry timing. See the [current evidence register](docs/final/FINAL_DELIVERY_RECORD.md), [pilot history](docs/PILOT_RELEASE_2026-10-06.md) and [lesson review](docs/content/LESSON_REVIEW.md).

Connected-service code now includes trusted progress saving, server-validated quiz answers, account-scoped recovery, optional Gemini calls, a separate own-source text transformation workspace, private resource expiry/deletion, certificate PDF/verification, staff roles, lesson addenda, cohort reporting, account export/deletion and retention maintenance. The [participant guide](docs/PARTICIPANT_GUIDE.md) and [admin guide](docs/ADMIN_GUIDE.md) explain the workflows and limits.

**Implementation and acceptance are recorded separately.** [Production](https://promptshala.vercel.app) has dated synthetic evidence for account isolation, saved progress, server grading, certificates, staff operations and expiry cleanup. The first approved administrator was assigned on 6 October. An encrypted affected-table backup and local restore/migration rehearsal were completed; full managed recovery remains a separate check. Real successful Gemini/email delivery, complete client UAT, hosted load, manual accessibility review and the ten-person field study require actual evidence. Use the [current delivery register](docs/final/FINAL_DELIVERY_RECORD.md) for the reviewed revision, deployment and limits rather than an older test count or screenshot.

The final working tree adds **Try PromptShala** at `/try`: an independent, sign-in-free classroom exercise using local CRAFT feedback and source scaffolds. **Teaching Review Lab** at `/review-lab` accepts portable versioned rubrics, records human evidence ratings and compares revisions. Neither public path sends content to AI or records course completion. Verify final deployment before sharing these routes as live. On 15 October the user chose the existing production database for release and deferred emails; isolated staging/restore/load and actual recovery delivery are not claimed. Public health sampling and a Linux container smoke workflow support operational review; sample success is not a measured availability SLO.

## Run locally

Use Node.js 24.19.0 and pnpm 11.19.0:

```sh
cp .env.example .env.local
pnpm install --frozen-lockfile
node scripts/check-environment.mjs
pnpm dev --port 3005
```

Public email/password signup is available for the open pilot; accounts require connected Supabase services. For connected accounts, configure the public Supabase URL/publishable key and server-only service key, apply migrations to the intended environment and verify isolation. Live AI can use the course’s server-side Gemini configuration or an optional participant key held only in the open tab. The latest migrations add AI-use onboarding answers and private CRAFT task/prompt/feedback history; apply them before releasing these features. Never commit secrets. The environment checker tests presence only; `--strict` fails when required settings are missing.

```sh
pnpm check
pnpm build
pnpm test:e2e
```

The repository includes a standalone Dockerfile. Image/deployment validation is a separate check. Follow [Operations](docs/OPERATIONS.md) for variables, migration rollout, auth/recovery redirects, first-admin setup, daily cleanup and backup/restore rehearsal.

## Stack and contribution

Next.js 16, React 19 and TypeScript; Supabase Auth/PostgreSQL with RLS; optional server-side Gemini; Vitest/Testing Library and local PGlite integration tests. GitHub is the source repository, Vercel the production deployment platform, and Jira project `KAN` tracks delivery. Read [branching workflow](docs/BRANCHING.md) before contributing; use reviewed pull requests for merges.

Team (HLD names): Ashok Kumar, Darshan Sonawane, Raghuram Gundi and Vishal Patel. Account display names may differ in GitHub/Jira contribution records.

## Handover and evidence

- [Participant guide](docs/PARTICIPANT_GUIDE.md), [administrator guide](docs/ADMIN_GUIDE.md), [operations and recovery](docs/OPERATIONS.md)
- [Final course delivery](docs/final/README.md): A0 poster, independent visitor kit, speaking script, client decision packet and handover checklist
- [Print-ready poster PDF](artifacts/final-presentation/ET617_Group6_Poster.pdf) and [preview](artifacts/final-presentation/poster-preview.png), included for a fresh clone; [final local QA](artifacts/qa/final-validation-2026-10-15.json): 435 tests in 66 files, build, lint/types and 27 browser journeys passed
- [Ten-teacher field-study preparation](docs/study/README.md): separate consent, parallel tasks, observation forms, blank CSVs and analysis plan
- [HLD v1.3](docs/HLD/PromptShala_HLD_v1.3_CRAFT_Updated.pdf) and [implementation plan](docs/HLD/IMPLEMENTATION_PLAN.md)
- [Local and production release review](docs/testing/RELEASE_REVIEW.md) and [19-case UAT and ten-participant pilot plan](docs/testing/UAT_AND_PILOT.md)
- Current review-ready delivery reports: [1 · Foundation/core](docs/testing/DELIVERY_MODULE_1_REPORT.md), [2 · AI practice/workflows](docs/testing/DELIVERY_MODULE_2_REPORT.md), [3 · Certification/admin](docs/testing/DELIVERY_MODULE_3_REPORT.md); client sign-off remains separate
- [Curriculum](docs/content/CURRICULUM.md), [lesson review/source register](docs/content/LESSON_REVIEW.md), [quiz bank](docs/content/QUIZ_BANK.md)
- [Trusted progress and sync](docs/architecture/TRUSTED_PROGRESS_AND_SYNC.md), [AI evaluation](docs/architecture/AI_CRAFT_EVALUATION.md), [CRAFT decision](docs/PROMPT_FRAMEWORK_DECISION.md)
- [Design records](docs/design/), [meeting records](docs/meetings/), [earlier presentation evidence](docs/presentations/)

Dated earlier reports remain historical evidence for their own revision. Use current implementation, test outputs and acceptance records when making release claims.
