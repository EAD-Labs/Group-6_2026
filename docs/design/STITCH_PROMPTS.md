# Ready-to-paste Google Stitch prompts

Use one prompt at a time in the same Stitch project named `PromptShala Participant Prototype`. Generate desktop first, then mobile for each screen group so Stitch keeps the visual language consistent.

## Prompt 1 — Global design direction and desktop foundation

```text
Design a polished, high-fidelity responsive desktop web application called “PromptShala — Practical AI Literacy for Educators”. This is not a generic corporate LMS. The primary user is Meera, a beginner Indian school teacher of Classes 5–10 who teaches Mathematics or Science, has limited preparation time, may have tried ChatGPT or Gemini casually, and needs practical classroom examples rather than technical AI theory.

Create a calm, trustworthy, encouraging education-product visual language. Use a warm off-white background, deep navy or ink text, accessible teal/blue as the primary action colour, restrained warm accent colours, clear cards, subtle borders and very light shadows. Avoid neon colours, excessive gradients, glassmorphism, childish school illustrations, robot imagery and dense enterprise dashboards. Typography must be highly readable with strong hierarchy. Use realistic Indian school-teacher content and concise plain language.

Desktop target: 1440 px canvas, maximum content width about 1200 px, persistent left navigation, responsive cards, 16–24 px spacing rhythm and at least 44 px interactive targets. Navigation destinations: Home, Learn, Progress and Profile. Show PromptShala branding, current module context, profile menu and a small connectivity status. Every screen needs one clear dominant action.

Accessibility requirements: WCAG 2.2 AA colour contrast, visible keyboard focus states, semantic visual hierarchy, persistent form labels, text plus icons for status, no information conveyed by colour alone, captions/transcript controls for video, clear inline errors, reduced-motion-friendly interactions and content that remains usable at 200% zoom.

Design the desktop foundation using the Learning Dashboard as the main screen. Include:
- Welcome message: “Good morning, Meera”.
- A large Continue Learning card for “Module 1 — AI Foundations”, Lesson 2 of 3, 8 minutes remaining, with a prominent “Resume learning” button.
- Overall progress shown as “25% complete” with a labelled progress bar.
- Four learning module cards: AI Foundations (in progress), Prompt Engineering (locked), Reusable AI Assistants (locked), and Using Your Own Materials (locked).
- Locked cards must be selectable and clearly explain the prerequisite in text, for example “Complete Module 1 and score at least 70% to unlock”.
- A “Next requirement” panel.
- A compact privacy reminder: never enter identifiable student information.
- A recent activity area with lesson completion and quiz attempt examples.

Also show small reusable component examples beside the main artboard: loading skeleton, empty-progress card, locked badge, passed badge, failed badge, offline banner and saved-progress toast. Produce a cohesive product design that can be reused for all later PromptShala screens.
```

## Prompt 2 — Sign-in and onboarding, desktop

```text
Using the exact PromptShala visual system already established in this project, design the complete desktop sign-in and onboarding sequence for a beginner school teacher. Create four linked screens/artboards:

1. Sign in: PromptShala logo and purpose, email field with persistent label, Continue button, help link, privacy reassurance and a compact illustration or abstract education pattern. Include a small session-expired message variant and a validation error variant. Do not show social-login clutter or API-key fields.
2. Welcome and safe use: step 1 of 3, explain in plain language that PromptShala helps teachers practise useful AI skills. Present three short rules with icons and text: never enter identifiable student data; AI content can be wrong; the teacher must review classroom use. Primary action: “I understand, continue”.
3. Teacher profile: step 2 of 3. Fields for teaching level (Classes 5–7, 8–10, both), primary subject, years of teaching and optional institution. Explain that this information personalizes examples. Primary action: “Save and continue”. Include accessible validation and saving state.
4. AI familiarity and goals: step 3 of 3. Friendly non-judgmental choices for “I have not used AI”, “I have tried it a few times”, and “I use it sometimes”. Multi-select goals: explain concepts, create assessments, plan lessons/resources, communicate with parents. Primary action: “Continue to dashboard”. Include selected and saving states.

Keep each screen short enough for a 20–30 minute user mindset, show step progress clearly, provide Back actions without losing data, and use realistic teacher-focused copy. Add keyboard focus examples and error-summary placement.
```

## Prompt 3 — Module overview and lesson player, desktop

```text
Using the existing PromptShala desktop design system, create two linked high-fidelity desktop screens plus their important state variants.

Screen A — Module overview for “Module 1 — AI Foundations”:
- Module description in plain language: understand what generative AI can and cannot do for classroom work.
- Outcomes, estimated total time, current progress and pass requirement.
- Ordered activity list: Welcome lesson (completed), How AI responds (current, 8 minutes), Safe classroom use (available), Module quiz (locked until lessons complete).
- Each activity has icon plus text status, duration and action.
- Dominant action: “Continue current lesson”.
- Include separate variants for module available, in progress, completed and locked. The locked variant must state exactly what to complete and link to the requirement.

Screen B — Lesson player for “How AI responds”:
- Main content area with a 5-minute video placeholder, large captions control and visible “View transcript”.
- Key points below the video using short, scannable content.
- Right-side activity rail showing module activities and progress.
- Autosave indicator and “Continue to concept check” primary action.
- Include variants for loading skeleton, transcript open, reading-only fallback, lesson completed and offline cached lesson.
- Offline copy: “You’re offline. You can finish this lesson, but progress will sync when you reconnect.”

Do not use horizontal scroll. Keep reading line length comfortable. Make captions, transcript, keyboard focus and completion status visually explicit.
```

