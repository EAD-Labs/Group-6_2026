# [Module Name] Test Report

## Report summary

| Field | Value |
|---|---|
| Jira issue | `[KAN-XX]` |
| Module/version | `[Module N / version]` |
| Test plan | `[path or link]` |
| Environment | `[Local / Preview / Staging]` |
| Build/commit | `[SHA]` |
| Deployment URL | `[URL]` |
| Execution dates | `[YYYY-MM-DD to YYYY-MM-DD]` |
| Test owner | `[Name]` |
| Overall result | `[Pass / Conditional pass / Fail / Blocked]` |

## Executive result

Summarise what was tested, the participant impact, important risks, and the release recommendation in three to five sentences.

## Execution totals

| Level | Planned | Passed | Failed | Blocked | Not run |
|---|---:|---:|---:|---:|---:|
| Unit | `0` | `0` | `0` | `0` | `0` |
| Component | `0` | `0` | `0` | `0` | `0` |
| Database integration/RLS | `0` | `0` | `0` | `0` | `0` |
| End-to-end | `0` | `0` | `0` | `0` | `0` |
| Responsive/accessibility | `0` | `0` | `0` | `0` | `0` |
| **Total** | `0` | `0` | `0` | `0` | `0` |

## Requirement results

| Test ID | Requirement | Result | Evidence | Defect |
|---|---|---|---|---|
| `[MOD-AUTH-001]` | `[Authentication]` | `[result]` | `[log/screenshot/link]` | `[key or —]` |
| `[MOD-AUTHZ-001]` | `[Authorisation/RLS]` | `[result]` | `[log/screenshot/link]` | `[key or —]` |
| `[MOD-RESP-001]` | `[Responsive layout]` | `[result]` | `[log/screenshot/link]` | `[key or —]` |
| `[MOD-QUIZ-001]` | `[Scoring/retry]` | `[result]` | `[log/screenshot/link]` | `[key or —]` |
| `[MOD-PROG-001]` | `[Progress/unlocking]` | `[result]` | `[log/screenshot/link]` | `[key or —]` |

## Authentication and authorisation

- Signed-out redirect result: `[result/evidence]`
- Session refresh/expiry result: `[result/evidence]`
- Participant/admin route result: `[result/evidence]`
- Participant data-isolation result: `[result/evidence]`
- Answer-key and role-update protection result: `[result/evidence]`

## Responsive and accessibility

| Check | Mobile | Tablet | Desktop | Notes/evidence |
|---|---|---|---|---|
| No horizontal overflow | `[result]` | `[result]` | `[result]` | `[evidence]` |
| Keyboard completion | `[result]` | `[result]` | `[result]` | `[evidence]` |
| Visible focus | `[result]` | `[result]` | `[result]` | `[evidence]` |
| 200% zoom | `[result]` | `[result]` | `[result]` | `[evidence]` |
| Screen-reader announcements | `[result]` | `[result]` | `[result]` | `[evidence]` |
| Reduced motion | `[result]` | `[result]` | `[result]` | `[evidence]` |

## Quiz, retry, and progress results

- Below 70% remains failed: `[result/evidence]`
- Exactly 70% passes: `[result/evidence]`
- Passing retry records pass and best score: `[result/evidence]`
- Later lower retry preserves pass and best score: `[result/evidence]`
- Required lessons gate the quiz: `[result/evidence]`
- Passing unlocks only the next module: `[result/evidence]`

## Defects

| Jira key | Severity | Summary | Status | Owner | Release impact |
|---|---|---|---|---|---|
| `[KAN-XX]` | `[Critical/High/Medium/Low]` | `[summary]` | `[status]` | `[name]` | `[impact]` |

## Known limitations and unexecuted tests

| Item | Reason | Risk | Follow-up owner/date |
|---|---|---|---|
| `[limitation]` | `[reason]` | `[risk]` | `[owner / YYYY-MM-DD]` |

## Recommendation

Select one and explain:

- `Release/accept`
- `Conditional release/acceptance`
- `Do not release`
- `Blocked pending environment or client decision`

## Sign-off

| Role | Name | Decision/date |
|---|---|---|
| Test owner | `[Name]` | `[Decision / YYYY-MM-DD]` |
| Technical reviewer | `[Name]` | `[Decision / YYYY-MM-DD]` |
| Client reviewer | `[Name]` | `[Decision / YYYY-MM-DD]` |

