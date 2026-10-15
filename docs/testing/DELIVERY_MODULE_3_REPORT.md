# Delivery Module 3 report - Certification and Administration

Updated 15 October 2026. **Review-ready report; no client UAT or handover sign-off.** This technical delivery covers certification, staff operations, privacy/maintenance and receiving-owner delivery. The [1 October report](history/2026-10-01/DELIVERY_MODULE_3_REPORT.md) is retained as history.

## Delivered scope

Server-checked completion and idempotent certificate issuance; private PDF; public valid/revoked status without learner name; admin register/export/revocation. Staff tools include cohort/membership/role operations, scoped reports, structured lesson/cohort packages, immutable question-bank and 70-100% passing-score releases and planning estimates. Published lessons have goals, text, accessible media notes, activity/reflection, rights and preview. Final managed schema/role-write denials were verified on 15 October; ordinary-session client UAT remains separate.

The approved open pilot additionally has an administrator-only all-users activity report, versioned question checks, approximate active time/retries, page activity and complete event pagination. Private prompts, sources and assistant transcripts are excluded from routine staff reports. Facilitators retain assigned-cohort aggregate/minimal-roster access.

Account export/deletion, private-resource expiry, audit/activity cleanup, operations/recovery guides, current acceptance packet, A0 poster/visitor materials and study preparation support handover. Preparation and implementation are separate from actual operational acceptance.

## Current evidence

| Layer | Evidence | Result and limit |
| --- | --- | --- |
| Earlier managed certification/staff checks | [Release review](RELEASE_REVIEW.md), certificate/staff artifacts, [6 October pilot](../PILOT_RELEASE_2026-10-06.md) | Real ordinary synthetic sessions verified issuance/download/verification and staff operations on dated releases. Not final client acceptance. |
| Permission/reporting regression | Platform database, admin API and reporting tests | Local RLS/grants, atomic operations, scope, publication, eligibility/revocation and CSV safety checks. Final shared total: 435 automated tests in 66 files, not an additional module-specific total. |
| Maintenance | Prior production manual expiry rehearsal and automatic 2 October execution | Both passed on recorded revision; continue checking current daily runs/alerts. |
| Backup | October encrypted affected-table backup and local restore/migration rehearsal | Integrity/limited restore verified; full managed Auth/schema/all-data disaster recovery remains distinct. |
| Final operational additions | [Final 15 October QA](../../artifacts/qa/final-validation-2026-10-15.json), current working tree/evidence register | Retention inventory/history, public-health sampling and isolated-load guards are implemented/tested; managed schema is applied. Actual application deployment/CI and hosted workload results remain separate. No new long-term destructive cleanup is enabled. |
| Client acceptance | AC-10-12, AC-13-19 | Pending actual reviewer decisions and final handover. |

## Decisions to resolve

- Content Studio supports structured lesson/cohort updates; Knowledge checks supports immutable question banks and 70-100% passing-score releases. Original content remains the fallback. Final ordinary-role/audience client UAT remains separate from implementation.
- Planning minutes and published passing-score releases are distinct controls. Preserve open access and required lesson/practice/safe-use evidence. Historical verified passes remain valid; certificate issuance snapshots assessment evidence. Broader policy changes need reviewed releases.
- Account deletion removes certificate records. Resolve the HLD three-year register versus deletion and proposed twelve-month inactivity policy before enabling long-term deletion/archive.
- The first approved real administrator was assigned on 6 October. A fresh login/acceptance demonstration and alternate recovery owner are needed; do not list first-admin provisioning as still wholly missing.
- Role assignment is profile-wide; distinct per-cohort roles, temporary support access and durable AI retry queues remain architectural scope decisions if retained as requirements.

## Outstanding acceptance and handover

Reconcile reports against the actual published version (75 questions in the original banks) and test small-count suppression; use four ordinary roles and two cohorts for permissions, reassignment and publication audit. Complete a genuine eligibility journey, readable mixed-script PDF checks, private download/public status/revocation, and the agreed certificate approval.

Record the user's shared-production and email-deferred choices, secure ownership/credential transfer, monitored cron/provider operations and final review. Representative load and complete managed recovery remain unexecuted until an isolated target is available; do not run them on production or claim them passed. Finish actual UAT/defect decisions, receiving-owner reproduction and source release package; submit the A0 poster by 20 October and demonstrate on 23 October.

Final revision/environment/evidence: [current register](../final/FINAL_DELIVERY_RECORD.md). Reviewer/date: ______. Cases/results: ______. Open conditions/owner/due date: ______. Receiving-owner decision: ______.

No actual client sign-off, measured service target, Moodle receipt or historical handoff sequence is fabricated.
