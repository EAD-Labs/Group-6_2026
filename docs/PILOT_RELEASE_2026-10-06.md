# Open pilot release — 6 October 2026

The production release is **READY** at [PromptShala](https://promptshala.vercel.app). It adds public registration, administrator learning reports and additional chapter checks, removes the guided demo entry and opens every module and chapter for pilot participants.

## Release register

| Item | Recorded value |
| --- | --- |
| Application source at deployment | `9cedd22a9473c44479402ac83a62f7baad40b8f7` |
| Rebased application source | `8392c93` on `feature/KAN-9-open-pilot`; application tree unchanged |
| Deployment | `dpl_E87hy9evmP9E7b1b4gkToQ1tyjFR` |
| Immutable deployment URL | https://promptshala-8y917zfom-sus-co.vercel.app |
| Hosting project | `sus-co/promptshala`, Node 24, Singapore functions |
| Database | Supabase project `atqbligrqsderauzfrqi` |
| Schema changes | `202610060001_pilot_learning_activity.sql`, `202610060002_admin_learning_detail.sql` |
| Assessment version | `2026-10-06-pilot-v2`, plus server question-bank fingerprint |

The two schema files were executed together in an explicit production transaction through the authorised Supabase owner SQL editor, followed by a PostgREST schema refresh. Managed checks confirmed telemetry RLS, no anonymous reads, no direct authenticated inserts, no browser access to the administrator RPC and service-role access to the detail RPC. This records manual SQL execution; it does not claim a CLI migration-history reconciliation.

The client approved public signup and immediate email/password login. Supabase stores password hashes and account identities; participant progress remains linked to its verified user ID. Email syntax is validated, while mailbox ownership is not confirmed in this pilot configuration. Password recovery delivery to general recipients still needs custom SMTP and an approved delivery test.

## Learning and administrator behaviour

There are **75 questions across 29 chapters**: Module 1 has 14, Module 2 has 19, Module 3 has 23 and Module 4 has 19. Each chapter has two or three questions, with larger practical chapters generally receiving three. Chapter checks give feedback and allow retries. Module quizzes require 10/14, 14/19, 17/23 and 14/19 correct answers respectively. Earlier submitted scores remain immutable, including when learners review a result after a question-bank expansion.

Every chapter, practice workspace and module quiz opens without completing a previous module. Completion and certificate requirements continue to reflect actual recorded lessons, assessments and practice evidence. The guided demo login and production authentication bypass are removed.

Administrators can search every account, including users without a cohort, then inspect chapter completion, module scores, submitted quiz history, page visits, active time, click controls, wrong checks, time to first correct answer and a paginated activity timeline. Individual activity is available only to the database administrator role. Signup metadata cannot grant that role. Existing facilitator reporting remains scoped to assigned cohorts.

Active time counts visible interaction, pauses after 60 seconds of inactivity and excludes hidden tabs. It is an approximation of interaction rather than proof of attention. Question checks before submission are distinguished from trusted submitted quiz results. Telemetry contains option/control IDs and page paths; it excludes passwords, form values, URL parameters, private prompts and source text. Events expire after 90 days through the existing daily cleanup function; account deletion cascades them.

## Verification

- `pnpm check`: lint, TypeScript and **264 tests in 41 files** passed.
- `pnpm build`: production build passed; the hosted deployment also reached READY.
- Production health returned HTTP 200 with configured database and AI environment flags. Those flags are configuration evidence, not a newly executed Gemini evaluation.
- **19 production smoke checks** passed using ordinary synthetic email/password sessions: real website registration, immediate sessions, password login, persistent progress/re-login, two-account isolation, module-four access, role-metadata protection, admin endpoint denial, activity persistence/idempotency, server answer grading, RLS, privileged RPC denial, identity/origin guards and rejected legacy demo cookies.
- Chrome verified password sign-in, synced progress, open access to Module 4 with 19 quiz questions, and a two-question chapter with wrong feedback, a correct retry and both checks complete. Ordinary participant reads confirmed that the real browser tracker saved all three checks, page visits and active time. Both temporary accounts were deleted after verification. [Sanitised production evidence](testing/assets/pilot-release/production-smoke.json) and screenshots are stored with this record.
- Managed SQL permission checks confirmed the deployed telemetry boundaries. The local database integration suite also verifies administrator roster/detail aggregation and wrong-to-correct timing against all migration files.

Smoke data and credentials are kept outside Git; the published evidence contains checks and timestamps rather than identifiers, passwords or learner records. See the [participant guide](PARTICIPANT_GUIDE.md), [administrator guide](ADMIN_GUIDE.md) and [operations runbook](OPERATIONS.md).

## Source delivery and remaining handover

The release contains exactly **16 commits**, authored and pushed in four batches of four through the authenticated accounts `luffy-taro-106`, `ashokchilka99`, `vishalpatel04` and `RAGHURAMGUNDI`. The first twelve cover signup, open progression, telemetry and question expansion; the final four cover administrator reports, regression verification and this release record. The branch is submitted through a pull request for teammate review, consistent with the repository merge policy.

The production preflight found three accounts and no administrator. The user subsequently selected an existing account explicitly; its production profile was promoted to `admin` through a guarded owner SQL update on 6 October. Managed queries verified that the selected administrator can produce the all-account roster (four accounts at verification time) and individual page/question reports. The approved identity and assignment screenshot stay outside Git. A fresh real-administrator login remains a user acceptance check; no password was requested or changed. See [sanitised bootstrap evidence](testing/assets/pilot-release/administrator-bootstrap.json).

PR #17 was rebased onto `a743bb9` after PR #16 merged. The conflict in `src/app/api/craft/evaluate/route.ts` was resolved by retaining the account-only sign-in message, consistent with removal of guided demo login. The rebased application tree matches the deployed application exactly. Lint, type checks, all 264 tests and the production build passed again. The release retains 16 commits with four per original author.

Client content approval, general-recipient recovery email, current screen-reader acceptance, isolated backup restore, live provider failure/latency checks and measured participant load remain separate acceptance work. Synthetic smoke checks do not establish teacher outcomes or full pilot acceptance.