## Prompt 4 — Quiz, retry/pass and unlock, desktop

```text
Using the established PromptShala desktop visual system, design the complete concept-quiz decision flow as six linked artboards. The quiz pass threshold is 70%, retries are allowed and the highest valid score is retained.

1. Quiz introduction: “Module 1 concept quiz”, 5 questions, about 5 minutes, score 70% to pass, unlimited guided retries, primary action “Start quiz”.
2. Quiz question: “Question 2 of 5”, visible progress, one plain-language classroom scenario, four full-width radio-card answers, Back and Next actions, persistent answer label and keyboard focus example. Include unanswered validation.
3. Submitting state: preserve selected answers and show “Submitting your quiz…” without allowing duplicate submission.
4. Failed result: score 60%, threshold 70%, supportive headline “Almost there — review two ideas and try again”. Show explanations grouped by concept, which questions need review, highest score retained and dominant “Review and retry” button. Avoid red-dominant or shaming treatment.
5. Passed result: score 80%, threshold 70%, concise positive headline, progress saved confirmation, answer explanations and dominant “Continue”. Celebration must be restrained and reduced-motion friendly.
6. Unlock confirmation/dashboard update: Module 1 completed, Module 2 Prompt Engineering newly unlocked, visible before/after status and dominant “Start Module 2”.

Add visual variants for network failure during submission where all answers are preserved, retry loading, pass exactly at 70%, and a locked-module detail stating the unmet prerequisite. Never rely on green/red alone; use labels, icons and explanatory text.
```

## Prompt 5 — Mobile participant flow

```text
Convert the approved PromptShala participant flow into polished mobile web screens for a 390 px wide Android phone while preserving the same visual identity and content hierarchy. Create linked mobile artboards for: sign in, each of the three onboarding steps, dashboard first visit, dashboard in progress, module overview, lesson player, transcript open, quiz question, submitting, failed result, passed result, locked-item explanation, progress view, profile/preferences and offline/error recovery.

Mobile rules:
- Single column, 16 px outer padding and no horizontal scrolling.
- Minimum 44 by 44 px touch targets and readable type.
- Labelled bottom navigation with Home, Learn, Progress and Profile.
- One dominant primary action; it may be sticky above bottom navigation only when it does not cover content.
- Module cards stack vertically.
- Quiz answer options are full-width cards.
- Lesson transcript opens inline or as an accessible full-height sheet.
- Long result explanations use accordions with clear headings.
- Progress, locked, passed, failed and offline status use icon plus text, not colour alone.
- Show saved/unsaved state clearly and preserve answers on connection failure.
- Support 200% zoom, visible focus, screen-reader-friendly labels and reduced motion.

Use realistic teacher copy and make the mobile journey feel calm, practical and fast for a user who may be on a variable 4G connection.
```

## Prompt 6 — Progress, profile and all edge states

```text
Using the existing PromptShala design system, create a responsive desktop-and-mobile component/state board plus two complete screens.

Complete screen 1 — Progress:
- Overall percentage, four module statuses, completed lessons, quiz attempts, highest retained score and exact outstanding requirements.
- Empty-first-use variant with “Start Module 1”.
- Module-complete variant and all-modules-complete placeholder for future certificate eligibility.
- No public leaderboard or comparison with other teachers.

Complete screen 2 — Profile and preferences:
- Editable teaching level, subject and goals.
- Accessibility preferences: captions always on, larger default text and reduce motion.
- Privacy and data section explaining that student personal data must not be entered.
- Saving, saved and error states.

State board:
- Full-page loading skeleton and card skeleton.
- Empty dashboard.
- Locked lesson and locked module with exact prerequisites.
- Quiz passed and failed status cards.
- Saving progress and saved confirmation.
- Offline banner, server error, AI timeout and session expired.
- Error recovery must preserve user input and provide Retry or Return to saved work.
- Accessible form error summary, inline error and visible keyboard focus.

For every state include recommended plain-language copy, icon plus text, and desktop/mobile behaviour. Keep the tone encouraging and respectful to a beginner teacher.
```

## Prompt 7 — Clickable prototype connection instructions

```text
Connect the existing PromptShala screens into a clickable participant prototype with this exact path:

Sign in → Safe-use onboarding → Teacher profile → AI familiarity and goals → Dashboard first visit → Module 1 overview → Lesson player → Quiz introduction → Quiz question flow → Submitting.

Create two branches from submitting:
- Failure branch: Failed result → Review lesson concept → Retry quiz → Passed result.
- Success branch: Passed result → Module 2 unlock confirmation → Updated dashboard.

Additional links:
- Selecting any locked module opens the locked-item explanation, then links to its required activity.
- Home, Learn, Progress and Profile navigation works on every main screen.
- Transcript controls open and close the transcript.
- Offline/error variants include Retry and return-to-saved-work links.
- Back navigation must preserve entered onboarding information and selected quiz answers.

Use short transitions and respect reduced-motion preferences. Add concise prototype annotations for the client explaining autosave, the 70% rule, retry behaviour, responsive changes and accessibility features.
```

## Stitch generation checklist

- Keep every generation in the same project.
- Generate desktop and mobile as separate device outputs.
- Verify all status text is readable and not represented by colour alone.
- Replace generic placeholder content with the realistic copy above.
- Check that Stitch did not remove required states when refining a screen.
- Export screenshots for the walkthrough and retain editable Stitch screens.
- If exporting HTML later, treat it as visual reference and rebuild using the project’s Next.js components.
