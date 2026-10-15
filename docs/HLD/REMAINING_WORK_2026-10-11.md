# PromptShala — remaining HLD work

Reviewed 11 October 2026 against all 25 pages of **PromptShala HLD v1.3**, current application revision `5073378`, release/operations records, the 10 October deployment evidence, GitHub PR #19, and the available Supabase project inventory. This is a completion audit, not client sign-off. No application, database, or deployment changes were made for this audit.

## Current position

The core application is implemented and deployed. Remaining work is primarily release verification, client decisions, operational readiness, and final delivery, with specific implementation gaps below. An overall completion percentage would obscure the difference between implemented features and accepted requirements.

- Four learning modules, 29 lessons, and 75 chapter questions; retryable module quizzes with server grading and saved progress.
- Registration, sign-in/out, optional AI-experience onboarding, account-scoped recovery of drafts, and synchronisation.
- CRAFT practice, revision/comparison, reusable requests, private checked-prompt history and feedback, and account export/deletion.
- Optional personal Gemini key held in tab memory, cleared on refresh/sign-out/account change, and forwarded only for explicit authenticated AI requests.
- Teaching-helper builder, editable/versioned Passports, tests/retests, duplication and export.
- Source Studio, NotebookLM guidance, teacher-owned pasted/text-file transformation, six output formats, private resource save/export/delete.
- Completion eligibility, certificate PDF, public verification, register and revocation.
- Staff lesson addenda, cohorts/membership, account roles, aggregate reporting/export, administrative audit, and administrator activity reports.
- Thirty-day saved-resource expiry and ninety-day audit/activity cleanup; prior production expiry and automatic-maintenance evidence exists.
- Apple-inspired redesign and simpler participant language; 297 automated tests and production build passed; 21 focused live checks passed on 10 October with both synthetic accounts and dependent rows removed.

PR #19 was verified **merged** on 10 October. GitHub currently exposes no release tag or published release. The production health endpoint returned HTTP 200 during this audit and reported configured Supabase/AI settings. Those flags do not prove successful Google generation.

## A. Implementation and operational work

| Remaining item | What is present | What still needs doing | HLD reference |
| --- | --- | --- | --- |
| General-recipient password recovery | Recovery/reset pages, callback, canonical redirect and validation | Configure approved SMTP and verify actual email arrival, usable/expired links, reset, sign-out and fresh sign-in. Latest operations/release records still identify this as outstanding. | AC-01; sections 7, 12, 15 |
| Successful live AI | CRAFT, helper and transformation server routes; optional personal key; validation, quotas, timeouts and fallbacks | Verify successful course-key and personal-key requests, selected model/response compatibility, all three workflows, teacher review and real failure/latency behaviour. The latest live personal-key check used a deliberately invalid key. Confirm provider/model/budget/privacy decisions in the release record. | AC-05–08; sections 10.4, 11.1, 11.4 |
| Separate staging and local setup | Vercel production and setup plans | Establish/evidence a protected staging deployment and separate Supabase database/credentials with synthetic data. The available Supabase inventory shows only the production project. Configure development against a sandbox; local application credentials remain absent. Do not treat a preview using production data as isolated staging. | Sections 10.5, 13.2; AC-18–19 |
| Content management breadth | Versioned plain-text lesson addenda with draft/preview/publish/archive | Full lesson/video/activity and quiz-bank authoring is not implemented. Per-cohort content assignment is not represented in the content-version model. Either implement the agreed scope or record acceptance of addenda plus code-managed curriculum. | Sections 4, 5.2; AC-11 |
| Course-policy configuration | Administrator can change planning minutes | Pass thresholds, access/prerequisites and required completion evidence remain code-managed. Build versioned controls only if required, otherwise accept/document this limit. Preserve the approved open-module policy; do not restore locking automatically. | Sections 4, 6; AC-04, AC-11 |
| Long-term retention | Resource expiry, event cleanup and account deletion | Agree and implement or explicitly revise the proposed programme-plus-12-month-inactivity retention for accounts/progress/quiz/prompt history. Resolve the proposed three-year certificate register against the current account-deletion cascade. Resource expiry already works; these longer policies do not. | Section 8.4; AC-16 |
| Versioned privacy consent | Saved acknowledgement and acceptance timestamp | Store the notice/policy version associated with acceptance; define how a changed notice is handled. The current consent timestamp is not a notice-version record. | User/Profile in section 8.2; AC-16 |
| Versioned prompt evidence | Saved task/prompt, full feedback, scores, source, model and timestamp | Store an explicit CRAFT rubric/scoring version on attempts so later rubric changes remain interpretable. Model identity alone is not a rubric version. Do not invent versions for historical records. | Sections 7.4, 8.3 |
| Monitoring and recovery operations | Some structured failure logging, request limits, cron and operating instructions | Establish traceable request IDs across critical flows, provider latency/error/usage visibility, alert ownership, ongoing maintenance checks and pilot availability measurement. Agree the ongoing daily backup/export mechanism, recovery point/time targets and controlled restore procedure. | Sections 7.2, 7.4, 11.1 |
| Full restore rehearsal | Approved encrypted backup and isolated PGlite restore/migration rehearsal for the three affected application tables on 10 October | Rehearse a full managed-environment restore into a separate target, covering Auth, roles/RLS, functions/triggers, all application data, migration history, configuration and post-restore user journeys. The existing rehearsal is useful but is not a full PostgreSQL/Auth disaster-recovery rehearsal. | Section 11.1; operations runbook |
| Repeatable browser/QA automation | Unit/component/API/database tests, manual browser review and private release smoke scripts | Add maintained browser journey tests and automated accessibility smoke checks to CI. Current Validate runs lint, types, tests and build, but no browser E2E or accessibility job. | Sections 10.2, 10.5; AC-14, AC-19 |

