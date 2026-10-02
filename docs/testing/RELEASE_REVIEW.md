# Release review — 1–2 October 2026

## Result and boundaries

The reviewed local revision passes lint, TypeScript, all 221 tests across 33 files and the production build (74 generated routes/pages in the Next.js output). The managed rollout and synthetic production evidence below extend these local results. Client acceptance, a completed accessibility audit, a 25-person load test and a teacher pilot remain pending.

The earlier compact typography is restored: 15px root size, Inter, and the existing heading/lesson sizes. New layout rules preserve that scale. All 29 lessons were reviewed in the curriculum matrix and checked in a browser at 360px, 768px and 1440px. Eighteen additional workspace/public routes were checked at the same widths. These checks cover visible rendering, titles, labelled controls and horizontal overflow; they do not substitute for a screen-reader or every-interaction acceptance test.

## Final local checks

| Check | Result |
| --- | --- |
| `pnpm check` | Exit 0: ESLint, `tsc --noEmit`, 221 tests / 33 files. |
| `pnpm build` | Exit 0: Next.js 16.3.6 production build, 74 generated pages/routes. |
| `pnpm audit --prod` | No known production dependency vulnerabilities reported. |
| `git diff --check` | No whitespace errors. |
| Local standalone HTTP smoke | All 47 reviewed routes returned 200; nosniff and frame-denial headers present. Presentation cookie used for demo routes. |
| Local HTTP burst | 25 concurrent dashboard requests, all 200. Median 6.5ms, p95 8.5ms, maximum 9.2ms. Response timing only; no cloud/database load, authentication workload or browser paint measurement. |
| Configuration check | Required Supabase URL/public key, trusted service key, cleanup secret and recovery origin absent locally; Gemini absent/optional. Missing settings remain visible. |
| Container | Dockerfile and standalone font tracing reviewed; Docker executable unavailable, so no container build/runtime result claimed. |

The local database suite runs all eight migrations in PGlite with Supabase Auth/role shims. It exercises trusted saves, role/cohort scope, roster reassignment/removal, certificate issuance/revocation, private resources, retention and content publication. The production checks below now establish synthetic Supabase Auth and managed-database isolation. Email delivery and complete staging acceptance remain pending.

## Issues found and corrected in the final review

- Two tabs could overwrite independent assistant edits or observations. The merge now combines fields and immutable histories, rebases version collisions, preserves deletions and pauses saves for a visible same-field conflict choice. Cached pending conflicts survive reload.
- A failed first live test could freeze an incomplete assistant Passport. Complete instructions are required; only a successful response freezes the instruction version.
- Retests could change the source pack or classroom context while claiming an instruction improvement. Every new observation records its original conditions; progress requires controlled comparisons. Older missing-condition records remain visible and need a fresh baseline through remix.
- A template required a claimed failure even when a response passed or the participant lacked approved AI access. Templates now record observed or guided review, with an honest limitation/next check. Legacy templates remain readable and require choosing that review basis.
- One fictional source example referenced a map absent from its supplied passage. The source and worked answer now agree.
- Unsupported-script certificate errors could replace the certificate page with JSON. Download errors now remain visible on the page with retry; successful PDF downloads use the shared download helper. Latin, Hindi/mixed-script and long-name PDFs were rendered and inspected locally with fictional data.
- Module 2/3 overview cards overflowed by 4px at 768px. The grid and card minimum-width were corrected; both now report scroll width 768px at viewport 768px.
- Navigation now marks the staff area correctly, and staff access errors provide a useful destination instead of a blank forbidden response.

## Browser evidence

- [Compact dashboard](assets/release-review/dashboard-compact.jpg)
- [Mobile lesson](assets/release-review/lesson-mobile.jpg)
- Lesson DOM checks: [360px](assets/release-review/lesson-mobile-audit.json), [768px](assets/release-review/lesson-tablet-audit.json), [1440px](assets/release-review/lesson-desktop-audit.json)
- [Initial workspace audit](assets/release-review/workspace-audit.json) and [resolved tablet checks](assets/release-review/final-corrections.json)
- [Production HTTP evidence](assets/release-review/production-http-smoke.json)

Chrome's viewport was confirmed against actual `innerWidth`. The in-app browser did not consistently apply its advertised size override, so it was not used to establish breakpoint measurements. Temporary browser overrides were reset. The course contents dialog was checked for opening focus, Escape dismissal and return to its trigger.

In the own-source workspace, a fictional teacher source produced a local worksheet scaffold containing the original numbered passages. The brief and editable draft survived navigation/reload, and editing the draft cleared checked review items. The browser displayed the download request, but its download-event observer timed out and no saved file was verified; a real saved-file check remains in UAT. Tests verify the export includes source passages and unfinished-review status. No participant or pupil data was used in this review.

