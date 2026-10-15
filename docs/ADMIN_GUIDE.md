# PromptShala administrator and facilitator guide

Updated 14 October 2026. These are operating instructions for implemented features, not a record of client acceptance. Earlier production synthetic checks and the 6 October administrator assignment exist; verify the final release, role checks and current migration state before using real participant records.

## Roles and access

Sign in with your assigned account and open `/admin`. The server checks the authenticated identity and profile role on every staff API request. Hiding a navigation link is not the permission boundary.

| Role | Available work |
| --- | --- |
| Participant | Own learning, practice, resources, account data and eligible certificate; no staff operations. |
| Facilitator | Minimal rosters/aggregate reports and lesson-update drafts for assigned cohorts; propose knowledge-check drafts. |
| Content manager | Draft/review lesson updates and knowledge checks; reports only for assigned cohorts. |
| Administrator | All cohorts/reports; publish/archive lesson and knowledge-check releases; manage membership, roles, certificates and planning estimates; inspect the audit log. |

The first approved real administrator was assigned on 6 October 2026. For a new environment, the authorised project operator must bootstrap a specifically approved existing account; there is no public self-promotion flow. Follow [Operations](OPERATIONS.md). An administrator cannot change their own role in the application. Designate a separately controlled recovery operator and review staff access when responsibilities change.

The public visitor and review paths require no staff login, do not save course progress, and exclude real participant records. Do not place administrator credentials on the event poster or shared visitor device. Use a synthetic participant account for the longer learner demo.

## Cohorts and participant reports

1. An administrator opens **Cohorts**, gives a cohort a recognisable name and chooses its dates and facilitator. The selected facilitator must already have an eligible account.
2. Add existing participant accounts to the cohort. Creating a cohort does not invite or create accounts. Check the intended account before enrolling it.
3. Under **Edit cohort details**, change the title, dates, status or facilitator. Only an administrator can save these changes. Reassigning a facilitator removes the former facilitator’s report access; leaving the field unassigned limits the cohort to administrators. Status does not lock the open course.
4. Open **Cohort insights** and review each cohort’s participant count, whole-course completions, module started/passed counts and mean best quiz scores. Expand **Enrolled participants** for names and account IDs only. An administrator can expand **Correct this membership** and remove a mistaken enrollment; this preserves the account and learning records.
5. Expand **Questions to revisit** for question text, concept, missed count and respondent count. Each participant contributes their latest server-verified attempt for the current quiz version; earlier question versions are excluded. Missed counts are hidden until at least three participants have a current-version attempt; the CSV leaves that count blank. Missing answers within a submitted attempt count as missed. Export the completion summary or question counts separately; neither CSV lists individuals.

The report does not include private prompt text, assistant transcripts or source drafts. A missing quiz mean means no recorded attempts, not a score of zero. A completion count is evidence of recorded course requirements, not proof of teaching improvement. Do not use small-cohort totals to infer sensitive facts about an individual. Store exports in the agreed project location with access limited to the review purpose.

The roster is for identifying membership, not inspecting an individual’s answers. A question miss pattern suggests a topic to revisit; it does not establish the cause of a mistake or diagnose a teacher. A zero respondent count means no current-version attempt. Historical attempts still remain in the participant’s own history. The workspace is not an invitation service or a full student information system; do not share service credentials with a facilitator.

## Content studio: versioned lesson updates

The final release expands plain-text addenda into lesson packages: learning goal, teaching text, up to six reading/video links with accessible-alternative notes, activity/reflection, rights acknowledgement, learner preview and a chosen course/cohort audience. The original 29 lessons and 75 base questions remain available. Knowledge checks have a separate versioned authoring/release workflow below. Production schema and role-write denials were checked on 15 October; final application deployment and ordinary-role UAT remain separate.

1. Select an existing module and lesson, then **Who should see this update?** Choose everyone or the intended cohort. Facilitators are restricted to their assigned cohort drafts.
2. Add the update title, learning goal, plain-language teaching text, an activity and reflection. Reading/video links require HTTPS, a recognisable title and captions/transcript or an accessible-alternative note. Confirm sharing rights and suitability.
3. Use **Preview as a learner**. Check source support, classroom fit, instructions, accessible alternatives and absence of identifying pupil data. A typed accessibility note is not a completed media review.
4. **Save new draft** creates an immutable version for review; saving is not publishing. An administrator publishes the chosen version. The previous version for the same lesson and audience is archived. Global and cohort-specific updates can coexist without archiving another audience's version.
5. Choose **Revise as a new draft** for corrections. To withdraw publication, use **Unpublish**; saved history remains. The original lesson stays available.

Recommended editorial review: one specific learning objective; a correct worked example; an instruction the teacher can carry out; an observable success check; a source when a factual claim needs one. Verify all links/video/captions and the intended cohort visibility separately. A saved reference link does not establish that the whole resource has been reviewed.

## People, certificates and audit

In **People & roles**, change only an existing account whose identity and assignment you have checked. Role changes are privileged operations and appear in the activity log. Do not grant an admin role merely to solve an ordinary participant save problem.

