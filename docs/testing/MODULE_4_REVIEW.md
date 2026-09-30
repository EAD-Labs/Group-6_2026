# Module 4 — implementation and review

## Scope

Participant curriculum Module 4 contains eight lessons, Source Studio and a five-question knowledge check. The module, chapters, Studio and quiz are open with zero prior progress. Completion requires all eight lessons, a complete source portfolio and a passed quiz. Four correct quiz answers pass; retries are unlimited.

The Studio is an original guided practice exercise with three fictional packs and five prepared artifact formats. It does not generate live AI, upload source files or connect to Google. External notebook work is optional. Its Markdown export is practice evidence, not a certificate.

## Verification

- `pnpm check`: lint, TypeScript and 93 tests across 13 files.
- `pnpm build`: production build includes all Module 4 routes.
- Unit coverage: passage-linked verdicts, two-sided conflict evidence, permission/privacy/revision/review/reflection requirements, malformed input sanitization, five draft formats, self-contained export and quiz pass/fail thresholds.
- Component coverage: edits invalidate teacher approval; selecting another case preserves the portfolio until explicitly started; default access includes Module 4 chapters, Studio and quiz.
- Pathway coverage: Module 4 completion is independent of earlier modules; full course progress requires all four modules' evidence.
- Browser checks: incorrect and corrected claim feedback, three explained audits, prepared worksheet editing, completed review, local-state reload, capstone completion and a five-answer quiz result.
- Browser progress check: one completed capstone plus passed quiz and complete portfolio does not prematurely mark the whole module complete.
- Responsive checks: Source Studio and lesson/quiz layouts stack at phone width; body text remains 11.25px. Desktop comparison keeps source passages beside claims without horizontal overflow.
- Export content and UI action verified. The in-app browser download-event observer did not return a saved-file path; confirm normal-browser file saving during client acceptance.

## Connected database release gate

Apply the existing base migrations, then `supabase/migrations/202609250001_modules_two_three_and_staffroom.sql`, then `supabase/migrations/202609300001_module_four_source_portfolio.sql`.

The new migration publishes eight lessons and the Module 4 quiz and adds a `source_portfolio` object on participant profiles. Existing profile RLS continues to control row access; authenticated insert/update grants cover only the added column.

Before production acceptance:

1. Apply the migrations on the intended database and verify lesson/quiz IDs match the participant-state API.
2. Sign in as a participant, save a portfolio, complete a lesson and submit a quiz; reload and confirm each record.
3. Use a second participant and confirm neither can read or change the other's learning records.
4. Change a reviewed draft and confirm review checks reset and module completion is recalculated.
5. Check offline/retry recovery, mobile/keyboard use and Markdown download in supported client browsers.
6. Review source rights, lesson wording and optional notebook guidance with the client.

These migrations and real signed-in isolation checks have not been applied or established by the local review build. Certification/administration and production release remain separate work.

## Evidence

- Curriculum: `docs/content/CURRICULUM.md`
- Lessons and quiz: `src/features/learning/module-four-content.ts`
- Studio logic and export: `src/features/learning/source-studio.ts`
- Studio interface: `src/components/source-studio.tsx`
- Participant API: `src/app/api/participant-state/route.ts`
- Client report: `progress.md`
- Review PR: https://github.com/EAD-Labs/Group-6_2026/pull/8
- Jira: https://darshansonawane1110.atlassian.net/browse/KAN-21
- Review deployment: https://promptshala-i2z9im0zc-sus-co.vercel.app/learn/module-4
