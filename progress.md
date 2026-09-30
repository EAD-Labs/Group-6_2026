# PromptShala — Project Progress

## Overall progress

**All four learning modules are implemented in the review build, covering 29 lessons and four knowledge checks.** The learning experience includes prompt practice, a reusable prompt library, AI Staffroom and Source Studio. Connected-service verification, certification, administration and final release requirements remain pending.

This is implementation progress. The complete platform is not yet ready for final production acceptance.

| Area | Status | What is available / what remains |
| --- | --- | --- |
| Module 1: AI Foundations and Responsible Use | Implemented for review | Six lessons, learning resources, practical checks and a retryable knowledge check. |
| Module 2: Classroom Prompt Writing | Implemented for review | Seven lessons, CRAFT practice, feedback, attempt comparison, prompt library and knowledge check. |
| Module 3: Reusable Teacher Assistants | Implemented for review | Eight lessons, AI Staffroom, assistant testing and repair activities, export and knowledge check. |
| Module 4: Working with Teacher-Owned Sources | Implemented for review | Eight lessons, optional notebook guidance, Source Studio, claim verification, classroom artifacts, portfolio and knowledge check. |
| Website design and navigation | Implemented for review | Refreshed homepage, course sidebar, compact typography and larger lesson video frames. |
| Participant progress and persistence | Implemented; final verification pending | Progress screens and persistence code are available. The extended database setup and signed-in checks remain. |
| Certification and administration | Pending | Certificate eligibility and issuing, administration screens, content management and aggregate reporting. |
| Production release | Pending | Database verification, client acceptance and final release checks. |

## Completed work available for review

### Module 1 — AI Foundations and Responsible Use

- Six lessons covering generative AI, useful teacher tasks, review before use, hallucinations and verification, tool selection and responsible use.
- Embedded video and reading resources, classroom examples and interactive concept checks.
- A five-question knowledge check with answer explanations and retries.
- Lesson completion and quiz results shown in participant progress.

### Module 2 — Classroom Prompt Writing

- Seven lessons covering clear requests, context and constraints, learning-focused planning, questions and feedback, differentiation, prompt experimentation and reusable templates.
- A CRAFT lab using Context, Role, Action, Format and Target.
- Custom task and prompt inputs, dimension-level feedback and comparison of attempts.
- A reusable prompt library with examples, review checks and known limitations.
- A five-question knowledge check.
- An AI evaluation integration with a clearly identified rule-based fallback. The review preview currently uses the fallback.

### Module 3 — Reusable Teacher Assistants

- Eight lessons covering assistant design, configuration, source boundaries, classroom rehearsal, testing, repair, handoffs and reuse.
- AI Staffroom starter templates: Misconception Detective, Lesson Rehearsal Partner and Resource Rescue.
- Editable Agent Passports defining purpose, required inputs, output format, boundaries and teacher review checks.
- Classroom context cards and source packs.
- Six challenge cases with expected behaviour, actual output, teacher review and verdicts.
- Versioned repair records and retesting evidence.
- Synthetic learner rehearsal, teacher-led workflow handoffs and reuse records.
- Assistant duplication and Markdown export.
- A ten-question knowledge check.

Live assistant testing is implemented but requires a configured AI service. The interface also allows teachers to record and review outputs from an approved external tool.

### Module 4 — Working with Teacher-Owned Sources

- Eight lessons covering evidence boundaries, safe source selection, notebook setup, grounded requests, citations, transformation, teacher review and a final portfolio.
- Source Studio with three original fictional practice packs: The disappearing puddle, Two pots, one careful conclusion and A bridge in the story.
- Claim-by-claim verdicts, selected source passages, reasoning and corrective feedback, including conflicting evidence.
- Editable worksheet, quiz, study guide, slide outline and audio script examples.
- A portable notebook prompt and optional guidance for an approved Google notebook tool.
- Source permission and privacy records, an explained revision, six teacher review checks and a course reflection.
- A self-contained Markdown portfolio with original passages, draft, claim audit, revision and limitations.
- A five-question knowledge check with explanations and retries.
- Module completion connected to whole-course progress, with all four modules required for full completion.

