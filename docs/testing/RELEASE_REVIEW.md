# Release review — 1 October 2026

## Result and boundaries

The reviewed local revision passes lint, TypeScript, all 221 tests across 33 files and the production build (74 generated routes/pages in the Next.js output). This is implementation and local verification evidence. It is not an accepted hosted release, a managed Supabase migration, a completed accessibility audit, a 25-person load test or a teacher pilot.

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

The local database suite runs all eight migrations in PGlite with Supabase Auth/role shims. It exercises trusted saves, role/cohort scope, roster reassignment/removal, certificate issuance/revocation, private resources, retention and content publication. Real Supabase Auth, email delivery and managed-database isolation still require staging checks.

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

## External release work still pending

Vercel's stored credential returned 403 for the existing project/team. A device-login refresh was initiated; hosting is not claimed successful until authentication, deployment completion and an origin smoke check are recorded. Local app credentials are absent. The latest database migrations have not been applied to the managed target in this session.

Use the [HLD ledger](../HLD/IMPLEMENTATION_PLAN.md), [operations runbook](../OPERATIONS.md) and [19-case UAT/pilot plan](UAT_AND_PILOT.md) for the remaining work: approved environment configuration, backed-up migration rollout, real two-account/role checks, recovery email, approved live AI, cloud save/reload/cleanup, hosted performance, backup/restore rehearsal, complete keyboard/screen-reader checks, client content/privacy/certificate decisions and the ten-participant study. Full course/quiz authoring and inactivity/certificate-archive retention policies remain documented scope gaps; versioned lesson addenda and resource/audit retention are implemented.

The requested release is organised into twenty new topic-based commits, five per named GitHub identity. Commit and push completion are verified in Git/GitHub, separately from the earlier four palette commits already on this branch.
