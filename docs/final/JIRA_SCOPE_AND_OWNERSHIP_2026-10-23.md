# Jira scope and ownership correction — 23 October 2026

This update supersedes the earlier same-day closeout's active-work list and preserves its historical record.

## Scope changes

- KAN-12 (MoM covering emails) and KAN-29 (Moodle submission/rehearsal) were archived using Jira's recoverable archive. They no longer appear in the active KAN project. Both had no child issues; no unrelated items were archived.
- KAN-4 and KAN-30 are Done. The project owner directly confirmed that pilot testing was already conducted with more than 30 teachers. The prior ten-teacher plan and fieldwork-not-started labels were superseded. No dates, participant identities, consent records, scores or measured findings were invented.
- Load testing was removed from active requirements at the owner's instruction. KAN-31 was renamed to backup/recovery readiness for the existing production database and remains In Progress for the separate full managed recovery work.
- Current scope notes were added to KAN-7/KAN-9/KAN-11/KAN-25 so archived administrative tasks are no longer described as current project gates.

## Current task ownership

The owner explicitly confirmed the requested 28%/24%/24%/24% split. It is measured across 25 active non-epic work items. Six epic containers are excluded because they group the same work.

| Owner | Work items | Share |
| --- | ---: | ---: |
| Darshan Sonawane | 7 | 28% |
| Vishal Patel | 6 | 24% |
| ashok chilka | 6 | 24% |
| Raghuram Gundi | 6 | 24% |

KAN-11, KAN-13 and KAN-19 were reassigned to Darshan. Current ownership changed; historical authorship, worklogs and coding contributions were not rewritten. Original issue owners are preserved in the audit record and Jira history.

## Verification

- 31 active issues: 25 Done, 3 To Do, 3 In Progress.
- The two archived issues are absent from active-project JQL.
- Jira's filtered list shows 25/25 work items, grouped as Ashok 6, Darshan 7, Raghuram 6 and Vishal 6.
- Remaining open keys: KAN-1/KAN-2/KAN-3 (undefined legacy tasks), KAN-24 (educator approval), KAN-28 (client UAT/owner handover), KAN-31 (managed recovery).

[Verified task view](https://darshansonawane1110.atlassian.net/jira/software/projects/KAN/list?jql=project%20%3D%20KAN%20AND%20issuetype%20!%3D%20Epic%20ORDER%20BY%20assignee%20ASC&groupBy=assignee). Machine-readable record: [jira-scope-ownership-2026-10-23.json](../../artifacts/qa/jira-scope-ownership-2026-10-23.json).