Additional architecture boundaries to record rather than silently treating them as failures: accounts currently have a global role, not a different role per cohort; there is no time-limited break-glass private-content support workflow; AI retries are user-driven rather than a durable automatic retry queue; Docker portability is configured but an actual container build/runtime check is not evidenced. Decide whether each is needed for the accepted pilot scope. Private work should remain inaccessible to routine staff reporting.

## B. Complete acceptance matrix

“Built / partial evidence” means the function exists and some tests passed. It does not mean the client completed or signed off the full HLD case. The October 1 UAT document contains historical “not run” entries that need reconciliation with later release evidence.

| HLD acceptance criterion | Current position | Remaining acceptance work |
| --- | --- | --- |
| AC-01 Access | Built; ordinary login, account isolation and save/relogin proven | General-recipient recovery; expired sessions; shared-device and second-device journeys on final release. |
| AC-02 Learning | All four modules/29 lessons built; curriculum reviewed internally | Educator/client approval of lessons, 75 questions, activities and scenarios; verify every supplementary video/link, captions, rights and suitability. |
| AC-03 Quiz | Built; grading, retries, immutable attempts and version checks tested | Final-release full quiz/retry/boundary journey and accepted question difficulty/answers across all four modules. |
| AC-04 Unlocking | Intentionally superseded by open access | Record accepted HLD change and retain evidence that open access does not grant completion or certificates. |
| AC-05 Prompt sandbox | Built; private saves/history/export checked live | Observe task selection, two revisions/comparison, reuse and reload through the final browser UI; record the educator's acceptance of feedback wording. |
| AC-06 AI resilience | Timeouts/fallbacks/limits implemented; invalid-key CRAFT fallback checked live | Exercise success, timeout, malformed response, provider failure, rate limits, retry and preserved input across CRAFT, helpers and own-material transformation. |
| AC-07 Assistant builder | Built and covered by component/state tests | Complete both repair and all-pass strengthening routes, six initial cases/three controlled retests, save/relogin/edit/duplicate/export and phone use on final deployment. |
| AC-08 Transformer | Built; older synthetic private-resource checks passed | Final UI test of pasted text and `.txt`, restrictions, all six formats, editable drafts, save/reopen/export, source checking, cloud deletion and clearing the separate local copy. |
| AC-09 Progress | Built; trusted saves and conflict handling tested | Reconcile complete/incomplete evidence across all modules, progress and certificate; final deployed offline interruption and two-tab conflicting-edit journey. |
| AC-10 Certificate | Built; prior production issuance/PDF/isolation/revocation checks passed | Current-release genuinely completed participant journey, final certificate wording/signatories, readable final PDF and real admin acceptance. |
| AC-11 Administration | Built within the narrower addenda/planning-minutes scope | Accept or close authoring/configuration gaps; final staff-role walkthrough of publication, cohorts, reassignment, membership, roles and audit. |
| AC-12 Reporting | Built; local permission/CSV tests and earlier synthetic staff evidence | Final assigned-facilitator versus wrong-cohort checks, current question-pattern reconciliation/CSV export, and real administrator activity-report acceptance. |
| AC-13 Responsive UX | Desktop/phone checks and older 360/768/1440 review exist | Final-release real interactive journeys at 360px, tablet and desktop; rotation/zoom; current/previous Chrome, Edge, Firefox and Safari support matrix. |
| AC-14 Accessibility | Accessible controls and preferences exist; partial review | Complete automated and manual keyboard/screen-reader audit against WCAG 2.2 AA, including errors, dynamic feedback, navigation, captions and zoom; fix/retest findings. |
| AC-15 Performance | No qualifying hosted load report found | Measure representative 4G dashboard ≤3s, non-AI p95 ≤2s at 25 authenticated users, AI target ≤15s/hard timeout ≤30s, errors and safe saves. Monitor 99.5% scheduled-pilot availability with the stated exclusions. The old 25-request local burst is not this test. |
| AC-16 Privacy | Consent gates, ownership, export/deletion, expiry and key non-storage largely implemented/tested | Final privacy/provider wording and retention decisions; notice/rubric versions; final storage/analytics disclosure and acceptance. Synthetic privacy checks already passed and should be carried into the ledger. |
| AC-17 Security | Significant API/RLS/grading/role/limit tests passed | Dated agreed pre-release security review, current dependency/secret/client-bundle review and abuse tests; record resolution of every Critical/High finding. Tests alone are not that sign-off. |
| AC-18 Delivery | Production, source, participant/admin guides and operations material exist | Current setup/ownership register, final presentation, release tag/archive, technical/test summary and receiving-owner handover checklist. |
| AC-19 Module testing | Three report drafts exist | Update each with actual revision/environment, unit/integration/UAT evidence, defects and client decision. Do not claim historical sequential handoffs occurred if not recorded. |

