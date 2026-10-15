# Versioned assessment releases and trusted evidence

Final implementation, 15 October 2026. User access remains open; assessed completion and certification use server-verified evidence. The 75 original questions remain the fallback banks and chapter formative checks.

## Authoring and publication

Staff create an immutable draft in Knowledge checks, with a module, title, 5-40 questions, valid lesson mappings, single/multiple correct sets, explanations and a 70-100% passing score. Administrators publish/archive; direct participant/anonymous write/RPC execution is denied. A new published release archives the previous module release without rewriting its questions or results. If none remains published, new attempts use the original bank.

Original course lesson/practical/safe-use requirements remain required. Raising a threshold does not invalidate a historical server-verified pass. New policy changes beyond this supported range need their own reviewed release; no navigation locks are reintroduced.

## Submission and recovery

`GET /api/assessments?module=N` resolves the published or base bank. A version query retrieves historical question text. `POST /api/assessments` requires an authenticated participant, validates the requested version and answer set, recomputes the grade and saves a private `grading_receipt` in `verified_quiz_submissions` through trusted server access.

The participant/attempt ID is an idempotency boundary. An exact retry returns the committed receipt; a changed answer/version cannot reuse that ID. The server rereads the committed row to handle two-tab insert races. A publication race returns a recoverable conflict instead of grading against a different bank. Receipt recovery allows the same account to resume on another device without trusting a local pass claim.

Participant-state validation resolves immutable release evidence, preserves verified historical passes and rejects fabricated scores, malformed answer sets or invented notice versions. Certificate eligibility and issuance retain the assessment snapshot used. Reporting uses the current bank for current-version question patterns and avoids mixing unrelated question versions; base chapter checks remain separately interpretable.

## Security and educational boundaries

Private submissions/receipts are owner-scoped; staff publication and trusted writes use protected operations. Formative question content and explanations are available to learners by design. Server validation protects the recorded transaction; it does not make this a confidential exam or prove comprehension. Educator review still checks correctness, ambiguity, level and usefulness.

Key implementation: `src/features/content-authoring/assessment-release.ts`, `server-assessment-releases.ts`, `src/app/api/assessments/route.ts`, participant/server assessment validation and `20261014175055_versioned_assessment_releases.sql`. The admin guide explains the operating workflow. Final test/migration evidence is linked from the [delivery register](../final/FINAL_DELIVERY_RECORD.md); client acceptance remains a separate real decision.
