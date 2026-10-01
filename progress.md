# PromptShala — implementation and release progress

Updated 2 October 2026. The four learning modules and connected workflows below are implemented. **Production acceptance remains pending.** The guided preview is verified. Owner access is restored, an encrypted pre-change application backup is recorded, and the four missing production migrations have succeeded. Connected deployment and synthetic-account checks are in progress.

## What is implemented

| Area | Current code | Verification still required |
| --- | --- | --- |
| Learning content | 29 reviewed lessons: six foundations, seven prompting, eight assistant, eight source lessons. Original examples, concept checks, practical criteria/reflection; four retryable quizzes with 25 questions. | Client content approval, full video/caption review and teacher pilot. |
| CRAFT and prompt library | Context, Role, Action, Format, Target feedback; revision/comparison; reusable templates; explicit live/rule-based source labels. | Configured provider, actual timing/failure and teacher task checks. |
| AI Staffroom | Editable Passport/context/source pack, six role-aware challenges, expected/actual review, versioned repair/retest, synthetic rehearsal, handoff/reuse, export. | Approved live service, connected save/reload and observed teacher use. |
| Guided Source Studio | Three fictional packs, passage/claim audit, five prepared artifact formats, revision/review and portfolio export. | Final browser/UAT evidence for current revision. Studio uses authored practice materials. |
| Own-source transformation | Separate pasted-text/`.txt` workspace, six formats, local extractive scaffold, optional Gemini draft, review/export, private save/load/delete with 30-day expiry. | Managed-database isolation, actual provider calls and scheduled purge. No PDF/Word/cloud imports or generated slide/audio files. |
| Participant journey | Open access, onward lesson navigation, four-module missing-evidence lists, quiz review/retry, Dashboard/Progress. | Complete mobile, keyboard and screen-reader acceptance on approved deployment. |
| Auth and trusted progress | Account-scoped recovery, sync status/retry, revision/conflict handling, server scores from quiz answers, immutable attempts and atomic saves; password recovery pages. | Remote migrations, real two-account/session/email recovery and offline/cross-device checks. |
| Certificates | Synced eligibility, idempotent issuance, owner PDF, public valid/revoked verification, register/revocation. | Deployed eligible/ineligible flow, PDF review and privacy tests. |
| Administration | Role checks, cohort editing/reassignment/enrollment/removal, scoped names/IDs, aggregate completion/question CSVs, lesson-addendum versions and audit. | Connected role/UAT checks. Addenda supplement code-managed lessons; planning settings do not edit quiz/pass policy. |
| Account/privacy/operations | Account export/delete, privacy/help, retention function and authenticated daily cron, environment checker, container configuration and guides. | Scheduled execution, restore rehearsal, approved retention decisions, security and handover acceptance. |

## Curriculum review completed

All 29 lessons were checked against the HLD and research syllabus. Revisions make the teacher's decision visible: what a model does, what an instruction supplies, which source supports a claim, what to revise and how to judge a classroom draft. Worked examples include fraction reasoning, evidence-based science explanations and story inference. These examples are fictional; no learner outcomes or time savings are invented.

[The lesson matrix](docs/content/LESSON_REVIEW.md) records every lesson's changes and source references. Provider/education references were opened and checked. This does not claim every video was watched or an external account flow executed. [The quiz bank](docs/content/QUIZ_BANK.md) reflects the current 25 questions.

## Evidence recorded in this work

- Final `pnpm check` passed: lint, TypeScript and **221 tests in 33 files**. Final production build passed with **74 generated pages/routes** in the build output. Production dependency audit reported no known vulnerabilities.
- All **29 lessons** and **18 additional routes** were checked in Chrome at 360px, 768px and 1440px. Two tablet overview overflows were fixed and rechecked. The earlier 15px root/Inter typography is restored.
- The standalone local production server returned 200 for all **47 reviewed routes** with expected security headers. A **25-request concurrent HTTP burst** passed; this does not establish 25 authenticated users, hosted performance or render timing.
- Vercel access was restored; the [guided review preview](https://promptshala-8aq6q4l4z-sus-co.vercel.app) reached READY. Hosted onboarding, lesson completion/onward navigation, draft restoration and source scaffolding passed with fictional data. Health returned 200, and unauthorized maintenance returned 401. Production recovery origin and a sensitive cleanup secret are configured.
- GitHub CI passed and twenty new commits were published in four authenticated batches of five, one through each requested account.
- The local database integration suite exercises all eight migrations in a PostgreSQL-compatible harness with Supabase Auth/role shims. It is not a managed Supabase migration or deployed session test.
- [Final release review and browser evidence](docs/testing/RELEASE_REVIEW.md) records fixes, screenshots, measurements and remaining limitations, including a browser download whose saved file was not verified.
- Handover documents include the [participant guide](docs/PARTICIPANT_GUIDE.md), [admin guide](docs/ADMIN_GUIDE.md), [operations/restore runbook](docs/OPERATIONS.md), [19 UAT cases and pilot plan](docs/testing/UAT_AND_PILOT.md), and delivery reports [1](docs/testing/DELIVERY_MODULE_1_REPORT.md), [2](docs/testing/DELIVERY_MODULE_2_REPORT.md) and [3](docs/testing/DELIVERY_MODULE_3_REPORT.md).

Earlier reports, previews and screenshots concern earlier revisions. They do not prove these later changes are deployed. The report drafts do not assert the HLD's sequential module handoffs occurred.

## Scope decisions requiring an acceptance record

All modules open from the start under the user's subsequent direction; completion still requires lessons, quizzes and practice. This differs from HLD AC-04 prerequisite locking. Content administration adds versioned plain-text lesson notes; course settings store planning minutes. Full lesson/quiz authoring and a runtime pass-policy editor are not implemented.

The own-source tool handles text, including slide outlines/audio scripts as text output. It does not import arbitrary document formats or connect to Google files. Facilitator workspaces show assigned-cohort membership names/IDs and aggregate completion/question counts; individual quiz answers and private prompt/source work remain excluded.

Resource expiry is 30 days and audit cleanup 90 days when maintenance runs. An inactivity-based account deletion job and separate three-year certificate archive are not implemented; account deletion can remove certificate records. Resolve these policies before making broader retention promises.

## Remaining release work

1. Complete the connected production deployment and choose the first verified administrator identity. Supabase owner access, server credential, canonical auth origin and cleanup secret are configured. Gemini remains unconfigured.
2. Verify ordinary two-account/session isolation, trusted saves and recovery email. The encrypted application/schema backup and four missing managed migrations succeeded; there were no existing Auth users, participant profiles or passed records. An isolated restore rehearsal is still required.
3. Approve and test live AI with synthetic data; measure timing, failure/retry, rate limits and cost. Verify private-resource lifecycle and daily maintenance.
4. Extend the recorded local checks with connected acceptance; complete the 19-case UAT, keyboard/screen-reader/current-browser/360px checks, security review and measured 25-user load. Rehearse restore and record results.
5. Obtain content/privacy/scope/certificate wording decisions, complete three delivery-module reviews, deploy the reviewed revision and hand over ownership. Conduct the ten-participant pilot and report actual observations and limits.

Managed migrations are recorded as executed. Live provider success, connected production deployment, client UAT, load results, isolated restore rehearsal, pilot participation and sign-off are **not yet claimed complete**.
