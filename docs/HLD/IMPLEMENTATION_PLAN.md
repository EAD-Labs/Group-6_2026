# HLD completion and acceptance ledger

Baseline: all 25 pages of `PromptShala_HLD_v1.3_CRAFT_Updated.pdf`, including the preserved signed baseline; current implementation and Jira KAN-5/6/8/9/17/18/20/21. This ledger distinguishes implementation from evidence collected against an actual deployment.

## Decisions carried forward

- The later explicit open-curriculum decision supersedes HLD prerequisite navigation locks (AC-04). All four modules remain accessible. Completion still requires all lessons, valid quiz results and practice evidence.
- Keep the existing Next.js/React/TypeScript/Supabase architecture and navy/paper/terracotta identity. No framework rewrite or unrelated social/gamification features.
- Support teacher-owned pasted text and text files for transformation. Binary PDF/Office uploads and direct NotebookLM integration are not prerequisites for the HLD's upload/paste journey. Sources stay private, expire after 30 days when saved, and can be deleted by their owner.
- A guided demo is formative practice. It cannot issue a verified completion certificate, change staff roles or spend the production AI budget.
- Staff analytics expose aggregate completion and quiz patterns, never private prompts, assistant outputs or source text.
- Client approval, identity, signatures, pilot participation and cloud-service availability cannot be manufactured by implementation.

## Work plan

1. **Foundation:** isolate account state; recover failed/offline writes; grade submitted answers server-side; make saves atomic and conflict-aware; strengthen role and AI boundaries.
2. **Participant experience:** audit every route and screen size; readable typography; clear resume and missing requirements; accessible forms and drawers; persistent drafts; accurate status and error messages.
3. **Curriculum:** review each of the 29 lessons, preserve IDs, enrich examples and practical success criteria, validate supporting sources, document each lesson's review.
4. **Missing HLD functions:** private text transformation, deletion/export; completion eligibility and certificate register/download/verification/revocation; staff content lifecycle; cohorts, membership, roles, aggregate reporting and audit.
5. **Operations:** environment checks, secure headers, portable deployment, retention cleanup, backup/restore instructions, participant/admin guides and pilot/UAT materials.
6. **Review and repair:** unit/component/API and database-policy tests; production build; desktop/mobile browser journeys; accessibility/keyboard checks; performance smoke; independent second review, fixes and regression run.
7. **Release:** publish a reviewable branch and preview when service access permits; preserve protected-main review; record exact external setup/acceptance blockers without marking them complete.

## Acceptance matrix

| HLD criterion | Initial gap / required evidence | Planned work |
|---|---|---|
| AC-01 Access | Shared local state, silent failure; no real isolation evidence | Account-scoped drafts, identity-first hydration, retries, role policies, two-user integration checks |
| AC-02 Learning | 29 lessons exist; depth/approval uneven | Per-lesson pedagogical review, worked examples, reading alternatives, content review ledger |
| AC-03 Quiz | Client score accepted; drafts lost | Server grading, immutable answer/version records, saved quiz drafts, retry tests |
| AC-04 Access policy | HLD locks superseded | Preserve open access and test independent completion |
| AC-05 Prompt sandbox | Volatile prompt/comparison history | Persist drafts privately, clearer rubric feedback and comparisons |
| AC-06 AI resilience | Input survives only in mounted component; weak quotas | Saved drafts, authenticated AI, persistent quotas, cancellation/timeouts and fallback tests |
| AC-07 Assistant | Builder exists; evidence snapshots limited | Review editing/retest/export ergonomics and version evidence |
| AC-08 Transformer | Prepared practice only | Teacher text input, output formats, editable source-grounded draft, private save/export/delete |
| AC-09 Progress | Some copy and resume logic contradict actual completion | Exact requirement checklist and all-module resume |
| AC-10 Certificate | Missing | Server-verified eligibility, issued record, printable/downloadable certificate, verification and revocation |
| AC-11 Administration | Missing | Deny-by-default staff workspace, draft/preview/publish/versioning, cohort settings and role controls |
| AC-12 Reporting | Missing | Assigned-cohort aggregates and safe CSV export; private content excluded |
| AC-13 Responsive UX | Tiny text, long forms, drawer behavior | Review 360/768/1440 widths, readable typography and touch targets |
| AC-14 Accessibility | Manual/automated coverage incomplete | Semantic structure, keyboard/focus management, text alternatives, contrast and browser audit |
| AC-15 Performance | Authenticated load unverified | Timed local/preview smoke; 25-user staging test procedure and evidence where credentials allow |
| AC-16 Privacy | Retention/deletion incomplete | Accurate data notice, explicit source permissions, private ownership, expiry and deletion |
| AC-17 Security | Self-reported grades, non-atomic sync, demo AI access | Server trust boundary, transaction/RLS tests, limits, safe errors and dependency review |
| AC-18 Handover | Partial docs; final deployment pending | Setup, participant/admin guides, operations, deployment and honest release checklist |
| AC-19 Module evidence | Earlier reports only | Three delivery-module reports plus integrated results; no invented UAT sign-off |

## External acceptance dependencies

At initial inspection `.env.local` contains only a Vercel OIDC token, with no Supabase or Gemini application configuration. Existing provisioning evidence and production configuration must be checked through authorized service access. The client must ultimately approve curriculum, privacy/AI processing, certificate wording/signatories, production release and the ten-user pilot. The scheduled field study is not a software task that can be completed by fabricating participants or results.

Progress, test output and unresolved dependencies will be recorded in `docs/testing/RELEASE_REVIEW.md` as work proceeds.
