# Delivery Module 1 report - Foundation and Learning Core

Updated 15 October 2026. **Review-ready report; no client UAT or handover sign-off.** This technical delivery covers identity, access, learning, assessment and progress across all four teacher-learning modules. The [1 October report](history/2026-10-01/DELIVERY_MODULE_1_REPORT.md) is preserved as dated history.

## Delivered scope

- Email/password signup and sign-in/out; recovery/reset pages; safe-use, teacher profile/goals and optional AI-use onboarding.
- Four open modules, 29 lessons, 75 questions (14/19/23/19 by module), chapter understanding checks, explanations and retries.
- Server recomputation, immutable question-bank/passing-score releases, private idempotent committed receipts, cross-device recovery, retained historical verified passes, best-score progress and exact completion requirements.
- Atomic revision/conflict handling, account-cache separation, private account export/deletion and accessible navigation.
- Final additions: notice-version evidence, forged-version rejection, versioned assessment authoring and a public visitor path. Historical unknown notice versions stay unknown. Production assessment schema/role-write denials were verified on 15 October; application deployment and client UAT remain separately recorded.

Open module access is the approved client policy. Certificate eligibility still requires recorded assessed completion; opening a page is not passing a module.

## Current evidence

| Layer | Evidence | Result and boundary |
| --- | --- | --- |
| Curriculum | [Lesson review](../content/LESSON_REVIEW.md), [curriculum](../content/CURRICULUM.md), current `src/features/learning` question bank | All 29 lessons have a review record; 75 current questions. Educator approval and full video/caption review remain separate. |
| Earlier managed checks | [Release review](RELEASE_REVIEW.md), [6 October pilot](../PILOT_RELEASE_2026-10-06.md), [10 October client feedback](../design/CLIENT_FEEDBACK_2026-10-10.md) | Ordinary synthetic account/session/server grading checks completed on dated production releases. These are not client UAT. |
| Development regression | [Current register](../final/FINAL_DELIVERY_RECORD.md) | Final local run: 435 automated tests in 66 files. Lint, types and production build passed; final 27 browser journeys passed. Attach the actual source/deployment identity after publication. |
| Public visitor/browser checks | Maintained Playwright suite in `e2e/` | Reported 27 journeys across Chromium, WebKit and 360px Chromium; accessibility/keyboard smoke. Local Firefox launch failed; CI or supported-machine verification required. |
| Permissions/version migrations | Local all-migration database tests | Exercises PostgreSQL-compatible permission/state contracts; managed Auth and HTTP sessions require separate remote tests. |
| Client acceptance | AC-01-04, AC-09, relevant AC-13-17 | Not signed off; use [case sheet](../final/CLIENT_REVIEW_AND_DECISIONS.md). |

The automated totals are shared across delivery reports; do not add them together. A local browser route, previous hosted screenshot or configured health flag does not establish deployment of the current source.

## Outstanding acceptance and operations

The user deferred emails on 15 October; record recovery delivery as deferred, not passed, and do not send/configure email for this release. Recheck A-B-A/shared-device/cross-device state; run interrupted save and two-tab conflict paths; complete genuine all-module progress/certificate reconciliation; check current mobile/tablet/browser support and manual keyboard/screen-reader tasks. Hosted load/full recovery remain unexecuted under the user's existing-production choice and need a later isolated target.

Record the accepted change to original HLD AC-04 rather than claiming prerequisite locks exist. The course content and project-created formative questions require educator review; no measured learning effect is inferred from quiz scores.

## Review record

Final reviewed revision/environment/test paths: see [current register](../final/FINAL_DELIVERY_RECORD.md).

Client reviewer/date: ______. Cases/results: ______. Defects/retests: ______. Decision/conditions: ______.

The HLD's sequential technical-module handoffs cannot be established retrospectively by this report. Report actual review dates and keep the original history.
