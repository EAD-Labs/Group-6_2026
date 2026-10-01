# Delivery Module 3 report — Certification and Administration

Prepared 1 October 2026. **Draft for review; no UAT or handover sign-off.** This is technical Delivery Module 3, distinct from the teacher-learning module about assistants. Attach the final reviewed source revision, deployed environment and actual test outputs before acceptance.

## Scope delivered in code

Server-checked completion eligibility; idempotent certificate issuance with saved name/date/rule version; owner-only PDF download; public valid/revoked verification without learner name; admin certificate register/export/revocation. Staff interfaces cover cohort creation/editing/facilitator reassignment/enrollment/removal, scoped minimal rosters, assigned-cohort completion and question-pattern CSVs, account role administration, versioned lesson addenda with draft/preview/publish/unpublish, planning-minute settings and privileged-operation audit events.

Account export/deletion, privacy/help pages, retention maintenance, environment checker, container configuration and operational guides support handover. Their existence is not evidence of deployment, recovery or retention execution.

## Evidence currently available

| Layer | Evidence | Result and limit |
| --- | --- | --- |
| Implementation review | `src/features/platform`, `/api/admin`, `/api/certificate`, `/verify`, `/admin`, platform migration | Code read to produce [Admin guide](../ADMIN_GUIDE.md) and [Operations](../OPERATIONS.md). Code review is not a connected role demo. |
| Automated tests in repository | `reporting.test.ts` checks cohort aggregates and CSV formula protection; `database.integration.test.ts` exercises migrations, roles/RLS, atomic writes, publishing, certificate denial/idempotency/revocation, cohort scope, resource ownership/expiry and quotas | Final run output to be attached by release owner. The local PostgreSQL-compatible harness supplies Auth/role/digest shims; it does not exercise managed Supabase Auth, HTTP sessions, deployment configuration or external services. |
| Certificate PDF | Server renderer and bundled font files | Actual download/content/rendering and accessible reading order must be verified with the deployed path; not accepted from code alone. |
| Targeted admin regression | Reporting, admin API and all-migrations database integration suites | 32 tests across three files passed after roster, cohort-edit and question-pattern changes. Includes permission revocation on reassignment, invalid-edit rollback, removal preserving learning, date validation and private-evidence projection. This is local evidence, not deployed UAT. |
| Staff and reporting integration | Four role accounts and two test cohorts in staging | Not run against a configured remote project in this session. |
| Operations | Environment checker, daily cron configuration and restore procedure | No configured deployment/cron execution or backup/restore rehearsal result claimed. |
| Module UAT | AC-10–12 and relevant AC-13–19 in [UAT plan](UAT_AND_PILOT.md) | Not run or signed off. |

## Policy and product limits

Certificates attest completion of recorded requirements, not accreditation or measured teaching improvement. The server must use synced trusted progress and saved consent/onboarding. A participant cannot grant themselves a pass by posting a score. Revoked certificates are not silently reissued for the same rule version.

Content management currently publishes plain-text addenda alongside code-managed lessons; it does not replace lesson authoring or edit quiz questions. Course settings store planning minutes; pass mark and open access are versioned in code. These limits need explicit acceptance against HLD AC-11.

Facilitators receive assigned-cohort names/IDs for membership and aggregate completion/question data. Question counts use each participant’s latest server-verified current-version attempt, with no individual selections returned to the browser. Missed counts stay hidden until at least three participants contribute; the CSV leaves those counts blank. Private prompt/source/assistant content is absent from routine reports. Exports containing participant names in the certificate register require controlled handling. Account deletion can remove certificate records; the HLD's proposed three-year archive and inactive-account retention job are not implemented.

## Outstanding acceptance work

Run all migrations in staging, bootstrap the first admin securely and verify role boundaries through real sessions. Test eligible/ineligible/unsynced issuance, repeated request, owner-only download, actual PDF text/font/layout, public verification, revocation and account deletion. Test staff draft/publish history, all cohort and role actions, wrong-cohort requests and report reconciliation. Verify maintenance authentication, schedule execution and physical purge with synthetic data. Rehearse backup/restore before the field study.

Complete accessibility review, measured performance/security checks, owner handover and all three delivery-module UAT records. Current external blockers are missing local connected-service credentials and Vercel team `sus-co` access 403. No remote migrations, pilot, client sign-off or production acceptance occurred as part of this documentation work.

Review record: revision **pending**; environment **pending**; tester/date **pending**; cases passed/failed/blocked **pending**; defects/waivers **pending**; client reviewer and decision **pending**.
