# Module 1 Test Plan

## Document control

| Field | Value |
|---|---|
| Jira issues | `KAN-14`, `KAN-15` |
| Module/version | Module 1 foundation / initial scaffold |
| Environment | Local and staging |
| Status | Ready for technical review; staging execution pending |
| Reusable template | `docs/testing/MODULE_TEST_PLAN_TEMPLATE.md` |
| Report template | `docs/testing/MODULE_TEST_REPORT_TEMPLATE.md` |

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
- exact 70% pass and immediately-below-threshold failure;
- failed first attempt, passing retry, and lower retry after pass; and
- safe post-authentication redirect handling.

### Component tests

Use Testing Library and jsdom for accessible participant interactions.

- API-key input uses password masking;
- key is placed only in `sessionStorage`;
- full key is not rendered after submission;
- Remove key clears the tab session;
- feedback uses live regions and text, not colour alone; and
- keyboard operation works for forms, activities, and quizzes.

### Responsive contract tests

Check the committed layout contract without requiring a browser service:

- 320 px minimum viewport support;
- three-column desktop and one-column mobile feature grids;
- 720 px mobile breakpoint;
- 48 px minimum action height;
- full-width mobile actions;
- visible focus indicators; and
- reduced-motion handling.

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
| `src/features/auth/authorization.test.ts` | Authentication, role and redirect rules |
| `src/features/settings/api-key-form.test.tsx` | API-key privacy interface |
| `src/app/responsive-layout.test.ts` | Responsive CSS contract |
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

## Module 1 case identifiers

| ID | Case | Expected result |
|---|---|---|
| `M1-AUTH-001` | Signed-out participant opens `/dashboard` | Sign-in required with safe return path |
| `M1-AUTH-002` | Verified participant opens Module 1 | Participant route allowed |
| `M1-AUTHZ-001` | Participant opens `/admin` | Access forbidden |
| `M1-AUTHZ-002` | Administrator opens `/admin` | Access allowed after server/database role verification |
| `M1-RESP-001` | Home at 320–720 px | Single-column content, full-width actions, no clipped controls |
| `M1-RESP-002` | Home above 720 px | Three-column feature grid |
| `M1-QUIZ-001` | Score is 69% | Attempt fails; module remains in progress |
| `M1-QUIZ-002` | Score is exactly 70% | Attempt passes |
| `M1-QUIZ-003` | Five-question quiz scores 3/5 | 60%; attempt fails and retry remains available |
| `M1-QUIZ-004` | Five-question quiz scores 4/5 | 80%; attempt passes |
| `M1-QUIZ-005` | Failed attempt followed by passing retry | Both attempts remain; pass and best score update |
| `M1-QUIZ-006` | Lower retry after passing | Pass timestamp and best score are preserved |
| `M1-PROG-001` | One required lesson is incomplete | Quiz remains locked |
| `M1-PROG-002` | Every required lesson is complete | Quiz becomes available |
| `M1-PROG-003` | Module quiz fails | Next module remains locked |
| `M1-PROG-004` | Module quiz passes | Next module becomes available |

## Current limitation

The repository contains unit and component coverage. Database integration and browser end-to-end suites require the staging/local Supabase project and will be added when connection details and test accounts are provisioned.
