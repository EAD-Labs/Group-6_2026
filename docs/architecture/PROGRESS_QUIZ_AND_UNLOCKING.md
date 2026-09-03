# Progress, Quiz Attempts, and Unlocking Logic

## State model

Each participant/module record has one of four states:

- `locked` — the previous required module has not been passed;
- `available` — prerequisites are passed but the participant has not started;
- `in_progress` — at least one required lesson or quiz attempt has started;
- `passed` — the participant has achieved the module pass threshold.

Module 1 is `available` immediately after onboarding because it has no previous module prerequisite.

## Lesson progression

1. Opening a lesson records `started_at` once.
2. A lesson records `completed_at` only after all required interactions are submitted.
3. Completed lessons remain completed when revisited.
4. The Module 1 quiz unlocks when all required Module 1 lessons are complete.
5. Optional media never blocks lesson completion.

## Quiz rules

- The module pass threshold is stored with the module and initially set to 70%.
- The five-question prototype therefore requires four correct answers, producing 80%; three correct produces 60% and does not pass.
- Every submission creates a new immutable `quiz_attempts` row and one immutable response row per question.
- Attempt numbers increase from 1 for each participant and quiz.
- Retrying is unlimited during the pilot.
- The latest attempt is shown first; the best score is retained on `module_progress`.
- After submission, show correctness and the reviewed explanation for each answered question.
- Never send answer keys to the browser before submission.

## Unlocking rules

1. A failed attempt keeps the module `in_progress` and does not unlock the next module.
2. A passing attempt sets `status = passed`, records `passed_at` once, and updates `best_score_percent`.
3. Passing Module N creates or updates Module N+1 as `available`.
4. A later lower retry cannot remove a prior pass or reduce the best score.
5. Administrators may correct data only through an audited server-side process; the participant UI has no manual unlock control.

## Transaction boundary

Quiz grading, attempt creation, response creation, module progress update, and next-module unlocking must run in one database transaction. The browser submits selected option IDs to a server-side function and receives only the completed attempt result. If any write fails, the entire submission rolls back so a score cannot exist without its responses or progress update.

## Pure application rules

`src/features/learning/progress.ts` provides deterministic functions for:

- calculating a percentage and pass/fail result;
- deriving module state;
- checking whether required lessons unlock the quiz;
- checking whether a passed module unlocks the next module; and
- incrementing attempt numbers.

These functions support UI behaviour and unit tests. PostgreSQL remains authoritative, and the server must repeat all validation before persisting a result.

## Edge cases

- Zero-question quiz: reject configuration and submission.
- Correct answers greater than total questions: reject as invalid.
- Duplicate or unknown option IDs: reject before grading.
- Concurrent retry submissions: enforce the unique participant/quiz/attempt number and retry the transaction safely.
- Content changed after an attempt: keep the attempt immutable; add content versioning before production reporting.
- Session expires during a lesson: retain database progress and require sign-in before the next write.

