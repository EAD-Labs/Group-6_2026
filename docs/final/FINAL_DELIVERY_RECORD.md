# Current delivery and evidence register

Updated 15 October 2026. **Prepared for review; client UAT, educational effectiveness and final handover are not signed off.** The existing deployed release and the new final working tree are different evidence boundaries. The user chose the existing production Supabase project for release and deferred emails for now; separate staging/restore/load remain unexecuted limitations, not prerequisites to claim newly completed work.

## Product and release boundary

| Area | Current evidence and limitation |
| --- | --- |
| Course baseline | Four open modules, 29 lessons, 75 questions; trusted quiz grading, saved progress, CRAFT, helpers, sources, certificates and staff reporting. Deployed production checks exist from 1-10 October. |
| Final additions | Public `/try` and reusable `/review-lab`; notice/CRAFT rubric versions; provider compatibility/resilience; structured lesson/cohort packages; immutable question-bank and 70-100% passing-score releases, server grades/private idempotent receipts, cross-device recovery, retained historical passes, current-version reports and certificate assessment snapshots. |
| Final local checks | 15 October: **435 tests / 66 files passed**, lint/types and production build passed. This is development evidence, not client acceptance. |
| Final browser evidence | 15 October: **27/27 journeys passed** across Chromium, WebKit and 360px Chromium; one screenshot capture passed, two intentional capture-only project skips; zero failures/flaky results, 13.994 seconds. Keyboard/reset/export and automated accessibility smoke included. Local Firefox launch is unavailable; Linux CI still needs observation. No full screen-reader/WCAG conformance claim. |
| Managed schema/advisors | Final assessment migration applied 15 October; existing profile/state/CRAFT counts unchanged, ordinary-role write/RPC denials verified. Equivalent cached identity checks in 27 RLS policies and 11 relationship indexes applied; performance advisors show zero warnings. Existing documented security-helper and plan-level password-protection limitations remain. |
| Earlier production evidence | 10 October: 297 automated tests and 21 focused live checks; two synthetic accounts removed with zero remaining Auth/profile/state/CRAFT records. Earlier managed certificate/staff/retention checks are retained in the release review. |
| Backup evidence | Approved encrypted backup of affected profiles, learning state and CRAFT records; decryption and isolated local migration/restore rehearsal completed. Complete managed Auth/all-database recovery remains a separate acceptance check. |
| Live AI / deferred email | Successful AI needs real evidence; previous fallback results are not successful generation. Email/SMTP/recovery delivery deferred by the user on 15 October; no email sent or delivery pass claimed. |
| Client and study | No client acceptance or teacher outcomes entered by the development team. Study data starts empty. |

Current recorded QA: [final 15 October validation](../../artifacts/qa/final-validation-2026-10-15.json) and [managed database/advisors](../../artifacts/qa/database-advisors-2026-10-15.json). The [14 October run](../../artifacts/qa/validation-2026-10-14.json) remains historical. Final production dependency audit reports zero known advisories; an upstream development dependency advisory remains reported despite the installed regression-tested parser-depth patch. Do not claim a zero all-dependency audit.

Public endpoint sampling is implemented with 22 focused guard/failure tests, response/body deadlines and safe fixed diagnostics; the [first actual 15 October sample](../../artifacts/operations/availability-2026-10-15.json) was healthy for both routes. Scheduled CI and Linux container build/runtime workflows exist on the feature branch; they are not active scheduled monitoring until merged to the default branch. Actual CI run results remain to attach. Neither a sample nor a workflow file establishes 99.5% uptime or managed recovery.

## Actual remote-service observation - 14 October

At 17:42 UTC, a controlled synthetic account on the existing production release received CRAFT HTTP 200 with a labelled rule-based fallback; helper HTTP 503; transformation HTTP 200 with an extractive fallback. The account was deleted after the check; detailed private evidence remains outside public source. **Successful managed AI is not established.** No recovery email was sent; valid personal-key success remains unverified. These observations concern the existing deployed release, not deployment of the new final working tree.

## Final release record

Complete these fields from actual release outputs before external acceptance. Blank fields mean not recorded.

| Field | Recorded value |
| --- | --- |
| Final reviewed source revision | |
| PR and CI run | |
| Production deployment identifier/time | |
| Production origin | https://promptshala.vercel.app |
| Visitor route HTTP/browser check | |
| Staging application/database identifiers | |
| Database migration inventory | |
| Current automated/browser result paths | |
| Live course/personal Gemini result paths | |
| Recovery email/reset evidence path | |
| Full recovery and performance report paths | |
| Client UAT decision/date | |
| Receiving-owner handover decision/date | |
| Moodle submission receipt/date | |

## Acceptance gates and ownership

| Gate | Evidence required to close it | Current boundary |
| --- | --- | --- |
| Core regression | Current lint/types/unit/database/build plus browser result on reviewed source | Final local 435/66, build and 27 journeys passed; attach actual source SHA/CI after publication |
| Remote identity/privacy | Ordinary A/B sessions, staff role/cohort denial, export/delete and private records | Earlier production checks exist; new release changes need smoke |
| AI / deferred email | Successful configured calls in three workflows; future recipient reset if email reactivated | AI needs real evidence; email deferred by user 15 October |
| Recovery/load/monitoring | Separate target, measured restore/workload; real sample/run history and owner | Sampling/guarded procedures ready; staging/restore/load unexecuted under shared-production choice |
| Curriculum/accessibility | Educator/video/caption review and manual assistive-technology tasks | Partial review; formal approval pending |
| AC-01-19 | Actual case results, defects/retests and accepted scope changes | Synthetic tests support review; client decision pending |
| Course delivery | A0 PDF preflight, working visitor route, demo rehearsal, Moodle receipt | Artifacts prepared; final live rehearsal/submission required |
| Field research | Genuine consented sessions and de-identified observations | Preparation only; no outcomes claimed |

## Public claims to use

- "The course is implemented; automated and focused synthetic checks support development review."
- "The visitor experience uses local checklist feedback and source scaffolds; no live AI is called in that path."
- "The review lab supports documented human judgement using portable rubrics; ratings do not verify factual correctness."
- "Client UAT and the ten-teacher field study are pending or in progress, as actually observed."

Do not claim time saved, learning gains, successful live AI, full accessibility compliance, hosted load acceptance or client sign-off without the corresponding evidence. Record dates/revisions rather than replacing historical failures with later success claims.
