# Live app check — 23 October 2026

Production: https://promptshala.vercel.app

**Current result: the core learner application and all three live Gemini features are working after the production secret update and redeployment.**

## Gemini connection restored

The user-provided replacement credential was stored as a sensitive Vercel production secret. The existing production source was redeployed without source-code changes. Deployment `dpl_Crop1Ric11ZuVmdgDwzN9ube8p7g` is READY and serves https://promptshala.vercel.app.

- CRAFT returned HTTP 200 with source=gemini; the prompt and feedback were saved and recovered from private history.
- Teaching helper returned HTTP 200 with generated output.
- Source transformation returned HTTP 200 with source=gemini.
- The first CRAFT attempt received a transient Google HTTP 503; an isolated retry succeeded. No fallback output is counted as successful Gemini generation.
- Both post-update synthetic accounts were deleted. No emails were sent. The key was not printed, saved in source, or committed.

The earlier failures below describe the state before this repair. [Post-update results](assets/live-check-2026-10-23/gemini-resolution.json).

## Passed

- Landing page, visitor demo, review lab, sign-in and sign-up return HTTP 200. Anonymous users are redirected from private pages; protected APIs reject unauthenticated access.
- Real browser email/password login, onboarding, safe-use acknowledgement, AI starting-point questions, profile/goals, saved-state reload, introductory lesson and sign-out passed (10 checks).
- All four modules load. All four server-graded quizzes pass with synthetic answers; grading receipts survive reload, duplicate submissions are idempotent, and stale/conflicting submissions are rejected.
- Dashboard, progress, profile, Gemini settings, certificate screen, help, privacy and all four module/quiz pages respond for an authenticated ordinary learner. Practice, staffroom, studio and transformation pages also respond.
- Saved CRAFT feedback reports saved=true. Private teaching-resource save, reload and deletion pass. Account export returns consent and grading records. Ordinary learners cannot enter the staff API or claim a certificate with quiz-only completion.
- Correctly parameterized lesson content returns HTTP 200. A request without required module/lesson parameters correctly returns HTTP 400; the initial generic route probe was not an application failure.
- 27 unique visitor checks passed across desktop Chromium, 360px mobile Chromium and WebKit. Coverage includes the three-step demo, review exports, rubric import, keyboard controls, reset/privacy and automated visitor-page accessibility scans. One WebKit navigation check initially raced the preceding client navigation and passed on an isolated retry.

## Earlier Gemini failure confirmed in production

| Feature | User-facing result | Actual Google response |
| --- | --- | --- |
| CRAFT feedback | HTTP 200; rule-based checklist fallback; prompt saved | HTTP 401 |
| Teaching helper | HTTP 503; AI generation unavailable | HTTP 401 |
| Source transformation | HTTP 200; extractive fallback | HTTP 401 |

These are fresh requests from an ordinary signed-in synthetic account with the current safe-use notice. Actual production ai_request logs confirm provider authentication errors for all three workflows. A configured health flag only confirms an environment variable exists. It does not prove Google accepts the credential.

The production GEMINI_API_KEY is stored as a sensitive Vercel secret and cannot be downloaded. An older ignored production snapshot was independently rejected by Google as API_KEY_INVALID (HTTP 400); it must not be treated as proof of the current secret's exact value.

**Resolved:** GEMINI_API_KEY was replaced as a sensitive production secret, the existing application was redeployed, and all three authenticated AI checks returned genuine Gemini output. No secret values were printed or added to this report.

## Boundaries and cleanup

All four synthetic accounts were deleted through the app's account-deletion API. No emails were sent. No application code, production configuration or learner records were changed. Only synthetic account records were created and removed.

Positive staff publishing and successful completed-learner certificate issuance/download were not repeated. Personal-key success remains unverified without a separate valid key. This check does not establish exhaustive coverage or full accessibility conformance.

Machine-readable results: [results.json](assets/live-check-2026-10-23/results.json). Private scratch diagnostics remain in ignored tmp/live-check.
