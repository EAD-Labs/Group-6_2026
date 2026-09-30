# Progress, Quiz Attempts, and Access

## Current access requirement

All four participant modules, chapters, labs and quizzes are available from the start. This user-requested policy supersedes the original prerequisite/unlocking design. Completing an earlier module is not an access requirement.

Access and assessed completion are separate. The database still permits a legacy `locked` status for compatibility, but the current learning UI does not use it to block any implemented module.

## Assessed completion

`src/features/learning/pathway.ts` calculates the participant learning record:

| Module | Required evidence |
| --- | --- |
| 1 | Six lessons and passed knowledge check |
| 2 | Seven lessons, at least two CRAFT attempts, complete prompt library and passed knowledge check |
| 3 | Eight lessons, a complete tested/repaired assistant package and passed knowledge check |
| 4 | Eight lessons, a complete Source Studio portfolio and passed knowledge check |

Each module can be completed independently. Whole-course completion requires all four. Course percentage counts the 29 lessons and four assessed module completions, reaching 100% only when every requirement is met.

The Module 4 portfolio requires an objective, audience, source register, permission and privacy confirmation; three correct passage-linked audits with explanations; a classroom draft and explained revision; six review checks; and a course reflection. Editing the brief, draft or audit resets the UI's teacher review checks. Existing lesson completion remains recorded; module completion is recalculated from current portfolio evidence.

## Lesson and quiz behaviour

- A required lesson interaction must be completed before the participant marks that lesson complete.
- Every chapter and quiz remains open regardless of prior progress.
- Optional media and external Google notebook access do not block completion.
- Quiz grading uses a 70% threshold. Five-question quizzes require four correct answers; Module 3's ten-question quiz requires seven.
- Quizzes show explanations after submission, support unlimited retries and retain prior attempts and best scores.
- A passed quiz alone does not complete a module.
- Source Studio export is a practice record, not a certificate.

## Current persistence and release boundary

The review interface stores demo evidence locally and has an authenticated participant-state API that sanitizes records and saves profile, lesson, quiz and assistant data under existing RLS. Module 4 adds a profile `source_portfolio` object, lesson IDs and quiz ID. Apply the Modules 2/3 migration before the Module 4 migration on the target database.

The preview does not establish production persistence. Signed-in round-trip checks and two-participant isolation remain required. Quiz evaluation currently runs in the learning client; the API stores sanitized attempt metadata. It is not yet a server-authoritative assessment transaction and must not determine issued credentials without the certification implementation.

Before certificate issuing, implement authoritative server grading with content versions, immutable question responses, validated module evidence and an atomic progress update. Test duplicate/unknown options, invalid scores, concurrent retries, session expiry and failed writes. Keep administrative corrections audited.

## Related evidence

- Curriculum: `docs/content/CURRICULUM.md`
- Module 4 review: `docs/testing/MODULE_4_REVIEW.md`
- Client progress: `progress.md`
- Participant API: `src/app/api/participant-state/route.ts`
