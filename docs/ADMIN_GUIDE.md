# PromptShala administrator and facilitator guide

Updated 1 October 2026. These are operating instructions for implemented features, not a record of live acceptance. The database migrations, server credentials and role checks must be verified in the intended environment before using real participant records.

## Roles and access

Sign in with your assigned account and open `/admin`. The server checks the authenticated identity and profile role on every staff API request. Hiding a navigation link is not the permission boundary.

| Role | Available work |
| --- | --- |
| Participant | Own learning, practice, resources, account data and eligible certificate; no staff operations. |
| Facilitator | Minimal rosters and aggregate reports for assigned cohorts; create and review lesson-addendum drafts. |
| Content manager | Create and review lesson-addendum drafts; reports only for cohorts assigned to that account. |
| Administrator | All cohorts and reports; publish/unpublish addenda; manage cohorts, membership, roles, certificate revocation and course planning estimates; inspect the activity log. |

The first administrator must be assigned by the authorised project operator after account creation; there is no public self-promotion flow. Follow [Operations](OPERATIONS.md). An administrator cannot change their own role in the application. Keep at least one separately controlled recovery administrator and review staff access when responsibilities change.

## Cohorts and participant reports

1. An administrator opens **Cohorts**, gives a cohort a recognisable name and chooses its dates and facilitator. The selected facilitator must already have an eligible account.
2. Add existing participant accounts to the cohort. Creating a cohort does not invite or create accounts. Check the intended account before enrolling it.
3. Under **Edit cohort details**, change the title, dates, status or facilitator. Only an administrator can save these changes. Reassigning a facilitator removes the former facilitator’s report access; leaving the field unassigned limits the cohort to administrators. Status does not lock the open course.
4. Open **Cohort insights** and review each cohort’s participant count, whole-course completions, module started/passed counts and mean best quiz scores. Expand **Enrolled participants** for names and account IDs only. An administrator can expand **Correct this membership** and remove a mistaken enrollment; this preserves the account and learning records.
5. Expand **Questions to revisit** for question text, concept, missed count and respondent count. Each participant contributes their latest server-verified attempt for the current quiz version; earlier question versions are excluded. Missed counts are hidden until at least three participants have a current-version attempt; the CSV leaves that count blank. Missing answers within a submitted attempt count as missed. Export the completion summary or question counts separately; neither CSV lists individuals.

The report does not include private prompt text, assistant transcripts or source drafts. A missing quiz mean means no recorded attempts, not a score of zero. A completion count is evidence of recorded course requirements, not proof of teaching improvement. Do not use small-cohort totals to infer sensitive facts about an individual. Store exports in the agreed project location with access limited to the review purpose.

The roster is for identifying membership, not inspecting an individual’s answers. A question miss pattern suggests a topic to revisit; it does not establish the cause of a mistake or diagnose a teacher. A zero respondent count means no current-version attempt. Historical attempts still remain in the participant’s own history. The workspace is not an invitation service or a full student information system; do not share service credentials with a facilitator.

## Content studio: versioned lesson addenda

The Content studio publishes additional plain text alongside an existing lesson. The original curriculum and quizzes remain versioned in the repository. This is not a full lesson replacement or quiz-authoring interface.

1. Select an existing module and lesson. Enter a clear title and the additional explanation or activity; blank lines separate paragraphs.
2. Use **Preview draft** to check the text. Confirm factual claims against a named source, classroom suitability, accessibility of the wording, permission and absence of identifying pupil data.
3. **Save new draft version** creates a version for review. Saving is not publishing. Record the teaching problem the addendum solves in your review notes.
4. An administrator reviews and **Publishes** the chosen version. A previously published addendum for that lesson is archived. Signed-in participants receive the published addendum; demo reading remains the built-in curriculum.
5. To revise, create a new draft version from the text, review, then publish it. To withdraw an addendum, use **Unpublish**. The original lesson remains available.

Recommended editorial review: one specific learning objective; a correct worked example; an instruction the teacher can carry out; an observable success check; a source when a factual claim needs one. Verify links and videos separately. A saved reference link does not establish that the whole resource has been reviewed.

## People, certificates and audit

In **People & roles**, change only an existing account whose identity and assignment you have checked. Role changes are privileged operations and appear in the activity log. Do not grant an admin role merely to solve an ordinary participant save problem.

**Certificates** lists issued records and supports a register export. The participant requests issuance; the server verifies saved course completion. Staff cannot grant a certificate by overriding incomplete learning in this UI. Issuance is idempotent for the participant and completion-rule version.

To revoke a record, verify the certificate identifier and enter the specific reason. Revocation is recorded in the audit log and public verification shows the revoked state. A repeated participant request does not silently undo revocation. Public verification deliberately omits the participant's name. Register exports contain personal information and need controlled storage.

**Activity log** shows recent staff and certificate operations. It is not a complete history of every learner click or a performance monitoring system. The current screen shows the latest 100 records; its absence from that screen does not prove an older operation never occurred. Audit cleanup deletes events older than 90 days when the scheduled maintenance job runs. Account deletion can remove the participant's certificate records; a three-year archive is not implemented.

## Course settings and completion policy

Course settings store module planning-minute estimates. The existing lesson text and individual reading estimates are code-managed. Changing a planning estimate does not change lesson content, assessment evidence, quiz questions or required scores.

The current completion policy is fixed in versioned code: open module access, all required lessons, at least 70% on each module quiz, and the applicable practice evidence. If the client changes the policy, create a reviewed release decision and test its effect on existing records and certificates. Do not describe this settings screen as a prerequisite or pass-mark editor.

## Before a cohort starts

Complete the relevant cases in [UAT and pilot plan](testing/UAT_AND_PILOT.md): two separate participant accounts, each staff role, recovery/sign-out, conflict/offline saving, quiz retry, certificate eligibility and PDF, resource privacy/delete/expiry, addendum preview/publish and assigned-cohort export. The operator should also rehearse restore and confirm the cleanup schedule. Use synthetic records until these checks pass.

If a participant reports a problem, collect the route, approximate time, account role, save-status text and reproducible steps. Avoid collecting their private source or prompt by default. For an erroneous published addendum, unpublish it and retain its version for correction. For service failures or data exposure, contact the designated operator and follow [Operations](OPERATIONS.md).
