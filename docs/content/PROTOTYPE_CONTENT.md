# Prototype Learning Content Pack

## Content status labels

- **Prototype-ready:** suitable for the clickable prototype and client walkthrough.
- **Client confirmation required:** framework name, pass criteria, target grades, school board, languages, and API approach.
- **Implementation-ready after review:** content may enter the application after a second team review and client acceptance.

## Dashboard module cards

### Module 1 — AI Foundations and Responsible Use

**Description:** Recognise what generative AI does, where it can help a teacher, and what must be checked before classroom use.

**Estimated time:** 20 minutes

**Status text:** `Start module`, `Continue`, or `Passed`

### Module 2 — Classroom Prompt Writing

**Description:** Build a clear prompt, receive feedback across the five CRAFT dimensions, and improve it for a real classroom task.

**Estimated time:** 30 minutes

**Locked message:** Complete Module 1 to unlock prompt practice.

### Module 3 — Reusable Teacher Assistants

**Description:** Turn a successful prompt into a repeatable Gem-style assistant and test it with different classroom inputs.

**Estimated time:** 25 minutes

**Locked message:** Complete Module 2 to unlock reusable assistants.

### Module 4 — Working with Teacher-Owned Sources

**Description:** Use approved source material to create a classroom draft and verify it before use.

**Estimated time:** 25 minutes

**Locked message:** Complete Module 3 to unlock source-grounded workflows.

## Module 1 lesson placeholders

### Lesson 1 — Meet generative AI

**Intro:** Generative AI creates a new response from your instruction and patterns learned during training. It can draft an explanation, quiz, plan, or message. It does not “know” your class unless you provide safe, relevant context, and a fluent answer can still be wrong.

**Key message:** AI can help create a first draft. A teacher checks and improves the final classroom resource.

**Interaction:** Use the full activity in `INTRO_AI_ACTIVITY.md`.

### Lesson 2 — Useful teacher tasks

**Body:** Useful starting tasks are low-risk and easy for a teacher to review: brainstorming examples, changing reading level, drafting formative questions, outlining a lesson, or preparing a neutral communication template. AI should not make final high-stakes decisions about a learner.

**Try it:** Select two tasks where an AI draft could save preparation time.

### Lesson 3 — Review before use

**Checklist title:** Stop, check, then teach

- Check facts and calculations.
- Check curriculum and source alignment.
- Check age level, accessibility, and inclusive language.
- Remove personal and confidential information.
- Check copyright and permission for any source or media.

**Callout:** Never paste student records into a public AI tool.

### Optional embedded video

**Title:** Prompt engineering with Gemini

**Publisher:** Google for Education

**Source:** `https://www.youtube.com/watch?v=ZXeFRH8z_yw`

**Display note:** This optional video opens or plays from the official YouTube upload. PromptShala does not host the video. The essential lesson is available in text above.

## Module 2 lesson placeholders

### Lesson 1 — Why prompt detail matters

**Heading:** A clear prompt is a clear teaching brief

**Body:** Use CRAFT to add only information that helps: Context, Role, Action, Format and Target. Keep privacy and teacher review as non-negotiable safeguards. More words are not automatically better; useful details are better.

**Comparison:** Use the weak and classroom-ready fractions prompts in `PROMPT_LESSON_AND_RUBRIC.md`.

### Practice selector

**Heading:** Choose a teacher task

- Explain a concept
- Create a quiz
- Plan a lesson
- Draft parent communication
- Create a worksheet or slide outline

**Supporting text:** You will write a first attempt, review dimension-level feedback, and revise it. Use fictional or general classroom information only.

## Loading, empty, locked, passed, and failed copy

### Loading

- `Loading your lesson…`
- `Checking your answers…`
- `Preparing rubric feedback…`

### Empty state

**Heading:** Your learning path is ready

**Body:** Start Module 1 to learn the basics through a short interactive activity.

**Action:** `Start Module 1`

### Locked state

**Heading:** Complete the previous module first

**Body:** Pass the current module quiz to unlock this module. You can retry as many times as needed.

**Action:** `Return to current module`

### Passed state

**Heading:** Module passed

**Body:** You scored {score}%. Review your explanations at any time, or continue to the next module.

**Actions:** `Continue` and `Review answers`

### Failed state

**Heading:** Review and try again

**Body:** You scored {score}%. You need 70% to pass. Your work is saved, and there is no penalty for retrying.

**Actions:** `Review missed topics` and `Retry quiz`

## Prompt feedback placeholder

**Overall message:** Your prompt has a clear Context and Action. Add Role, Format and Target, then keep the teacher verification step.

**Strongest dimension:** Action

**Priority improvement 1:** Target — name the class and one current misconception.

**Priority improvement 2:** Format — define the length, structure and checks for understanding.

**Action:** `Revise my prompt`

## Completion screen

**Heading:** You completed the PromptShala pathway

**Body:** You practised responsible AI use, prompt writing, reusable assistant design, and source-grounded resource creation. Continue applying the teacher review checklist whenever you use AI.

**Reflection:** “What is one task you will try, and what will you check before using the result?”

**Prototype certificate note:** Certificate generation is a planned feature and is not part of the current learning-content prototype.

## Content acceptance checklist

- Client confirms the four-module scope and order.
- Client confirms the rubric dimensions and terminology.
- Client confirms the first pilot’s grade range, subjects, school board, and language.
- Team checks all answer keys and model prompts independently.
- Team tests content with at least one beginner teacher before the ten-user pilot.
- External links, licences, captions, and embeds are verified.
- Privacy and teacher-review reminders appear before every free-text task.
- Prototype copy is reviewed on mobile and desktop at 200% zoom.
