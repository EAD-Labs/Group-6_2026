# PromptShala Client Prototype Walkthrough

## Meeting objective

Obtain client approval or consolidated corrections for the participant experience before Module 1 implementation. The walkthrough demonstrates design and intended interactions; it is not a claim that authentication, persistence, quiz scoring or AI services are already implemented.

## Prototype reference

- Stitch project: `PromptShala Participant Prototype`
- Project ID: `4184827677131354974`
- Primary persona: Meera, beginner Classes 5–10 Mathematics/Science teacher
- Desktop entry screen: `4ec16e0dedb24451acd6c9847ba18eb4`
- Mobile linked entry screen: `dbff58273770405d87a64e819343de12`
- Full screen manifest: `docs/design/STITCH_PROJECT.md`

## Recommended team roles

| Role | Responsibility |
|---|---|
| Presenter | Narrates the teacher problem, design rationale and decisions requested |
| Demo operator | Controls Stitch and follows the exact click path without switching context |
| Technical responder | Answers implementation, privacy, accessibility and deployment questions |
| Note-taker/timekeeper | Records decisions verbatim, unresolved questions, owner and due date |

Suggested allocation: Darshan presents, Vishal operates the prototype, Raghuram handles technical questions, and Ashok records decisions. Change this allocation if another member is more comfortable presenting.

## Preparation checklist

Complete these steps at least 20 minutes before the meeting:

- Sign in to Stitch and open `PromptShala Participant Prototype`.
- Start at the desktop Sign-in screen and confirm buttons move between screens.
- Open the desktop failure result, passed result, UI state board and mobile entry in separate tabs as recovery points.
- Set browser zoom to 100% and disable notifications.
- Confirm stable internet; keep screenshots or the screen manifest available as fallback.
- Keep Jira `KAN-17`, the HLD and this walkthrough open for decision recording.
- Agree that only the presenter answers initially; other members add details when invited.
- Do one timed rehearsal and finish in 12 minutes or less.

## Opening statement — 30 seconds

Say:

> Good morning. Today we are showing the proposed participant experience for PromptShala, based on the approved teacher persona and HLD. We will demonstrate the complete journey from sign-in to lesson completion, quiz failure and retry, successful module unlock, mobile responsiveness and accessibility. This is an interactive design prototype, so today we are asking for approval of the flow, content structure and rules before implementation.

## Complete 12-minute walkthrough

### 1. Persona and design direction — 45 seconds

Show the desktop Sign-in screen.

Say:

> The primary user is Meera, a beginner school teacher with limited preparation time. She may use an Android phone or a laptop and may have unstable connectivity. She needs practical classroom examples rather than technical AI theory. The interface therefore uses short steps, plain language, one main action per screen, visible progress and safe recovery when something fails.

Point out:

- Calm off-white, navy and teal visual system.
- Large, clearly labelled actions.
- No API-key request during onboarding.
- Familiar form structure and visible help/privacy information.

### 2. Sign-in and onboarding — 90 seconds

Click path:

1. Sign-in — `4ec16e0dedb24451acd6c9847ba18eb4`.
2. Safe Use — `ce2af0e321b44c8fa3f74f2be2e070a9`.
3. Teacher Profile — `9c9dab72d2f14db5ba91e769664b107d`.
4. AI Familiarity and Goals — `3b8f5e0970f747fea0002973f59e94a6`.

Say:

> Onboarding has three short steps. First, the teacher accepts the safe-use boundaries: do not enter identifiable student information, AI content may be wrong, and the teacher must review anything used in class. We then collect only teaching context needed to personalize examples. The final step asks about AI familiarity and classroom goals without treating it as an exam.

Point out:

- Step indicator and Back navigation.
- Persistent labels and accessible validation.
- Class range, subject and teaching experience.
- Goals such as explaining concepts, assessments and lesson resources.
- Entered data remains preserved when moving back.

Ask briefly:

> Is this the correct minimum teacher information, or should any field be removed or made optional?

Record the answer without starting a long discussion; return to it during the decision section.

### 3. Dashboard and learning pathway — 90 seconds

Open Dashboard — `f4af257dc741449ea07d79bf24d11e82`.

Say:

> The dashboard answers three questions immediately: where am I, what should I do next, and what is required to unlock the next module? The teacher has one dominant Resume learning action, a time estimate and visible saved progress.

Point out:

- `Good morning, Meera` personalization.
- Current lesson and eight-minute estimate.
- Overall percentage and recent activity.
- Four learning modules with text statuses.
- Privacy reminder near learning actions.

Select a locked module or show the mobile locked detail — `0188e94bade849c9b677680dec5264f8`.

Say:

