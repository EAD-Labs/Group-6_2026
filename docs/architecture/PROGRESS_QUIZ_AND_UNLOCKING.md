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
- Original banks have 14/19/23/19 questions at 70% (10/14/17/14 correct). A published assessment release may change its module bank and passing score from 70% to 100%; the interface displays that release's requirements. Historical verified passes retain their original threshold/version.
- Quizzes show explanations after submission, support unlimited retries and retain prior attempts and best scores.
- A passed quiz alone does not complete a module.
- Source Studio export is a practice record, not a certificate.

## Current persistence and release boundary

Signed-in state uses account-scoped local recovery and authenticated, atomic revision-checked server saving. The server recomputes grades and checks trusted evidence rather than accepting a client-supplied score. Published question banks/thresholds are immutable releases; private committed receipts support idempotent submission and recovery on another device. Existing verified passes and question text keep their original version.

`POST /api/assessments` validates the current release, grades submitted answers, saves a service-controlled receipt and returns only the committed result. A reused attempt ID with different answers/version is rejected; a mid-attempt publication change requires a new attempt. Participant-state sanitisation validates immutable release evidence, exact recorded notice versions and trusted submissions. Certificate issuance snapshots the assessment evidence that establishes eligibility.

Production schema/ordinary-role write denials were checked on 15 October; final application deployment/client UAT is recorded separately. Local final checks cover malformed answers, version races, forged scores/notices, receipt privacy, historical pass retention and reporting. See [versioned assessment architecture](VERSIONED_ASSESSMENT_RELEASES.md) and [current evidence](../final/FINAL_DELIVERY_RECORD.md). These are formative checks, not a secure high-stakes examination system or a measure of classroom effectiveness.

## Related evidence

- Curriculum: `docs/content/CURRICULUM.md`
- Module 4 review: `docs/testing/MODULE_4_REVIEW.md`
- Client progress: `progress.md`
- Participant API: `src/app/api/participant-state/route.ts`