## C. Client records, documents and release package

1. Consolidated HLD v1.3/change-record acceptance. The appended signature page is the older v1.1 record; it does not establish approval of every later change.
2. Record existing authorised decisions: open all modules, public immediate-login signup, new private CRAFT text storage, optional tab-memory Gemini keys and the simpler UI. The old HLD change record still says prompt history is fingerprint-only. Record the administrator individual-activity scope alongside the aggregate/private-content boundary.
3. Resolve narrowed-scope items: code-managed curriculum/assessment policies; text-only PostgreSQL resources instead of object buckets; global roles; any support/retry/portability requirements. Approval records should reflect existing authorisations, not request the same permission again.
4. Record curriculum/video/quiz/rubric approval, provider/model/budget/processing approval, certificate wording/signatories and final retention policy.
5. Refresh `PROJECT.md`, the HLD implementation ledger, UAT status, all three delivery reports and operating/setup instructions. These contain stale counts, old missing-feature lists and resolved Vercel-access/migration blockers. Preserve historical reports as dated evidence rather than rewriting history.
6. Produce the final integrated test summary and defect register with actual pass/fail/blocked status, owner, severity and retest evidence. Obtain the client UAT/release decision.
7. Prepare the 15 October deck, speaker notes, demonstration path and fallback recording. The repository presentation is still the 10 September review deck.
8. Create the accepted release tag/archive and hand over source, guides, HLD, test reports, deployment/configuration inventory and controlled credentials to named owners. Link completion evidence to Jira; current Jira status was not independently verified in this audit.

## D. Ten-participant field study

The HLD schedules this separately for **16 October–6 November**, not as completed software work or an outcome to invent for 15 October.

- Confirm ten suitable teacher participants, facilitator/observer, cohort and actual session dates.
- Approve study information, separate voluntary research consent, withdrawal contact, recording permission where needed and data-retention dates.
- Finalise baseline/post-task materials, scoring rubric, observation/interview forms and pseudonymous analysis sheet; rehearse with fictional material.
- Observe independent versus assisted task completion, errors/recovery, actual timings, return/completion and withdrawals.
- Collect de-identified results, analyse the small sample with its limitations, record defects and client decisions, and prepare the findings presentation by 6 November.

There is a pilot plan. No completed ten-teacher field study, outcome dataset, analysis or client study acceptance was found in the repository.

## E. Order against the HLD schedule

| Window | Priority work |
| --- | --- |
| 11–13 October: integration/QA/UAT | Confirm narrowed scope; recovery email and successful AI checks; safe staging; critical-journey/accessibility/security tests; performance measurement; client UAT and defect dispositions. |
| 14–15 October: handover/presentation | Finalise acceptance records and three delivery reports; release tag/archive; current setup/user/admin documentation; final deck, demonstration and owner handover. |
| Before/through 16 October–6 November: field study | Full restore readiness and operational ownership before real participant data collection; ten-teacher sessions, observations, analysis and findings. |

If an item cannot be completed in its window, record the specific client-accepted deviation, impact and owner/date. Do not label it complete merely because the app is deployed.

## Not automatic additions to the backlog

Do not reintroduce module locks contrary to the later instruction. The HLD makes NotebookLM a guided external workflow, not a direct integration. Current agreed text/paste transformation does not require PDF/Word parsing or private object buckets unless that scope is expanded. The MVP is online-first: full offline completion, native apps, SSO/LMS, multilingual UI, social features, predictive analytics and enterprise multi-organisation administration are excluded. The proposed Tailwind/Zod choices do not require replacing working CSS/validation solely to match a draft stack description.

## Main evidence

- [Current HLD](PromptShala_HLD_v1.3_CRAFT_Updated.pdf)
- [HLD implementation ledger](IMPLEMENTATION_PLAN.md)
- [UAT and pilot plan](../testing/UAT_AND_PILOT.md)
- [Release review](../testing/RELEASE_REVIEW.md)
- [6 October pilot release](../PILOT_RELEASE_2026-10-06.md)
- [10 October changes](../design/CLIENT_FEEDBACK_2026-10-10.md)
- [Operations](../OPERATIONS.md)
- [Delivery reports](../testing/DELIVERY_MODULE_1_REPORT.md), [Module 2](../testing/DELIVERY_MODULE_2_REPORT.md), [Module 3](../testing/DELIVERY_MODULE_3_REPORT.md)
- [Merged PR #19 and release validation](https://github.com/EAD-Labs/Group-6_2026/pull/19)

Private backup, deployment and smoke records in ignored `.vercel` files were consulted for status; credentials and private account payloads are deliberately not included here.
