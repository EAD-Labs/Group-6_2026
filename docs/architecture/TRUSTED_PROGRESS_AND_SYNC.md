# Trusted participant progress and synchronization

## State contract

`GET /api/participant-state` verifies the Supabase session. Its connected response is `{ mode: "supabase", participantId, role, revision, state }`. Demo mode returns `{ mode: "demo" }` and never writes participant records. Signed-out requests receive 401. Responses are private and uncached.

`PUT /api/participant-state` accepts `{ participantId, revision, state }`. The participant ID must match the verified session. Unknown quiz questions, unknown options, repeated selections and attempts to modify an existing response receive 400. A stale revision receives 409; no partial write is committed. Success returns the verified state and new revision.

The server sanitizes artifact/profile fields and recomputes quiz results from submitted answers against the versioned application question banks. Client score, pass and correct-answer claims are ignored. `verified_quiz_submissions` retains immutable response snapshots. Existing attempts accumulate when clients retry or omit old history. Legacy score-only attempts cannot establish a pass and require a new knowledge check; their old database records remain available for migration review.

`getParticipantState(client, participantId)` in `src/features/demo/participant-persistence.ts` returns `{ state, revision, role }` for other authorized server features, including certification. All four modules remain open. Module completion still requires the lessons, quiz and required practice artifacts; lesson completion and authored artifact evidence are formative participant submissions, not independently verified classroom performance.

## Transaction and permissions

Apply `202609300002_trusted_participant_state.sql` after the six curriculum migrations, before platform operations. `save_participant_state` locks the participant snapshot, checks its revision and atomically saves the profile, snapshot, immutable assessment records, lesson progress, assistant specs and derived module progress. The function can be called only by the service role. The authenticated browser role has no direct write privileges on progress, assessment records, assistant specs or profile artifact columns.

`SUPABASE_SERVICE_ROLE_KEY` is required by trusted server routes. It must never enter client code. Its absence produces an explicit synchronization error; there is no fallback that trusts direct client scores. RLS permits owners to read their private state. Routine staff reports use selected aggregate columns through separately authorized services.

The migration invalidates old client-reported module pass statuses. The new server calculation restores eligibility once answer-backed assessments and required evidence have been submitted. Back up existing pilot data and explain the knowledge-check retake before applying this migration to a cohort with existing records.

## Browser recovery

The provider exposes `syncStatus`, `syncError`, `retrySync`, `participantId`, `role` and `storageScope` in addition to existing learning actions. Status values are `checking`, `saved`, `saving`, `offline`, `error`, `demo` and `unauthenticated`.

The browser loads an account cache only after verifying the current identity. Cache keys are `promptshala:state:v2:participant:<id>`; demo data uses a separate `demo` scope. Local pending records include the last server baseline and revision. The provider preserves edits immediately, debounces online saves, retries on reconnect and supports explicit retry after failures. Revision conflicts trigger a three-way merge: unchanged fields take the remote value, local edits remain, completed lessons and attempts accumulate, and assistant deletion tombstones persist. Assistant edits merge by field; conflicting edits to the same field pause cloud saves and expose both values for the participant to choose. Pending conflicts survive reload. Test records and instruction snapshots accumulate immutably, and concurrent version-number collisions are rebased without discarding either history.

Before a pending write, the server checks the expected participant ID again. A new account cannot receive the previous account's draft. Navigation revalidates identity; signing out clears visible state. Unsent local work remains under the prior account's separate key until that account signs back in or local browser data is deleted. This is a local browser copy, not encrypted storage; shared-device users should clear site data when they no longer need saved drafts. Account-data deletion must remove the account's browser cache and draft keys as well as server records.

## Verification boundary

Automated tests cover fabricated scores, invalid options, attempt immutability/idempotency, revision conflicts, account-switch isolation, unavailable storage, failed-save recovery, role checks and demo/live AI authorization. SQL is version controlled but applying it to the intended database, two-account RLS checks and a signed-in round trip remain release acceptance steps. Local unit tests do not establish a configured or migrated remote environment.
