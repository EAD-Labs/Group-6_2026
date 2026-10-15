# Receiving-owner handover checklist

Prepared 14 October 2026. The checklist is ready for execution. Completion requires the receiving owner to perform the checks, not merely receive these files.

## Ownership and access

Record application/service owner, alternate incident contact, Supabase owner, Vercel owner, curriculum reviewer, facilitator and privacy/study contact in the restricted project register. Record access granted/revoked and the approved channel. The public repository must contain no passwords, API keys, backup decryption keys, real participant rosters or private recordings.

| Handover check | Evidence / receiving owner / actual date |
| --- | --- |
| Repository membership, branch protection and source revision confirmed | |
| Vercel project/domain/environment ownership confirmed | |
| Supabase organisation/project/roles and billing owner confirmed | |
| Approved administrator signs in; alternate recovery operator designated | |
| Gemini/email budget, sender and maintenance owner confirmed | |
| Secrets transferred through approved secret manager; no copy in poster/docs | |
| Departing team access disposition recorded | |

## Reproduce and operate

| Practical receiving-owner task | Evidence |
| --- | --- |
| Clone/install with documented Node/pnpm versions and frozen lockfile | |
| Run environment presence checker without printing secret values | |
| Run lint/types/tests/build and interpret failures | |
| Compare migration inventory to intended target; staging differs from production | |
| Deploy/redeploy from reviewed revision; public variables correctly built | |
| Verify live learner login/save/reload, staff denial and role access | |
| Complete one legitimate quiz retry and inspect saved evidence | |
| Exercise private resource/export/deletion and certificate boundaries | |
| Observe successful course/personal AI and record real evidence | |
| Record user-deferred email scope; if later reactivated, observe controlled recovery delivery | Deferred by user 15 October; no delivery result claimed |
| Verify maintenance schedule/executions and investigate a simulated failure | |
| Demonstrate safe rollback with compatible schema | |
| Rehearse full restore on isolated target; record achieved RPO/RTO | |
| Review monitoring, quotas, availability measurement and incident escalation | |

The October encrypted affected-table backup is not a complete managed recovery plan. Keep encrypted exports and keys separated under controlled access. Never rehearse by restoring over production. Do not enable an unapproved long-term deletion policy merely to close a checklist.

## Delivery inventory

| Artifact | Location and review boundary |
| --- | --- |
| Architecture and requirements | `docs/HLD/`, `docs/architecture/`; historical baseline plus accepted changes |
| Source and dependencies | GitHub repository, reviewed release/PR/CI, lockfile and configuration template |
| Guides | Participant/admin/setup/environment/operations documents |
| Current tests/defects | Final delivery register, actual outputs, acceptance CSV and defect register |
| Three technical reports | Foundation/Core, AI Practice/Workflows, Certification/Admin; previous October reports retained as history |
| Final poster/demo | `output/pdf/`, `artifacts/final-presentation/`, `docs/final/` |
| Study preparation | `docs/study/`; actual data in restricted approved storage |
| Tracking | Real Jira issue updates/links and team contribution evidence |
| Release package | Source tag/archive plus matching docs and evidence; receipt/ownership confirmed |

## Final receiving-owner decision

Reviewed source/deployment: ______. Receiving owner and role: ______. Actual review date: ______.

[ ] Can reproduce and operate [ ] Accepted with listed limitations [ ] Follow-up required.

Unfinished checks, risk/impact, owner and due date: ____________________________________.

Signature/approval reference: ______. Team handover contact: ______. Next maintenance review: ______.
