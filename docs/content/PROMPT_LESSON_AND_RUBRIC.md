# First Prompt-Writing Lesson and Rubric

## Decision status

This document defines the **confirmed PromptShala CRAFT direction** for the prototype: Context, Role, Action, Format and Target. The Student Team locked this implementation baseline on 8 September 2026. The next client review validates the wording and teacher scenarios rather than choosing between frameworks.

CRAFT is presented as PromptShala’s selected teaching structure. PromptShala must not claim that its rubric is an official Google, LearnLM or UNESCO framework. Privacy, factual verification and teacher review remain mandatory cross-cutting safeguards rather than a sixth CRAFT letter.

## Lesson summary

**Title:** From a Vague Request to a Classroom-Ready Prompt

**Module:** 2 — Classroom Prompt Writing

**Duration:** 12–15 minutes

**Scenario:** Explain fractions to a Class 6 learner who confuses the numerator and denominator.

**Prototype mode:** Deterministic, rubric-based feedback can be shown without calling an LLM. A later implementation may use an LLM for richer feedback after privacy and cost decisions are approved.

## Learning outcomes

The participant will:

- identify why a vague prompt produces an unpredictable result;
- use all five CRAFT dimensions;
- write and revise one classroom prompt;
- improve the visible CRAFT coverage between the first and revised attempt; and
- explain two changes made after feedback.

## Lesson flow

### Step 1 — Compare two prompts

**Vague prompt**

> Explain fractions.

**Classroom-ready prompt**

> Act as a patient Class 6 mathematics teaching assistant. Explain numerator and denominator to learners who often reverse them. Use one pizza analogy and one number-line example. Keep the explanation under 180 words, use simple Indian English, and finish with two quick check-for-understanding questions. Do not invent student information. I will verify the mathematics and adapt the examples before classroom use.

Ask the participant:

1. Which prompt gives the AI more useful direction?
2. What information was added?
3. What must the teacher still review?

### Step 2 — Teach the five CRAFT dimensions

1. **Context** — What topic, curriculum point, source, misconception or classroom condition matters?
2. **Role** — Who should the AI act as?
3. **Action** — What should the AI create, explain, draft or transform?
4. **Format** — What structure, length, language, tone, examples or answer key is required?
5. **Target** — Who will use the result, and what do they already know or need?

### Step 3 — Build the prompt

The interface begins with one natural-language prompt area and five visible checks. A later guided-builder mode may expose one field per dimension. The teacher can always revise her own text rather than having it silently replaced.

| Field | Prompt shown to participant |
|---|---|
| Context | “What is happening in your classroom?” |
| Role | “Who should the AI act as?” |
| Action | “What should it create or explain?” |
| Format | “How should the answer be organised?” |
| Target | “Who is the result for?” |

### Step 4 — Submit for feedback

Show one feedback card per CRAFT dimension:

- **What we noticed** — evidence found or missing;
- **Why it matters** — teacher-focused explanation;
- **Try adding** — one actionable suggestion; and
- **Example phrase** — a short example that does not overwrite the participant’s work.

Do not show only a total score. The participant must understand how to improve each dimension.

### Step 5 — Revise and compare

Display first and revised coverage together on desktop and one after the other on mobile. Keep both attempts visible and ask:

> Name two changes that made your prompt more useful.

### Step 6 — Complete the lesson

Completion requires:

- a first prompt and revised prompt submitted;
- all five CRAFT dimensions made visible in at least one attempt;
- the safe-use acknowledgement retained; and
- the two-change reflection completed.

If the threshold is not met, keep the participant’s work, focus the first missing dimension, and allow an immediate retry.

## Planned CRAFT rubric

The current preview uses a transparent present/missing check and reports **structure coverage**, not quality certification. The separately tested Module 2 increment may introduce the following 0–3 rubric after client validation. Maximum score: 15.

| Dimension | 0 — Missing | 1 — Emerging | 2 — Usable | 3 — Strong |
|---|---|---|---|---|
| Context | No topic or classroom need is given. | A topic is named. | Topic plus curriculum, classroom context or source is given. | Constraints, source boundaries, misconceptions and classroom conditions are clear. |
| Role | No role is stated. | A broad role such as “teacher” is named. | A relevant role and subject responsibility are stated. | The role also includes an appropriate approach, expertise or boundary. |
| Action | The requested work is unclear. | A general task is stated. | The required classroom artifact or explanation is clear. | The action includes a measurable learning goal or success criterion. |
| Format | No output guidance is provided. | One format or length preference is given. | Structure, tone/language and useful limits are specified. | Examples, answer-key needs, differentiation or a quality checklist are explicit. |
| Target | No learner or audience is identified. | A broad learner group is named. | Class/age and current level or need are stated. | Prior knowledge, misconception, language, accessibility or differentiation need is also stated. |

## Feedback examples

### Missing target information

- **What we noticed:** The prompt says “students” but does not identify a class or current understanding.
- **Why it matters:** The same explanation may be too simple for Class 9 and too difficult for Class 4.
- **Try adding:** Class level and one misconception or prior skill.
- **Example phrase:** “for Class 6 learners who confuse numerator and denominator”.

### Missing output criteria

- **What we noticed:** The prompt asks for an explanation but does not describe its length or structure.
- **Why it matters:** The result may be too long or difficult to use during a lesson.
- **Try adding:** A word limit, example type, and check-for-understanding questions.
- **Example phrase:** “under 180 words, with one analogy and two quick questions”.

### Missing safety and review boundary

- **What we noticed:** The prompt does not say how private information or factual accuracy will be handled.
- **Why it matters:** AI output may contain errors, unsuitable language, or exposed personal data.
- **Try adding:** A no-personal-data boundary and a teacher verification step.
- **Example phrase:** “Use fictional examples only; I will verify facts and suitability before use.”

## Deterministic prototype checks

The prototype may detect simple evidence without claiming full semantic understanding:

- role terms such as `teacher`, `assistant`, `coach`, or `expert`;
- class/age/learner terms;
- subject, topic, curriculum, misconception, or source terms;
- an action verb and named artifact;
- structure, length, language, tone, table, list, answer key, or example requirements;
- privacy, fictional-data, verify, review, citation, accuracy, or age-suitability terms.

These checks support practice; they are not a definitive quality judgment. The preview labels the result as “structure coverage” and explicitly says that it makes no AI call.

## Client validation questions

1. Are Context, Role, Action, Format and Target understandable to beginner teachers?
2. Are the five prototype scenarios appropriate for the 10-user pilot?
3. Should planned Module 2 completion require all five dimensions or a minimum rubric threshold?
4. Should the first pilot retain deterministic checks as a fallback when an AI call fails?
5. Which school board, grade range, subjects and language variants should the first scenarios prioritise?
