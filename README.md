# PromptShala

PromptShala is a practical AI-literacy platform for beginner primary-school teachers. It helps educators understand AI at a high level, write better prompts, create reusable Gemini-style assistants, and use notebook-based tools for classroom preparation.

## Project status

The client review build implements all four participant learning modules: 29 lessons, four retryable knowledge checks, the CRAFT lab, AI Staffroom and Source Studio. All modules are accessible from the start; assessed completion requires each module's lessons, quiz and practice evidence. Source Studio includes three original fictional packs, claim audits, five editable artifact formats and a portable review portfolio.

The application includes Supabase persistence code and a server-side CRAFT evaluator with a deterministic fallback. The extended database migrations, authenticated isolation checks, live AI configuration, certification/administration and final production acceptance remain release requirements. The preview currently uses local practice state and fallback AI evaluation.

## Confirmed stack

- Next.js 16, React 19 and TypeScript for the web application
- Supabase Auth and PostgreSQL with Row Level Security
- GitHub for source control and pull requests
- Vercel Preview with a separate Supabase staging project
- Jira project `KAN` for PromptShala delivery tracking

## Local setup

1. Install Node.js 24.19.0 and pnpm 11.19.0.
2. Copy `.env.example` to `.env.local`.
3. Add local Supabase URL and publishable key values. Add `GEMINI_API_KEY` only for live CRAFT evaluation. Never commit secrets.
4. Install dependencies with `pnpm install --frozen-lockfile`.
5. Start the development server with `pnpm dev`.
6. Run validation with `pnpm check` and a production build with `pnpm build`.

## Team

- Ashok Chilka
- Darshan Sonawane
- Raghuram Gundi
- Vishal Patel

## Contribution workflow

Read `docs/BRANCHING.md` before creating a branch. All changes require a pull request and review before merging to `main`.

## Documentation

- HLD: `docs/HLD/PromptShala_HLD_v1.3_CRAFT_Updated.pdf`
- Meeting minutes: `docs/meetings/`
- Environment plan: `docs/ENVIRONMENTS.md`
- Prompt framework decision: `docs/PROMPT_FRAMEWORK_DECISION.md`
- Shared colour system: `docs/design/COLOR_SYSTEM.md`
- Participant UX plan: `docs/design/PARTICIPANT_UX_PLAN.md`
- Google Stitch prompts: `docs/design/STITCH_PROMPTS.md`
- Generated Stitch project manifest: `docs/design/STITCH_PROJECT.md`
- Client prototype walkthrough: `docs/design/CLIENT_PROTOTYPE_WALKTHROUGH.md`
- Learning content package: `docs/content/README.md`
- Participant curriculum: `docs/content/CURRICULUM.md`
- Client progress report: `progress.md`
- Module 4 implementation and review checks: `docs/testing/MODULE_4_REVIEW.md`
- Stack decision: `docs/architecture/STACK_DECISION.md`
- Authentication and roles: `docs/architecture/AUTHENTICATION_AND_ROLES.md`
- Module 1 data model: `docs/architecture/MODULE_1_DATA_MODEL.md`
- Progress and unlocking rules: `docs/architecture/PROGRESS_QUIZ_AND_UNLOCKING.md`
- AI credential and prompt handling: `docs/architecture/API_KEY_HANDLING.md`
- AI CRAFT evaluator: `docs/architecture/AI_CRAFT_EVALUATION.md`
- Supabase provisioning evidence: `docs/architecture/SUPABASE_PROVISIONING_EVIDENCE.md`
- Staging deployment: `docs/STAGING_DEPLOYMENT.md`
- Module 1 test plan: `docs/testing/MODULE_1_TEST_PLAN.md`
- Module 1 client-review report: `docs/testing/MODULE_1_TEST_REPORT_2026-09-09.md`
- Per-module test-plan template: `docs/testing/MODULE_TEST_PLAN_TEMPLATE.md`
- Per-module test-report template: `docs/testing/MODULE_TEST_REPORT_TEMPLATE.md`
