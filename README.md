# PromptShala

PromptShala is a practical AI-literacy platform for beginner primary-school teachers. It helps educators understand AI at a high level, write better prompts, create reusable Gemini-style assistants, and use notebook-based tools for classroom preparation.

## Project status

The repository contains the approved HLD baseline and delivery governance. Product implementation follows the recovery schedule in `docs/HLD/PromptShala_HLD_v1.2_Updated.pdf`.

## Planned stack

- Next.js and TypeScript for the web application
- Supabase for authentication and application data
- GitHub for source control and pull requests
- Jira project `KAN` for PromptShala delivery tracking

## Local setup

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env.local`.
3. Add local Supabase values. Never commit secrets.
4. Install dependencies with `npm install` once the application package is added.
5. Start the development server with `npm run dev`.

## Team

- Ashok Chilka
- Darshan Sonawane
- Raghuram Gundi
- Vishal Patel

## Contribution workflow

Read `docs/BRANCHING.md` before creating a branch. All changes require a pull request and review before merging to `main`.

## Documentation

- HLD: `docs/HLD/PromptShala_HLD_v1.2_Updated.pdf`
- Meeting minutes: `docs/meetings/`
- Environment plan: `docs/ENVIRONMENTS.md`
- Prompt framework decision: `docs/PROMPT_FRAMEWORK_DECISION.md`
- Participant UX plan: `docs/design/PARTICIPANT_UX_PLAN.md`
- Google Stitch prompts: `docs/design/STITCH_PROMPTS.md`
- Generated Stitch project manifest: `docs/design/STITCH_PROJECT.md`
- Client prototype walkthrough: `docs/design/CLIENT_PROTOTYPE_WALKTHROUGH.md`
