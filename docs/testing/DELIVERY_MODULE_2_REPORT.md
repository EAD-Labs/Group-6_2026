# Delivery Module 2 report — AI Practice and Workflows

Prepared 1 October 2026. **Draft for review; no UAT or handover sign-off.** This is technical Delivery Module 2: CRAFT prompt practice, reusable assistants, source transformation and notebook guidance. It spans teacher-learning Modules 2–4. Attach a reviewed commit and actual deployed environment before acceptance.

## Scope delivered in code

- CRAFT lab with five-dimension feedback, revised-attempt comparison and a reusable prompt library. Feedback identifies live evaluation or rule-based fallback.
- AI Staffroom with editable Passport/context/source pack, role-aware challenge cases, expected/actual review, repair versions, retests, synthetic rehearsal, teacher-led handoffs, reuse and Markdown export.
- Guided Source Studio with three original fictional packs, passage-based claim audits, prepared editable resources, revision, review checklist and portable portfolio.
- Separate own-source workspace for pasted text or plain `.txt`, six output formats, editable local extractive scaffold, optional configured Gemini draft, source labels, review/export and private 30-day storage/deletion.
- Notebook guidance and verified provider references. It is not an embedded NotebookLM account integration, autonomous browsing agent or connector to a participant's Google files.

## Evidence currently available

| Layer | Evidence | Result and limit |
| --- | --- | --- |
| Pedagogical review | [Lesson matrix](../content/LESSON_REVIEW.md), teacher examples, Staffroom challenges and [quiz bank](../content/QUIZ_BANK.md) | Seven prompt lessons, eight assistant lessons and eight source lessons reviewed. Examples are original fictional teaching scenarios. Provider/help sources checked; videos not fully watched. |
| Targeted automated run | `quiz.test.ts`, `pathway.test.ts`, `source-studio.test.ts`, `open-curriculum.test.tsx` | Shared final curriculum run passed 32 tests/four files on 1 October; same run cited in Delivery Module 1, not an additional total. |
| Content lint | Six edited curriculum TypeScript files | Passed. Does not establish live AI, source transformation or all-app integration quality. |
| Further coverage in repository | CRAFT evaluator/provider tests, practice and Staffroom tests, participant isolation, database/resource tests | Release owner must attach the final run output. Local tests and mocked provider replies do not establish successful live calls. |
| Live Gemini | Authenticated consented requests, failure injection and timing | Not run with an approved configured provider in this session. |
| Remote private resource lifecycle | Own-source save/reload, A/B privacy, deletion/expiry and scheduled cleanup | Not run on managed Supabase or deployed cron in this session. |
| Module UAT | AC-05–08, relevant AC-09 and AC-13–17 in [UAT plan](UAT_AND_PILOT.md) | Not run or signed off. |

## Behaviour and scope boundaries

The prompt score evaluates request features; it is not proof of a correct classroom output. Staffroom live testing needs connected configuration; manual evidence must state its actual origin. Guided Source Studio uses authored packs and examples. Optional own-source transformation is a distinct workspace and does not replace the guided assessed portfolio.

The own-source default produces an extractive scaffold. Its local mode has no provider call. Live mode sends permitted text and the task brief to the configured provider, subject to authentication, saved consent, limits and timeout. A syntactically valid source label does not establish that its passage supports the claim; the teacher still checks it. PDF/Word import, arbitrary website import, cloud-drive integration and rendered slide/audio production are not implemented. Slide outlines and audio scripts are text outputs.

Connected saved resources expire 30 days after creation. Owner access filters expired rows and the maintenance function purges them; deployed scheduler execution is still unverified. Clearing the browser workspace is separate from deleting its server record. Exports and external-provider copies are outside application deletion.

## Outstanding acceptance work

Approve provider account, terms, budget and privacy notice; verify the selected model and actual response format; run successful and failing live requests without pupil data; retain measured latency and input-preservation evidence; test rate limiting under realistic sessions. In staging, rehearse resource save/reload with its teaching brief, owner isolation, size/type rejection, local/cloud deletion and expiry cleanup. Observe teachers doing a Passport repair/retest and a claim audit without hidden assistance.

Current external blockers: no local Supabase/Gemini configuration and Vercel team access 403. Client confirmation of scope boundaries and content remains pending. No time saving, learning gain or pilot completion is claimed.

The HLD requests a separate Module 2 test/demo handoff before Module 3 begins. This draft records current implementation; it cannot retrospectively prove that sequence.

Review record: revision **pending**; environment **pending**; tester/date **pending**; cases passed/failed/blocked **pending**; defects/waivers **pending**; client reviewer and decision **pending**.
