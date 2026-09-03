# Module 1 Testing Structure

## Test levels

### Unit tests

Run pure TypeScript rules in Vitest without Supabase or an AI service.

- percentage and pass/fail calculation;
- threshold boundaries;
- lesson-completion gate;
- module state derivation;
- next-module unlocking;
- attempt-number validation; and
- invalid input rejection.

### Component tests

Use Testing Library and jsdom for accessible participant interactions.

- API-key input uses password masking;
- key is placed only in `sessionStorage`;
- full key is not rendered after submission;
- Remove key clears the tab session;
- feedback uses live regions and text, not colour alone; and
- keyboard operation works for forms, activities, and quizzes.

### Database integration tests

Run against local Supabase before staging.

- migrations apply to an empty database;
- all exposed tables have RLS enabled;
- participant A cannot access participant B records;
- participants cannot read `quiz_answer_keys`;
- participants cannot directly insert or alter scored attempts;
- profile updates cannot change `role`;
- published content is readable and draft content is hidden; and
- admin access follows the approved policies.

### End-to-end staging tests

Use a provisioned participant and administrator against the stable staging URL.

- sign-in, session refresh, expiry, sign-out, and protected redirects;
- onboarding to dashboard;
- lesson completion to quiz unlock;
- failed quiz, explanation, retry, pass, and next-module unlock;
- refresh and cross-device persistence of database progress;
- session-only API-key messaging and removal; and
- mobile, desktop, keyboard, 200% zoom, and screen-reader walkthrough.

## Automated structure

| Path | Purpose |
|---|---|
| `src/features/learning/progress.test.ts` | Learning and unlocking rules |
| `src/features/settings/api-key-form.test.tsx` | API-key privacy interface |
| `src/test/setup.ts` | Shared jsdom cleanup and matchers |
| `vitest.config.ts` | Test environment and aliases |
| `.github/workflows/validate.yml` | Pull-request lint, types, tests, and production build |

## Required fixtures

- one admin account;
- two participant accounts to prove data isolation;
- Module 1 with three required lessons;
- one five-question quiz with reviewed answer keys and explanations;
- one 3/5 failed attempt and one 4/5 passed attempt; and
- fictional classroom data only.

## Exit criteria

- All automated checks pass from a clean frozen-lockfile install.
- No high-severity RLS or authentication defect remains open.
- The complete participant flow passes on one mobile and one desktop viewport.
- Keyboard-only and 200% zoom completion are possible.
- Failure, retry, pass, and unlock states match the HLD.
- The client accepts the Module 1 staging demonstration and known-limitations list.

## Current limitation

The repository contains unit and component coverage. Database integration and browser end-to-end suites require the staging/local Supabase project and will be added when connection details and test accounts are provisioned.