**Certificates** lists issued records and supports a register export. The participant requests issuance; the server verifies saved course completion. Staff cannot grant a certificate by overriding incomplete learning in this UI. Issuance is idempotent for the participant and completion-rule version.

To revoke a record, verify the certificate identifier and enter the specific reason. Revocation is recorded in the audit log and public verification shows the revoked state. A repeated participant request does not silently undo revocation. Public verification deliberately omits the participant's name. Register exports contain personal information and need controlled storage.

**Activity log** shows recent staff and certificate operations. It is not a complete history of every learner click or a performance monitoring system. The current screen shows the latest 100 records; its absence from that screen does not prove an older operation never occurred. Audit cleanup deletes events older than 90 days when the scheduled maintenance job runs. Account deletion can remove the participant's certificate records; a three-year archive is not implemented.

## Course settings and completion policy

Course settings store planning-minute estimates. Use Content studio for lesson packages and **Knowledge checks** for question-bank/passing-score releases. A planning estimate does not impose a timer or change assessment evidence.

Access remains open, and required lessons, practical evidence and safe-use acknowledgement stay in place. A published knowledge-check release defines its passing score from 70% to 100%. Earlier server-verified passes retain the original bank/threshold; a newly published threshold does not retrospectively remove them. Certificate issuance snapshots the assessment evidence used. Changes to broader evidence requirements still require a reviewed release decision.

## Knowledge checks: draft, review and publish

1. Open **Knowledge checks**, choose a module and enter a clear check title. Set **Passing score (%)** between 70 and 100; the draft displays how many correct answers are needed.
2. Review each question's text, concept, lesson-to-revisit, single/multiple-answer type, choices, correct answers and explanation. A bank may have 5-40 questions, each with 2-6 answer choices. Questions need coherent correct sets, unique references and valid lesson mappings.
3. Add/remove questions or choices where needed, then **Save new knowledge check draft**. Staff can propose drafts; only an administrator can publish/archive. Educator review must check correctness, ambiguity, learner fit and answer explanations rather than treating validation as pedagogical approval.
4. Review the saved release, then publish its exact version. New attempts use that bank/threshold for everyone in the module; the earlier published release is archived. Lesson chapter checks retain their original formative bank.
5. Use **Revise as a new draft** for corrections. Unpublishing returns new attempts to the original course bank if no published release remains. Existing submissions and historical question text stay attached to their immutable version.

If a check changes during a learner's attempt, the application asks for a refresh/new attempt and keeps earlier verified results. Repeating an identical submitted attempt returns its committed private receipt; changed answers require a new attempt. Do not rewrite saved answers or manually grant passes. Verify current-version question reporting and certificate evidence with genuine learner sessions before acceptance.

## Before a cohort starts

Complete the relevant cases in [UAT and pilot plan](testing/UAT_AND_PILOT.md): two separate participant accounts, each staff role, recovery/sign-out, conflict/offline saving, quiz retry, certificate eligibility and PDF, resource privacy/delete/expiry, addendum preview/publish and assigned-cohort export. The operator should also rehearse restore and confirm the cleanup schedule. Use synthetic records until these checks pass.

If a participant reports a problem, collect the route, approximate time, account role, save-status text and reproducible steps. Avoid collecting their private source or prompt by default. For an erroneous published addendum, unpublish it and retain its version for correction. For service failures or data exposure, contact the designated operator and follow [Operations](OPERATIONS.md).


## Open pilot: every user and individual learning activity

Use an account with the database `admin` role and sign in at `/sign-in`; administrators go to `/admin`. New signup always creates a participant, regardless of submitted role metadata. The first administrator must be assigned by the authorised database owner to a specifically approved existing account. Subsequent role changes use People & roles and the existing audited staff operation.

The **All users & activity** tab includes every account, even without cohort enrolment. Search by name or email, page through 25 users at a time, and use **View activity** for chapter completion, best module scores, submitted quiz attempts, page visits, active time, clicks, question retries and the event timeline. Refresh after participant activity; events are batched approximately every 15 seconds, with a final attempt on leaving the page. Question observations are server-graded against a versioned question bank. Timeline pages contain 50 events; summaries cover the retained history. CSV exports include a visible roster page or the complete selected question summary and escape formula cells.

Active time counts visible interaction and pauses after 60 seconds of inactivity. Time to correct is calculated from question checks, including retries, until the first correct check. Elapsed time includes breaks; active time does not. Wrong checks can be edits before quiz submission. Lesson checks and module-quiz checks are distinguished by page path in the timeline. Submitted quiz results remain separate trusted assessment records. Browser timing is an estimate, not evidence of attention, and users can block telemetry.

Events start with this release and are kept for 90 days by daily cleanup. They contain control identifiers, option IDs and paths, without passwords, input values, URL parameters, private prompts or source text. Participants can read only their own events; individual reports require an administrator. Facilitators retain their assigned-cohort aggregate reports. Account deletion cascades activity. The first real administrator was explicitly selected and assigned on 6 October 2026; the identity is kept outside the public source register. Sign out and sign in with that account before the user acceptance check.