## Hosted review and publication

Vercel access was restored. The [protected guided review preview](https://promptshala-4jx95cgrc-sus-co.vercel.app) reached READY as deployment `dpl_rgDCsVbmam2zwgHchYYfupg7vu6i`, from source snapshot `69673748`. Its cloud production build passed with 74 generated pages/routes. It requires the existing Vercel authentication; project-wide deployment protection remains enabled.

Hosted health returned 200 with the intended preview/fallback/not-configured flags. Demo state returned 200, unauthorized maintenance returned 401, and the source-gap lesson returned 200. A fictional teacher completed all three onboarding steps, answered a concept check, continued to the next lesson with one completion retained, and created an own-source worksheet scaffold. The hosted dashboard confirmed 15px root typography, Inter and no horizontal overflow at its actual 1280px width. The resource download request was visible, but the browser download event was still not observed.

- [Hosted dashboard](assets/release-review/deployed-dashboard.png)
- [Hosted checks and configuration flags](assets/release-review/hosted-review.json)
- [Four authenticated GitHub push batches](assets/release-review/github-push-batches.json)
- [Draft release PR](https://github.com/EAD-Labs/Group-6_2026/pull/10) and [successful initial GitHub CI](https://github.com/EAD-Labs/Group-6_2026/actions/runs/36900982728)

Twenty new commits were authored/committed five each by the four requested GitHub identities, and pushed in matching batches using each account's authenticated credential. The final release-evidence commit is amended after this initial hosted check to include these records and restrict the runtime to Node 24, preserving the requested twenty-commit split. The preview was uploaded from tracked Git files; user-owned PROJECT.md, local environment files and credentials were excluded.

Production `NEXT_PUBLIC_SITE_URL` is set to the existing canonical origin. A cryptographically random `CRON_SECRET` is stored as a sensitive production variable. No secret values are recorded in this report. This does not establish a scheduled execution. At that initial preview check, the local DNS resolver failed and the trusted server key was missing. No managed migration had yet been performed. The 2 October rollout below supersedes this initial configuration status.

The original twenty release commits were merged into main through PR #10 before this hosted record was complete. Their five-per-account attribution remains intact. The final eight-file evidence/runtime update is rebased onto that merge as the [post-release follow-up](https://github.com/EAD-Labs/Group-6_2026/pull/11); protected main history is preserved.

The [final guided preview](https://promptshala-8aq6q4l4z-sus-co.vercel.app) is deployment `dpl_2pPCh8M1Wu539pvmHzbtrbDZoVak`, READY, built from snapshot `0cda6142`. Its cloud build passed with Node major 24 pinned and 74 generated pages/routes; its health check returned 200. The browser confirmed the 15px root size and no horizontal overflow at 1280px. Application, font and migration source are unchanged from the merged release.

## External release work still pending

Production owner access is now restored; the 2 October rollout below records the managed migrations and secure configuration. Local app credentials remain absent. Connected deployment and ordinary-account smoke checks passed as recorded below; full client acceptance is pending.

Use the [HLD ledger](../HLD/IMPLEMENTATION_PLAN.md), [operations runbook](../OPERATIONS.md) and [19-case UAT/pilot plan](UAT_AND_PILOT.md) for the remaining work: remaining Gemini/SMTP configuration, recovery email, approved live AI, ongoing maintenance monitoring, hosted performance, backup/restore rehearsal, complete keyboard/screen-reader checks, client content/privacy/certificate decisions and the ten-participant study. Full course/quiz authoring and inactivity/certificate-archive retention policies remain documented scope gaps; versioned lesson addenda and resource/audit retention are implemented.

The requested release is organised into twenty new topic-based commits, five per named GitHub identity. Commit and push completion are verified in Git/GitHub, separately from the earlier four palette commits already on this branch.

## Managed production rollout — 2 October 2026

The authenticated owner session identified project `atqbligrqsderauzfrqi` in Singapore as healthy. The earlier hostname failure was confined to the local resolver: per-request secure DNS lookup restored REST access with TLS certificate verification intact. There were no Auth users, participant profiles or passed progress records.

Before changes, all 12 public application tables, schema catalogue definitions and Auth Admin user metadata were exported into an AES-256-GCM encrypted local backup outside Git. Decryption integrity passed; the checksum and counts are recorded in [production rollout evidence](assets/release-review/production-rollout.json). This is an application backup, not a full pg_dump or a completed isolated restore rehearsal.

The four missing migrations (202609250001 and 202609300001–003) were verified against their complete source text and executed in order, each in a transaction, through the owner SQL editor. All returned success. Earlier schema changes were already present; no CLI migration history was fabricated. The resulting schema has 22 RLS-enabled tables, 29 published lessons, four published quizzes and the auth profile trigger. Participant/anonymous roles cannot execute any of the six privileged functions, write trusted participant state or update profile roles. The service role can execute the privileged functions.

The existing service-role key is stored only as a sensitive Vercel production variable. The canonical site/recovery origin and cleanup secret are configured. Vercel functions are set to `sin1`, near the Singapore database, following [Vercel region guidance](https://vercel.com/docs/functions/configuring-functions/region). The connected deployment reached READY with 74 generated pages/routes. Its actual function region is `sin1`; the canonical origin is [promptshala.vercel.app](https://promptshala.vercel.app).


## Connected production verification — 2 October 2026

Deployment `dpl_CPVh3SH4rsmqejh25yB8iUWNfGP1` was built from `89fd32efbd8738e0b4cda489a8f8a6e473908faa`. Node 24, the Singapore function region, the production aliases and enabled daily cron definition were checked through Vercel. [GitHub CI](https://github.com/EAD-Labs/Group-6_2026/actions/runs/36915342392) passed. The public home and health endpoints returned 200. Health correctly reports fallback AI until a provider key is configured.

Two temporary synthetic accounts used ordinary authenticated sessions. No real participant work or outbound email was involved. Supabase ignored an attempted `admin` role in signup metadata and created participant profiles. Tests used service access only for explicit fixture setup/cleanup and temporary elevation of the synthetic staff identity.

| Area | Observed production result | Evidence |
| --- | --- | --- |
| Account boundaries | Own profile only; other profile hidden; privileged RPC denied to participants | [Account checks](assets/release-review/production-account-boundary.json) |
| Progress and sources | 17 checks: saved revision survives reload, stale/cross-account writes denied, private resource save/read/delete, RLS isolation, role/auth/origin rejection | [Connected checks](assets/release-review/production-connected-smoke.json) |
| Grading and certification | Eight checks: all four banks graded server-side, immutable submissions, eligible issuance, repeat UUID, owner PDF download, private denial and public verification | [Certificate checks](assets/release-review/production-certification-smoke.json) |
| Staff operations | Ten checks: scoped cohort/roster, private work excluded, versioned draft/archive, certificate revoke and public status | [Staff checks](assets/release-review/production-staff-smoke.json) |
| Invitation policy | Public signup returns `signup_disabled`; no new user created | [Policy check](assets/release-review/production-invitation-policy.json) |
| Retention | Expired source hidden before purge; deployed manual cron removes expired resource and old audit event, preserves current records; repeat function deletes zero | [Expiry rehearsal](assets/release-review/production-retention-smoke.json) |
| Browser | Actual sign-in, lesson concept check/completion, onward navigation, synced dashboard after reload, sign-out; 15px Inter and no overflow at 1280px | [Production dashboard](assets/release-review/production-dashboard.png) |
| Scheduler | Daily UTC schedule enabled; authenticated manual GET `/api/maintenance` returned 200 | [Vercel configuration](assets/release-review/production-vercel-production.json), [execution log screenshot](assets/release-review/production-maintenance.png) |

The downloaded synthetic certificate was a valid one-page PDF (9,823 bytes). Practical completion data used a labelled synthetic fixture; this does not claim a teacher completed the course. The earlier own-source browser saved-file check remains a separate UAT item.

Production Auth now has the canonical site origin and two exact callback URLs; public registration is disabled and email confirmation remains enabled. The first real administrator awaits the owner's chosen identity. [The setup guide](../SERVICE_SETUP.md) gives the exact Gemini and SMTP fields. The recovery acknowledgement has also been clarified: a generic response never guarantees that email was delivered.

The maintenance screenshot establishes a manually triggered production execution. Complete client UAT, approved provider/email tests, isolated restore, authenticated load and teacher pilot remain open. Full lesson/quiz CMS and the inactivity/certificate-archive policies remain the documented scope decisions above.

Both agent-created Auth accounts and their profile, progress, resource, certificate, content/cohort and audit records are absent after cleanup. No other users were deleted. [Cleanup verification](assets/release-review/production-synthetic-cleanup.json) records the zero remaining row counts. Temporary local plaintext server/test credentials were removed after these checks; the encrypted pre-change backup and its separately stored local key remain outside Git.

The automatic daily job subsequently ran at **09:05:17 India time on 2 October** (03:35:17 UTC): `vercel-cron/1.0`, HTTP 200, function region `sin1`, 1.28-second function execution. This occurred independently of the earlier manual runs. [Execution details](assets/release-review/production-automatic-maintenance.json) and [log screenshot](assets/release-review/production-automatic-maintenance.png) are retained.
