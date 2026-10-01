# Delivery Module 1 report — Foundation and Learning Core

Prepared 1 October 2026. **Draft for review; no UAT or handover sign-off.** This is technical Delivery Module 1 (identity/access, learning, assessment/progress), not only the first of the four teacher-learning modules. It describes the current working tree; attach the reviewed commit and deployment identifiers before acceptance.

## Scope delivered in code

Sign-in/out, recovery pages, onboarding profile/goals/safe use; the four-module course with 29 lessons; concept checks and 25 quiz questions across four retryable checks; open course navigation; Dashboard/Progress with missing evidence; account-scoped browser recovery and connected state synchronisation. Trusted server validation recomputes quiz scores from answers, retains immutable response snapshots and uses an atomic revision check for saves.

All 29 lessons have an individual pedagogical review, classroom example, actionable practice/reflection and concept check. The [lesson matrix](../content/LESSON_REVIEW.md) records the edits and source evidence. The content review did not watch every embedded video end-to-end, approve provider account terms or establish classroom effectiveness.

## Evidence currently available

| Layer | Evidence | Result and limit |
| --- | --- | --- |
| Curriculum | [Lesson review](../content/LESSON_REVIEW.md), [curriculum](../content/CURRICULUM.md), [quiz bank](../content/QUIZ_BANK.md) | All 29 lessons reviewed; 25 current quiz items reflected in the bank. Client content approval pending. |
| Targeted automated run | `src/features/learning/quiz.test.ts`, `pathway.test.ts`, `source-studio.test.ts`, `src/components/open-curriculum.test.tsx` | 32 tests in four files passed in the final curriculum verification on 1 October. This is one shared run, not 32 separate tests per delivery report. Source Studio coverage also supports Delivery Module 2. |
| Content lint | ESLint on `catalog.ts`, `module-two-content.ts`, `module-two-teaching.ts`, `module-three-content.ts`, `module-four-content.ts`, `staffroom-challenges.ts` | Passed in the curriculum verification. Does not establish whole-app lint/build status. |
| Server/sync coverage in repository | `server-assessment.test.ts`, `scoped-state.test.ts`, `demo-provider.test.tsx`, participant-state route tests, platform database integration tests | Tests are available for the final release run. Attach its actual output separately; test existence is not a pass claim here. |
| Full check/build/browser | Final integration validation | Pending attachment by release owner. Earlier 93-test/preview reports concern an older revision. |
| Supabase Auth/session/RLS integration | Two real staging participants plus staff roles | Not run against a configured remote project in this session. Local PGlite/database tests, when recorded, remain distinct from managed Supabase verification. |
| Module UAT | AC-01–04, AC-09 and relevant AC-13–17 in [UAT plan](UAT_AND_PILOT.md) | Not run or signed off. |

Reproduce the recorded targeted command with the supported Node/pnpm runtime:

```sh
pnpm exec vitest run src/features/learning/quiz.test.ts src/features/learning/pathway.test.ts src/features/learning/source-studio.test.ts src/components/open-curriculum.test.tsx
```

## Design changes and known limits

- The subsequent user request makes all modules accessible immediately. HLD AC-04 originally requires prerequisite locking. Completion remains assessed separately; record this deliberate change in the client acceptance record.
- A local lesson flag, concept-check answer or quiz result does not prove understanding. The pilot needs direct task observation.
- The trusted-progress migration invalidates legacy client-claimed passing scores without verifiable answers. Plan communication and retakes for affected records.
- Browser drafts are not encrypted or a substitute for confirmed cloud sync. Recovery email configuration/delivery and cross-device account recovery still require staging tests.
- Historical screenshots and deployments do not establish the current working tree's deployed state.

## Outstanding acceptance work

Verify all migrations in staging; auth/recovery/role isolation; same-browser A→B→A and cross-device resume; offline save/reconnect/conflicting tabs; immutable quiz retries; exact Dashboard/Progress requirements; approved video/caption review; mobile/keyboard/screen-reader journeys. Complete full checks/build and retain outputs. Current external blockers are absent connected-service configuration locally and Vercel team `sus-co` access 403.

The HLD asks for sequential delivery-module handoffs. This retrospective draft cannot establish that Module 1 was separately accepted before Module 2 work began.

Review record: revision **pending**; environment **pending**; tester/date **pending**; cases passed/failed/blocked **pending**; defects/waivers **pending**; client reviewer and decision **pending**.
