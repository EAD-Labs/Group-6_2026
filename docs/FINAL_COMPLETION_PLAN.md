# PromptShala final completion plan

Started 13 October 2026. Scope: HLD v1.3, the 11 October evidence audit, approved client feedback, and the ET617 final-course announcements supplied on 13 October. Status is evidence-based: implemented, verified, awaiting external input, or pending. This plan does not substitute for client acceptance or teacher research.

**Owner update — 15 October:** use the existing production Supabase project for this release; email setup is explicitly deferred for now. The account's two active Free-project slots are full. No other project was removed or paused, and no paid plan was added. Separate hosted staging, full managed restore and the representative 25-user load test remain unexecuted. All six final additive/permission/performance migrations were applied after an encrypted backup and isolated migration tests; existing account/learning/CRAFT counts were unchanged. Jira is connected and updated: see [verified Jira record](final/JIRA_DELIVERY_2026-10-14.md). Staff lesson/question/threshold releases and receipt recovery are complete. Final local validation passed 435 tests across 66 files, lint, types, production build and 27 browser journeys; see [final validation](../artifacts/qa/final-validation-2026-10-15.json).

## Dates and delivery

The new announcement supersedes the old 15 October presentation milestone: submit **ET617_Group6_Poster.pdf**, A0 portrait (841 x 1189 mm), on Moodle by **Tuesday 20 October**; report at **9:15 AM Friday 23 October**, present **9:30 AM–12:00 PM** at **LA–LHC Complex Foyer, IIT Bombay**. Printing is arranged by the teaching team. The HLD's ten-teacher study remains 16 October–6 November unless the organiser changes it.

| Window | Deliverable and completion evidence |
| --- | --- |
| 13–15 October | Close implementable evidence/version gaps; public visitor journey; generic EdTech review module; maintained browser/accessibility tests; AI compatibility/resilience verification; draft/review/publish content operations. |
| 16–18 October | Integration, role/data isolation, hosted smoke/performance and recovery checks; screenshots; final poster; learner/staff guides; client UAT package; study rehearsal materials. |
| 19 October | Poster print preflight and QR scan; final deployed demonstration rehearsal; evidence and defect ledger; source/release review; receiving-owner handover. |
| 20 October | Submit the verified poster PDF on Moodle using the team's course account; record submission receipt. |
| 21–22 October | Fix material defects; rehearse visitor and team demonstration; confirm working QR/link, Wi-Fi/phone access and fallback files. |
| 23 October | Working learner-perspective demonstration, poster and concise explanation of requirements, pedagogy, iterations and generalisation. |
| Through 6 November | Real participant sessions, de-identified analysis, client findings and recorded acceptance. |

Dates are priorities, not claims of completed work. Actual verification and outstanding dependencies are recorded below and in the release evidence.

## 1. Product and scope

- Preserve four open learning modules, 29 lessons, 75 questions, trusted grading, privacy boundaries and existing accounts.
- Add **Teaching Review Lab**: a reusable, course-independent rubric workflow for checking learning objectives, source support, learner fit, accessibility and safe use; evidence-led human ratings, revision comparison and portable versioned export. Include validated custom rubric import for adaptation beyond PromptShala. A score must never imply factual correctness or replace teacher judgement.
- Add a public **Try PromptShala** visitor journey: fictional sample prompt, genuine local CRAFT feedback, own-material scaffold and review lab. Label local/rule-based work accurately; isolate it from signed-in records; provide reset and classroom review reminders. Full cloud learning stays authenticated.
- Complete versioned lesson resource/content authoring and cohort visibility where safely compatible with the current curriculum. Assess policy/quiz changes as explicit versioned releases; preserve old evidence and approved open access.
- Store the actual safe-use notice version on new acknowledgement and explicit CRAFT rubric version on new evaluation. Historical unknown versions stay unknown.
- Build retention policy configuration and safe dry-run/reporting before enabling any new destructive long-term cleanup. Certificate preservation versus account deletion requires a recorded client policy decision.
- Improve safe observability for AI attempts: request ID, workflow, mode/outcome and timing; no keys, prompts, source text or provider response bodies in logs.

## 2. Quality and evidence

