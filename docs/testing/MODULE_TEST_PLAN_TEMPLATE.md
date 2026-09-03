# [Module Name] Test Plan

## Document control

| Field | Value |
|---|---|
| Jira issue | `[KAN-XX]` |
| Module/version | `[Module N / version]` |
| Test owner | `[Name]` |
| Reviewers | `[Names]` |
| Planned execution | `[YYYY-MM-DD]` |
| Environment | `[Local / Preview / Staging]` |
| Build/commit | `[SHA or deployment URL]` |
| Status | `[Draft / Approved / In execution / Complete]` |

## Objective

State what this plan proves and which client-approved learning outcomes, HLD requirements, and acceptance criteria are in scope.

## Scope

### Included

- `[Participant flow or feature]`
- `[Learning interaction]`
- `[Quiz/progress behaviour]`
- `[Authentication/authorisation boundary]`
- `[Responsive/accessibility requirement]`

### Excluded

- `[Deferred feature and reason]`
- `[External integration not available in this environment]`

## References

- HLD section: `[reference]`
- User flow/prototype: `[path or URL]`
- Learning content: `[path]`
- Database migration: `[path]`
- Jira epic/tasks: `[keys]`

## Test environment and fixtures

| Requirement | Planned value |
|---|---|
| Web deployment | `[URL]` |
| Browser/device | `[browser, version, viewport/device]` |
| Database | `[local/staging project]` |
| Participant accounts | `[fictional account IDs]` |
| Admin account | `[fictional account ID]` |
| Module content version | `[version]` |
| Seed attempts | `[failed/passed attempt fixtures]` |

Never include passwords, API keys, tokens, real student information, or confidential school records in this document.

## Entry criteria

- Requirements and learning outcomes are approved.
- Target commit is deployed to the named environment.
- Required migrations and fictional fixtures are applied.
- Automated checks pass.
- Test accounts and supported browsers are available.

## Test-case matrix

| ID | Requirement | Level | Preconditions | Steps/data | Expected result | Priority | Owner |
|---|---|---|---|---|---|---|---|
| `[MOD-AUTH-001]` | `[Authentication]` | `[Unit/E2E]` | `[condition]` | `[steps]` | `[observable result]` | `[P0-P2]` | `[name]` |
| `[MOD-AUTHZ-001]` | `[Authorisation/RLS]` | `[Integration]` | `[condition]` | `[steps]` | `[observable result]` | `[P0-P2]` | `[name]` |
| `[MOD-RESP-001]` | `[Responsive layout]` | `[Component/E2E]` | `[condition]` | `[viewport and steps]` | `[observable result]` | `[P0-P2]` | `[name]` |
| `[MOD-QUIZ-001]` | `[Scoring/retry]` | `[Unit/E2E]` | `[condition]` | `[answers/steps]` | `[score and state]` | `[P0-P2]` | `[name]` |
| `[MOD-PROG-001]` | `[Progress/unlocking]` | `[Unit/E2E]` | `[condition]` | `[steps]` | `[state transition]` | `[P0-P2]` | `[name]` |
| `[MOD-A11Y-001]` | `[Accessibility]` | `[Manual/E2E]` | `[condition]` | `[keyboard/zoom/screen reader]` | `[observable result]` | `[P0-P2]` | `[name]` |

## Required boundary coverage

- Signed out, valid participant, expired session, disabled participant, and administrator.
- Own record versus another participant’s record.
- Mobile 320 px, mobile 390 px, tablet 768 px, desktop 1280 px, and 200% zoom.
- Score below threshold, exactly at threshold, above threshold, failed retry, passing retry, and retry after pass.
- First module, locked later module, all required lessons complete, and missing required lesson.
- Loading, empty, error, failed, passed, locked, and restored-session states.

## Defect process

Record each failure in Jira with test ID, environment, build, reproducible steps, expected result, actual result, severity, evidence, and owner. Do not attach secrets or personal data.

## Exit criteria

- All P0 and P1 cases pass.
- No open critical/high authentication, RLS, privacy, scoring, or accessibility defect remains.
- Automated and manual evidence is attached.
- Known limitations and deferred cases are accepted.
- Client decision is recorded.

## Approval

| Role | Name | Decision/date |
|---|---|---|
| Test owner | `[Name]` | `[Decision / YYYY-MM-DD]` |
| Technical reviewer | `[Name]` | `[Decision / YYYY-MM-DD]` |
| Client reviewer | `[Name]` | `[Decision / YYYY-MM-DD]` |