The Studio provides guided practice and prepared examples. It does not perform live AI generation, upload source files or connect to a Google account. The portfolio is a practice record rather than an issued certificate.

### Website and participant experience

- Updated PromptShala branding and a redesigned homepage with rounded course cards.
- A consistent navy, warm paper, peach and terracotta palette across the homepage, sign-in, onboarding, dashboard, progress, profile, settings and learning pages, with pale blue practice cards.
- An expandable course sidebar showing modules and chapters, plus a separate main menu.
- Smaller lesson typography, matched across module overviews, the CRAFT lab and AI Staffroom.
- Larger lesson video frames that fill the resource area.
- All implemented modules, lessons, labs and quizzes accessible from the start. Completion is recorded separately from access.
- Dashboard and progress screens showing completed lessons, quiz attempts, assistant evidence and source portfolio evidence across all four modules.
- Sign-in, onboarding and participant profile flows implemented for further acceptance testing.

## Quality checks completed

- All **93 automated tests** pass across **13 test files**.
- Code quality checks, TypeScript checks and the application build pass.
- Browser checks verify the compact typography on lesson pages, module overviews, CRAFT inputs and AI Staffroom editor fields.
- A regression check confirms that CRAFT practice opens for a participant with no completed lessons.
- Module 4 browser checks cover claim feedback, local portfolio reload, capstone completion, the knowledge check and independent progress recording.
- Phone and desktop layout checks confirm compact typography and accessible activity controls.
- Website palette checks cover the public homepage, sign-in, onboarding, dashboard, account pages and learning screens, with readable navigation states and working phone menus.
- The refreshed Vercel preview is deployed and ready for review.
- Relevant Jira issues include implementation evidence and outstanding work.

## Remaining work

### 1. Finish certification and administration

- Implement course-completion eligibility and certificate issuing and verification.
- Complete authorised administration screens, content management and cohort reporting.
- Verify role permissions and administrative audit controls.

The reusable-assistant learning module is distinct from the certification and administration work described in the technical delivery plan.

### 2. Verify connected services and participant data

- Apply the additional database changes for Modules 2, 3 and 4, AI Staffroom evidence and Source Studio portfolios.
- Verify that signed-in participants can save, reload and recover their learning records.
- Test that two separate participants can access only their own records.
- Configure and verify live AI evaluation and assistant testing in the intended release environment.

The review preview does not currently have a connected participant database. Its working interface does not establish production persistence readiness.

### 3. Complete acceptance and release

- Obtain client review of lesson content, assessment wording and the participant experience.
- Complete the signed-in journey, accessibility and mobile acceptance checks.
- Resolve issues found during user acceptance testing.
- Complete production deployment and verification, handover documentation and pilot preparation.
- Conduct the participant pilot and analyse feedback and learning results.

## Review links

- [PromptShala review preview](https://promptshala-df3wqyy9z-sus-co.vercel.app/learn/module-4)
- [Course colour refinement and review evidence](https://github.com/EAD-Labs/Group-6_2026/pull/9)
- [Module 4 implementation and verification evidence](https://github.com/EAD-Labs/Group-6_2026/pull/8)
- [Earlier module and website work](https://github.com/EAD-Labs/Group-6_2026/pull/7)
- [Learning and AI workflow tracking](https://darshansonawane1110.atlassian.net/browse/KAN-6)
- [Module 4 and Source Studio tracking](https://darshansonawane1110.atlassian.net/browse/KAN-21)
- [Integration and release tracking](https://darshansonawane1110.atlassian.net/browse/KAN-9)

The preview requires authorised Vercel team access. Client review access should be arranged before sharing it externally.