> Locked items are visible and explain the exact requirement. We do not use an unexplained disabled button. The current proposal requires completion of the previous lessons and at least 70% in the module quiz.

### 4. Module overview and lesson — 90 seconds

Click path:

1. Module Overview — `2d2e7437e5fa40fa8de3aa109bec7343`.
2. Lesson Player — `40de4614e78040c88eebeb248d5c41f2`.

Say:

> The module overview sets expectations before the teacher begins. It shows outcomes, total time, ordered activities and the pass requirement. The lesson itself supports a short video, captions, transcript and reading content. Progress autosaves, and the teacher can resume from the same point.

Point out:

- Completed, current, available and locked activity states.
- Captions and visible transcript control.
- Key points below the media.
- Module progress rail.
- Offline message: a cached lesson can continue, but submission waits for reconnection.

Clarify:

> Final learning videos and quiz content still require client approval. The prototype demonstrates the content structure and interaction.

### 5. Quiz introduction and question — 75 seconds

Click path:

1. Quiz Introduction — `14ca5eddd71c4a08a6d887f252c5e179`.
2. Quiz Question — `8fb9e1b8db4649c4b14f2026687cf937`.

Say:

> Before starting, the teacher sees the number of questions, time estimate, 70% pass rule, retry policy and highest-score retention. Questions use one focused scenario at a time. The design supports keyboard operation, visible focus and clear validation if no answer is selected.

Point out:

- Question count and progress.
- Full-width answer choices.
- Back action preserving the selected response.
- No timer pressure in the proposed MVP.

### 6. Failure, explanation and retry — 90 seconds

Open Failed Result — `248250812e5842f38149c853cc2a1cae`.

Say:

> This is an important learning state. A score below 70% is not treated as a dead end. The teacher sees the score, threshold, concepts needing review and explanations. The language is supportive rather than blaming. The highest valid score is retained, and the teacher can review the lesson before retrying.

Point out:

- Score 60% and threshold 70%.
- Two weak-concept summaries.
- Question explanations and review links.
- `Review and retry` as the dominant action.
- Preserved answers when submission or connectivity fails.

If asked why retries are allowed, answer:

> The product measures demonstrated learning, not first-attempt performance. Retrying after feedback supports the formative-learning purpose agreed in the HLD.

### 7. Pass and unlock — 60 seconds

Open Passed and Unlock — `17bc8689b8f94ea5b5e7b020553122ec`.

Say:

> After improvement, the teacher passes with 80%. The system confirms that progress is saved, Module 1 is complete and Module 2 is unlocked. The celebration is brief and accessible, and the next action is explicit.

Point out:

- Score and pass threshold shown together.
- Saved-progress confirmation.
- Module 2 status change.
- `Start Module 2` and `Return to dashboard` actions.

Return to Dashboard and show the updated pathway if time permits.

### 8. System states — 60 seconds

Open UI State Board — `48d3b5e8420948ae853d1ecfd43451a2`.

Say:

> We designed the non-happy paths before implementation. These are the standard loading, empty, locked, saving, saved, passed, failed, offline, timeout, session-expired and validation states. Each state explains what happened and what the teacher can do next.

Point out:

- Skeleton loading that preserves page structure.
- Empty state with a first action.
- Input preserved after errors.
- Status always uses text and icon, not colour alone.
- Unsynchronized work is never presented as submitted.

### 9. Mobile and accessibility — 90 seconds

Open mobile linked entry — `dbff58273770405d87a64e819343de12` or mobile Dashboard — `d643fffb5d084e15b4c316865a8d7800`.

Show Dashboard → Lesson → Quiz → Passed Result.

Say:

> The mobile version preserves the same decisions in a 390-pixel layout. Cards stack vertically, touch targets are at least 44 pixels, bottom navigation is labelled, and there is no horizontal scrolling. The experience targets WCAG 2.2 AA for the critical participant journey.

Point out:

- Single-column content and 16-pixel margins.
- Labelled Home, Learn, Progress and Profile navigation.
- Captions/transcript support.
- Text plus icons for every status.
- Visible focus and persistent form labels.
- 200% zoom/reflow intent and reduced-motion preference.

Open Offline Recovery — `8d53d85c72cf43aa9df126310bb2c542`.

Say:

> When connectivity drops, the interface distinguishes work saved on the device from work submitted to the server. Answers remain available for retry.

### 10. Scope boundary — 30 seconds

Say:

> This review covers the participant foundation and learning flow needed for Module 1. Prompt practice, reusable assistant creation, NotebookLM guidance, content transformation, certification and administration will follow the separate module schedule. Today’s approval prevents us from implementing the wrong navigation or progression rules.

## Client decisions required — 2 minutes

End the walkthrough and ask for one consolidated response to each item.

