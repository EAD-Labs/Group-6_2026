# Client prototype walkthrough

Target length: 8–10 minutes. Demonstrate desktop first, then the mobile adaptation and state board.

## Before the meeting

- Open the clickable Stitch prototype at the Sign-in screen.
- Keep desktop and mobile prototype links ready.
- Prepare the failure branch and passed branch in separate tabs if Stitch cannot branch interactions cleanly.
- Confirm all screens use the same teacher profile: Meera, Classes 5–10 Mathematics/Science teacher.
- Keep the HLD flow and the Jira design issue available for questions.

## Walkthrough script

### 1. Context and persona — 45 seconds

“This experience is designed for Meera, a beginner school teacher who has limited preparation time, often uses an Android phone, and needs practical classroom support rather than AI theory. The design therefore uses short steps, plain language, visible progress and safe retry behaviour.”

### 2. Sign-in and onboarding — 90 seconds

- Show familiar sign-in with no API-key request.
- Explain the safe-use notice: no identifiable student information, AI may be wrong, teacher review is required.
- Show how class range, subject and goals personalize later examples.
- Point out progress steps, validation and preservation of entered data.

### 3. Dashboard and module pathway — 90 seconds

- Show the dominant resume action and time estimate.
- Explain the four learning modules and visible statuses.
- Select a locked module and show the exact prerequisite rather than an unexplained disabled card.
- Point out saved progress and privacy reminder.

### 4. Lesson experience — 60 seconds

- Open Module 1 and the current lesson.
- Show video captions, transcript, reading fallback and activity progress.
- Mention autosave and the offline cached-lesson message.

### 5. Quiz failure and retry — 2 minutes

- Complete a sample quiz and take the failure branch.
- Show the 70% threshold, supportive language, explanations and weak-concept summary.
- Demonstrate `Review and retry`, preserved answers and highest-score retention.
- Show the network-error state and explain that progress is never falsely marked as submitted.

### 6. Pass and unlock — 60 seconds

- Complete the retry with 80%.
- Show the pass threshold, saved progress and Module 2 unlock.
- Return to the dashboard and confirm that its status changed consistently.

### 7. Mobile and accessibility — 90 seconds

- Switch to the 390 px mobile prototype.
- Show stacked cards, labelled bottom navigation, 44 px targets and no horizontal scroll.
- Point out text-plus-icon statuses, visible focus, captions/transcripts, error association, 200% zoom support and reduced-motion behaviour.

### 8. Decisions requested — 45 seconds

Ask the client to confirm:

1. The participant flow and screen inventory.
2. The proposed 70% pass rule, unlimited retries and highest-score retention.
3. The four module titles and initial lesson/quiz content.
4. LearnLM/CRAFT terminology for prompt-practice screens.
5. Whether progress/certificate screens remain in the current prototype scope.

## Acceptance checklist

- Complete happy path is clickable from sign-in to module unlock.
- Failure and retry branch is clickable.
- Desktop and mobile layouts are represented.
- Loading, empty, locked, passed, failed, offline and submission-error states are shown.
- Each screen has one clear primary action.
- Every locked state explains its prerequisite.
- Teacher data and classroom examples are realistic and non-sensitive.
- Accessibility annotations are visible in the handoff or walkthrough.
- Client decisions and change requests are recorded in Jira after the meeting.
