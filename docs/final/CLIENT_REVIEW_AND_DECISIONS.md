# Client review and acceptance packet

Prepared 14 October 2026 for Centre for Educational Technology, IIT Bombay. This is a decision packet, not a signed approval. Existing client authorisation for simpler UI, open modules, public signup, optional personal keys and private saved CRAFT records remains in force. The matrix consolidates those decisions with the HLD; it does not ask the client to authorise them again.

## Review meeting - suggested 45-minute agenda

1. Confirm the reviewed source/deployment and show the learner's three-minute workflow (5 minutes).
2. Review a lesson, trusted quiz retry, CRAFT revision, helper test, source audit, progress and eligible certificate (15 minutes).
3. Show assigned-cohort staff boundaries and reporting, and explain administrator/content scope (8 minutes).
4. Review evidence, defects and remaining operations/accessibility/performance work (7 minutes).
5. Record decisions below, owner/due dates, study conditions and acceptance disposition (10 minutes).

Use fictional material and synthetic accounts. Do not display private production records or accept verbal praise as formal release approval. The client reviewer should actually operate the primary tasks; team assistance must be recorded.

## Requirements and decision matrix

| ID | Decision or requirement | Implemented/proposed behaviour | Review action and decision field |
| --- | --- | --- | --- |
| D01 | Beginner-teacher experience | Plain-language task names, shorter guidance, responsive course, optional AI-use questions | Validate actual comprehension in UAT; decision/reviewer/date: ______ |
| D02 | Module access | Approved open exploration; server-checked assessed completion separately | Consolidate accepted change to HLD AC-04; no prerequisite lock restoration |
| D03 | Signup / deferred email | Approved immediate password login; mailbox ownership is not verified; user deferred email/SMTP on 15 October | Preserve password signup/login; record recovery delivery as deferred, not passed |
| D04 | Private CRAFT storage | Approved full task/prompt/feedback history, comparison/reuse/export/deletion | Supersedes fingerprint-only wording in early change record; privacy wording review: ______ |
| D05 | Personal Gemini keys | Approved optional key in open-tab memory; cleared on refresh/sign-out/account change; not stored in DB | Verify actual successful provider call and participant explanation; evidence: ______ |
| D06 | Course AI provider | Optional server-side Gemini, explicit safe use and transparent failure labels | Confirm model/service availability, permitted processing, budget, responsible owner and successful all-workflow evidence: ______ |
| D07 | Curriculum/media | Four modules, 29 lessons, 75 questions and practice evidence | Educator approval, suitability, full video/caption/rights review and agreed corrections: ______ |
| D08 | Content/assessment authoring | Immutable lesson packages with accessible media/activity/cohort audience; knowledge-check bank editing, review and administrator-only release | Verify ordinary-role/cohort/publish behaviour and educator-approved questions; disposition/owner: ______ |
| D09 | Course policy settings | Planning minutes editable; published checks set 70-100% passing score; historical verified passes retained; lessons/practice/safe use remain required | Accept actual versioned threshold/evidence policy and test old/new results and certificates; disposition: ______ |
| D10 | Certificates | Server-verified recorded completion; private PDF/public status; no learner name in public verification | Approve wording/signatories, eligibility rule and revocation handling; decision: ______ |
| D11 | Retention | Sources 30 days; activity/audit 90 days; account deletion cascades certificates; proposed inactivity/three-year certificate archive not enabled | Resolve deletion versus certificate retention, inactivity policy, backup/provider retention and study dates before destructive changes; decision: ______ |
| D12 | Staff visibility | Facilitator assigned-cohort aggregates/minimal roster; administrator approved individual learning telemetry; private prompt/source/transcript excluded | Record approved role/operational purpose and test real access boundary; decision: ______ |
| D13 | Wider-context module | Human evidence-led Teaching Review Lab with custom versioned rubrics and review export | Accept generalisation example; no automatic factual correctness or impact claim |
| D14 | Ownership/release | User chose existing production project on 15 October; isolated restore/load remain unexecuted; named student working leads and receiving-owner handover fields | Confirm receiving-owner names/contact and real scope/limitations; no new paid project or deletion required |
| D15 | Field study | Ten volunteer beginner educators; separate consent; exploratory observed tasks; no effect claim | Approve study materials, recruitment, support, storage/withdrawal/retention dates; decision: ______ |

## Case execution sheet

Use [AC-01-19 steps](../testing/UAT_AND_PILOT.md). Log each run in [acceptance-results.csv](acceptance-results.csv). Status must be Pass, Fail, Blocked, Not run or Accepted change. A synthetic developer smoke result and a client acceptance decision are different records.

| Per-case field | Record |
| --- | --- |
| Case ID / test objective | |
| Reviewed revision / URL / migration state | |
| Tester / client observer / date | |
| Account role / device / browser / network | |
| Expected / actual behaviour | |
| Result / evidence path | |
| Team help or workaround | |
| Defect ID / severity / owner / retest | |
| Accepted scope change and named approver | |

AC-04 should record the approved change to open exploration rather than falsely passing the original lock requirement. AC-11 must explicitly resolve narrower authoring/settings. AC-14 needs manual accessibility evidence; AC-15 needs representative hosted measurements. Recovery and successful real AI calls must be observed, not inferred from configuration flags.

## Defect and review disposition

Log genuine findings in [defect-register.csv](defect-register.csv), with expected/actual behaviour and a reproducible path. Do not pre-fill synthetic "zero defects" results. A fix closes only after retest on the corrected revision. Critical data/privacy/security or primary-flow defects prevent release; document any permitted High-risk exception specifically with reviewer and impact.

## Release decision - authorised reviewer completes

Release revision: ______. Deployment: ______. Review date: ______.

Cases passed: ______; failed: ______; blocked: ______; not run: ______; accepted changes: ______.

Decision: [ ] Accepted for stated scope [ ] Accepted with specified conditions [ ] Rework required [ ] Review postponed.

Accepted scope and limitations: ____________________________________.

Open defects/conditions, owner and due date: ____________________________________.

Curriculum/accessibility/performance/security/AI/email/recovery evidence reviewed: ____________________________________.

Study permission and deployment conditions: ____________________________________.

Client reviewer name/role: ______. Signature or recorded approval reference: ______. Date: ______.

Team receiving the decision: ______. Follow-up review date: ______.

Leave all decision/signature fields unfilled until a real reviewer provides them. Preserve rejected/deferred decisions and their resolution; do not rewrite them as earlier approvals.
