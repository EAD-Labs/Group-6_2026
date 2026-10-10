# Client feedback implementation — 10 October 2026

Based on the 9 October meeting feedback: make the experience understandable for teachers new to technology, learn about their existing AI use, allow a personal Gemini key, and save CRAFT requests in the database.

## Experience

The landing page explains AI through familiar classroom tasks and an interactive illustrative example. It defines a prompt and a teaching helper, explains the optional Gemini connection, and shows three steps to begin. No live AI call is made by the example switcher.

The shared Apple-inspired interface uses platform typography, calm blue and neutral surfaces, a frosted toolbar, clear navigation, instant press feedback, readable practice text, keyboard focus, and reduced motion/transparency/contrast preferences. Module names and overview text describe the task directly. Detailed practice instructions, completion requirements, and the CRAFT guide can be opened when needed.

AI Staffroom offers four focused steps: set up, try an example, improve, and use in class. Source Studio offers four steps and one statement to check at a time. The own-material workspace separates entering notes, reviewing the draft, and saved resources.

## AI experience and persistence

Three setup steps remain. Optional questions ask which tools teachers have tried, their use frequency, current uses, confidence, and teaching goals. “None yet” gives a beginner route and clears contradictory tool choices. Answers are editable in My account and preserved when moving Back in setup.

A participant's personal Gemini key stays in the open tab's memory and is cleared on refresh, sign-out, or account change. It is forwarded to Google through the server only with an authenticated AI request. It is never written to account data or browser storage. The same setting works for CRAFT feedback, teaching-helper tests, and AI material transformations. Existing consent and request limits apply. The course connection remains the default when available; clearly labelled checklist/local-draft alternatives remain available.

Checked CRAFT tasks, prompts, and feedback are stored privately with validated scores. The user sees whether the save succeeded. The practice screen can reopen the most recent 20 saved requests and reuse them. Account exports include the complete paginated history; account deletion removes it through the existing cascade. Historical fingerprint-only records stay unchanged. Staff reports exclude private prompt text.

## Release requirements

Apply these migrations in order before releasing this version:

1. `supabase/migrations/202610100001_ai_experience_profile.sql`
2. `supabase/migrations/202610100002_private_craft_prompts.sql`

The first adds profile fields synchronized atomically with participant-state saves. The second adds CRAFT text/feedback fields, owner-only read access, and server-only writes. Existing PostgreSQL integration tests cover constraints, transaction rollback, owner isolation, staff exclusion, and account deletion.

Both migrations were applied to the production project on 10 October 2026 after an approved encrypted backup of the affected application tables and an isolated local restore/migration rehearsal. Production schema verification confirmed owner-only CRAFT reads, server-only inserts, and unchanged existing row counts. Deployment and live acceptance results are recorded in the release pull request. A successful personal-key Google generation still requires a valid client-owned key; local provider success tests use controlled mocked responses.

## Review evidence

Lint, TypeScript, Vitest, and an optimized production build were run. Browser review covered the real public landing page and synthetic, inert renderings of the dashboard, onboarding, CRAFT practice, teaching helpers, Source Studio, and Gemini settings. Desktop and phone checks found no horizontal clipping in the reviewed screens. Synthetic previews do not establish production authentication or live provider behavior and were removed before the final build.

Screenshots are saved under `artifacts/design-review-2026-10-10/`.