| ID | Decision requested | Current proposal | Record |
|---|---|---|---|
| UX-01 | Approve participant flow and screen inventory | Sign-in → onboarding → dashboard → lesson → quiz → retry/pass → unlock | Approved / changes |
| UX-02 | Approve onboarding fields | Class range, subject, experience, optional institution, AI familiarity and goals | Approved / changes |
| UX-03 | Confirm progression rule | All required activities plus at least 70% quiz score | Confirmed / revised |
| UX-04 | Confirm retry rule | Unlimited guided retries; highest valid score retained | Confirmed / revised |
| UX-05 | Confirm four module titles | AI Foundations, Prompt Engineering, Reusable AI Assistants, Using Your Own Materials | Confirmed / revised |
| UX-06 | Confirm learning-content direction | Short interactive lessons with captions/transcripts and teacher scenarios | Confirmed / revised |
| UX-07 | Confirm LearnLM/CRAFT direction | Initial configurable framework for prompt-practice feedback | Confirmed / revised |
| UX-08 | Confirm privacy wording | No identifiable student data; teacher reviews all AI output | Confirmed / revised |
| UX-09 | Approve desktop/mobile direction | Responsive web experience from 360 px upward | Approved / changes |
| UX-10 | Confirm first implementation scope | Module 1 access, onboarding, dashboard, lessons, quiz, progress and unlock | Confirmed / revised |

Use this exact closing question:

> Can we treat the participant flow, responsive direction and progression rules as approved for Module 1 implementation, subject to the specific corrections recorded today?

## Expected client questions and answers

### Is this already implemented?

> No. This is the clickable design prototype. It validates flow and screen behaviour before development. Implementation and testing follow the HLD schedule.

### Why do we need onboarding?

> It establishes safe-use boundaries and captures minimal teaching context so examples are age- and subject-appropriate. Returning users do not repeat completed onboarding.

### Why 70%?

> It is the current HLD proposal. The threshold is configurable and requires client confirmation before final quiz rules are implemented.

### Why allow unlimited retries?

> The course is formative. Feedback and revision are part of learning. Attempt history remains available, and the highest valid score supports progress without hiding the learning process.

### What happens without internet?

> Previously opened text lessons and drafts may remain available. Authentication, quiz submission, progress synchronization and AI actions require connectivity. The interface never falsely marks unsynchronized work as submitted.

### Where is prompt engineering?

> This walkthrough validates the foundation and learning shell. Prompt practice is the next delivery module and uses the LearnLM/CRAFT direction after client confirmation.

### Does the system store API keys?

> API-key setup is not part of this onboarding flow. If teacher-provided keys become necessary later, handling and non-storage must be separately approved and clearly explained.

### How is student privacy protected?

> The product does not require identifiable student information. The warning appears during onboarding and relevant activities. Production controls will also apply server-side validation, access control and approved retention rules.

## Feedback recording template

Record feedback during the meeting in this format:

| Screen/decision | Client feedback | Type | Owner | Due date | Jira issue |
|---|---|---|---|---|---|
| Example: Teacher Profile | Institution should be optional | Change | Team | 5 Sep | KAN-17 |

Feedback types:

- `Approved`: no change needed.
- `Required change`: blocks implementation or client approval.
- `Enhancement`: useful but not required for the current module.
- `Open decision`: client/team must confirm after the meeting.
- `Out of scope`: record for future review without adding it to the current sprint.

## Meeting close — 30 seconds

Say:

> Thank you. We will send the minutes with today’s decisions, required changes, owners and dates. Approved screens will move into Module 1 implementation. Any unresolved rule—especially the pass threshold, retry policy or LearnLM/CRAFT framework—will remain visible in Jira and will not be treated as final until confirmed.

## Post-meeting actions

Within two hours:

1. Add every approved decision and correction to Jira `KAN-17`.
2. Create separate implementation or design-fix issues for required changes.
3. Update the prototype only from consolidated client feedback.
4. Attach screenshots or the Stitch project reference to the meeting minutes.
5. Mark `KAN-17` ready for approval only after required design corrections are complete.
6. Begin Module 1 implementation from the approved screens.

## Walkthrough acceptance checklist

- Desktop happy path works from sign-in to module unlock.
- Failure, lesson review, retry and pass branch works.
- Locked prerequisite behaviour is demonstrated.
- Mobile Dashboard → Lesson → Quiz → Unlock path works.
- Loading, empty, saving, error and offline states are shown.
- Accessibility considerations are explained with concrete UI evidence.
- Persona rationale is tied to each major design choice.
- Prototype limitations are stated clearly.
- All ten client decisions receive an answer or named follow-up owner.
- Decisions and changes are recorded in Jira and the MoM.
