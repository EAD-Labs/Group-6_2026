# Module 1 Test Plan

## Document control

| Field | Value |
|---|---|
| Jira issues | `KAN-14`, `KAN-15`, `KAN-20` |
| Module/version | Module 1 foundation plus early CRAFT evaluator |
| Environment | Local, connected Supabase and staging |
| Status | Local checks complete; authenticated staging execution pending |
| Reusable templates | `docs/testing/MODULE_TEST_PLAN_TEMPLATE.md`, `docs/testing/MODULE_TEST_REPORT_TEMPLATE.md` |

## Unit and component tests

- safe redirect handling and participant/admin authorization;
- participant-state sanitization and invalid input rejection;
- quiz percentage, exact-set scoring and the 70% boundary;
- lesson completion, retry, best-score retention and module unlocking;
- CRAFT structural rules for all five teacher scenarios;
- AI request schema, score normalization and deterministic fallback;
- 320 px minimum viewport, focus visibility and reduced motion; and
- text and icon feedback that does not rely on colour alone.

## Database integration tests

- migrations apply in order to an empty project;
- every public table has RLS enabled;
- anonymous content-table access is denied;
- participant A cannot read or modify participant B records;
- participants cannot read `quiz_answer_keys`;
- profile insert and update cannot set the `role`;
- authenticated prompt-attempt history excludes raw prompt text; and
- administrators receive only the approved elevated access.

## AI integration tests

- a weak prompt returns five dimension scores and actionable suggestions;
- a strong prompt returns five dimension scores without exceeding 15 points;
- malformed model output is rejected and triggers the deterministic fallback;
- provider timeout returns fallback feedback without losing the participant draft;
- rate-limit and invalid-input messages are accessible;
- the evaluator key never appears in browser assets, response payloads or logs; and
- no prompt containing real student information is used in test evidence.

## End-to-end staging tests

- sign-in, refresh, expiry, sign-out and protected redirects;
- onboarding, dashboard and three lesson completions;
- failed quiz, explanations, retry, pass and Module 2 unlock;
- server-backed persistence after refresh and a second browser session;
- CRAFT weak-to-strong attempt comparison and provider fallback;
- mobile and desktop layouts, keyboard-only completion and 200% zoom; and
- one participant and one administrator walkthrough.

## Required fixtures

- two disposable participants and one administrator;
- Module 1 with three required lessons and one five-question quiz;
- one 3/5 failed attempt and one 4/5 passed attempt;
- weak and strong CRAFT prompts for each teacher scenario; and
- fictional classroom data only.

## Exit criteria

- All automated checks pass from a clean frozen-lockfile install.
- No high-severity authentication, RLS or secret-handling defect remains open.
- The full participant journey passes on one mobile and one desktop viewport.
- Failure, retry, pass and unlock states match HLD v1.3.
- AI failure returns safe feedback without exposing secrets or losing the draft.
- The client accepts the Module 1 staging demonstration and known limitations.

## Module 1 case identifiers

| ID | Case | Expected result |
|---|---|---|
| `M1-AUTH-001` | Signed-out participant opens `/dashboard` | Sign-in required with safe return path |
| `M1-AUTHZ-001` | Participant opens `/admin` | Access forbidden |
| `M1-RLS-001` | Participant A queries participant B progress | No rows returned |
| `M1-RESP-001` | App at 320 to 720 px | No horizontal clipping; actions remain usable |
| `M1-QUIZ-001` | Score is 69% | Attempt fails and Module 2 remains locked |
| `M1-QUIZ-002` | Score is exactly 70% | Attempt passes |
| `M1-QUIZ-003` | Five-question quiz scores 3/5 | 60%; retry remains available |
| `M1-QUIZ-004` | Five-question quiz scores 4/5 | 80%; Module 2 unlocks |
| `M1-PROG-001` | One required lesson is incomplete | Quiz remains locked |
| `M1-PROG-002` | Every required lesson is complete | Quiz becomes available |
| `M1-AI-001` | Weak teacher prompt is scored | Five dimension results and a total no greater than 15 |
| `M1-AI-002` | Provider times out | Deterministic fallback returns with a visible explanation |

## Current limitation

Connected schema provisioning is verified, but authenticated multi-user isolation and full browser persistence still require disposable test accounts and the stable staging URL.