- Run lint, types, meaningful unit/component tests, all-migration PostgreSQL permission tests and production build.
- Maintain Playwright visitor/public journeys and accessibility smoke checks in CI. Cover desktop/phone, keyboard and reset/export. Expand authenticated flows in isolated staging when credentials are available.
- Verify live Gemini success for course and personal keys in all three tools, plus timeout, malformed output, rate limiting and preservation/fallback. Verify current official API/model documentation.
- Prepare and execute applicable AC-01–19 checks; label client/educator acceptance separately from automated or synthetic checks.
- Conduct dependency/secret/client-bundle and Supabase advisor reviews; record findings and fixes without exposing account data.
- Measure hosted response times and representative authenticated 25-user workloads only against an isolated target. Report sample sizes/environment/limits; do not present a local request burst as HLD acceptance.
- Rehearse complete backup/restore to an isolated target with Auth, functions, roles/RLS, all data and migration/configuration inventory; maintain the existing approved encrypted backup. Use no production restore or destructive retention changes without a concrete reviewable policy.

## 3. Poster, demonstration and course evidence

- A0 portrait print-ready PDF, editable generator/source and preview. Six visible topics: client/problem; learners/personas; development and pedagogy; working features/screenshots; feedback-to-change evidence; implementation/generalisation. Use diagrams, real screenshots, readable large typography and a tested QR to the visitor journey.
- Visitor kit: three-minute independent path, fictional sample materials, instructions, public URL/QR, team five-minute explanation and recovery/fallback path. No shared production administrator credentials on the poster.
- Current client-decision matrix, AC evidence/defect ledger, integrated report and updated three module-delivery reports. Retain earlier reports as dated history.
- Updated README/setup/operations/environment separation and participant/staff guides; source architecture and receiving-owner handover.
- Current GitHub branch/PR/CI evidence and real Jira updates. Never invent past activity, backdate tasks or claim human contribution without evidence. Retain the authorised four-commit delivery pattern for this release where feasible.
- Real field-study pack: information/consent, ten pseudonymous participant records (initially empty), baseline/post tasks, observation/interview tools and analysis plan. Populate only from genuine consented sessions.

## 4. External dependencies and acceptance

| Dependency | Concrete preparation | Needed from authorised owner |
| --- | --- | --- |
| SMTP delivery | Recovery flow and test case ready; existing custom SMTP is disabled | Explicitly deferred by the user on 15 October. No email is sent for this release. |
| Valid live AI | Routes, compatibility/resilience tests, privacy/usage record | Valid configured course/personal Gemini key and accepted provider/model/budget. Keys stay outside chat and Git. |
| Separate Supabase staging | Migration/test setup and synthetic load harness ready | User chose the existing production database for the release. Isolated restore/load still needs a separate target; no paid plan or other-project deletion. |
| Jira | Connected account; 12 new assigned/dated tasks, current notes and verified workflow | Applied updates are recorded in the linked Jira delivery record; human acceptance remains open. |
| Client approval | Reviewable decision/UAT/retention/curriculum/certificate packet | Real client/educator decisions and sign-off; do not manufacture acceptance. |
| Moodle | Verified correctly named PDF and upload instructions | Course submission account/session and explicit upload authority if unavailable. |
| Teacher study | Ready forms/tasks/analysis workbook | Ten participants, facilitator, real sessions, study consent and observations. |

## 5. Work ledger

| Workstream | Status at start | Next evidence |
| --- | --- | --- |
| Existing core application | Deployed; latest prior record 297 tests / 21 live checks | Re-run on final source |
| Generic review lab / visitor journey | Implemented and verified | 27 browser journeys, custom-rubric/export/reset and accessibility smoke passed |
| Consent / CRAFT evidence versions | Implemented; migration and trusted notice-version tests passed | Final deployed new-save smoke |
| Authoring / configuration | Immutable lesson/question releases, cohort lessons and 70–100% thresholds implemented | Final ordinary staff/learner walkthrough and educator decisions |
| AI / SMTP | Actual existing-release AI check failed/fell back; SMTP deferred by user | Successful provider calls after final deployment; no email setup in this release |
| Isolated staging / full recovery | Separate target unavailable; same production DB selected | Isolated restore/load remains unexecuted |
| Poster / demo kit | A0 PDF, embedded font, decoded QR, real screenshots and script prepared | Final source counts and live visitor-route rehearsal |
| Reports / acceptance / handover | Current reports and blank decision/defect/acceptance forms ready | Actual reviewer decisions and receiving-owner checks |
| GitHub / Jira | Jira updates applied and read back; final Git release pending | Four account commits/pushes, reviewable PR and CI |
| Field study | Full preparation packet and blank pseudonymous CSVs ready | Genuine consented sessions from 16 October; no outcomes invented |

Detailed baseline: [11 October HLD audit](HLD/REMAINING_WORK_2026-10-11.md). The current plan and final evidence ledger must remain aligned; a pending external item cannot be marked complete because its checklist exists.
