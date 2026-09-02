# First Prompt-Writing Lesson and Rubric

## Decision status

This document defines the **proposed PromptShala working rubric** for the prototype. It follows the client’s requested LEARN-LM/CRAFT-style direction and extends Google’s official Gem instruction areas—Persona, Task, Context, and Format—with learner, pedagogy, safety, and teacher-review needs.

The team must obtain client confirmation before labelling any acronym or framework as final. PromptShala must not claim that this rubric is an official Google, LearnLM, or UNESCO framework.

## Lesson summary

**Title:** From a Vague Request to a Classroom-Ready Prompt

**Module:** 2 — Classroom Prompt Writing

**Duration:** 12–15 minutes

**Scenario:** Explain fractions to a Class 6 learner who confuses the numerator and denominator.

**Prototype mode:** Deterministic, rubric-based feedback can be shown without calling an LLM. A later implementation may use an LLM for richer feedback after privacy and cost decisions are approved.

## Learning outcomes

The participant will:

- identify why a vague prompt produces an unpredictable result;
- use all six PromptShala rubric dimensions;
- write and revise one classroom prompt;
- achieve at least 12 out of 18, with no zero in Safety and Teacher Review; and
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

### Step 2 — Teach the six dimensions

1. **Persona or role** — Who should the AI act as?
2. **Learner and level** — Who will use the result, and what do they already know?
3. **Context and source** — What topic, curriculum, source material, misconception, or classroom condition matters?
4. **Task and learning goal** — What should the AI produce, and what should learners understand or do?
5. **Format and quality criteria** — What structure, length, language, tone, examples, or answer key is required?
6. **Safety and teacher review** — What private data must be excluded, what boundaries apply, and what will the teacher verify?

### Step 3 — Build the prompt

The interface provides six labelled fields. Each field includes a plain-language hint and an optional example. The final prompt preview updates as the participant types.

| Field | Prompt shown to participant |
|---|---|
| Persona or role | “Who should the AI act as?” |
| Learner and level | “Which class, age, prior knowledge, or learning need should it consider?” |
| Context and source | “What topic, curriculum point, misconception, or approved source matters?” |
| Task and learning goal | “What should it create, and what should learners achieve?” |
| Format and quality criteria | “How should the result be structured, written, and limited?” |
| Safety and teacher review | “What must it avoid, and what will you verify before use?” |

### Step 4 — Submit for feedback

Show one feedback card per dimension:

- **What we noticed** — evidence found or missing;
- **Why it matters** — teacher-focused explanation;
- **Try adding** — one actionable suggestion; and
- **Example phrase** — a short example that does not overwrite the participant’s work.

Do not show only a total score. The participant must understand how to improve each dimension.

### Step 5 — Revise and compare

Display the first and revised versions side by side on desktop and one after the other on mobile. Highlight only participant-made additions. Ask:

> Name two changes that made your prompt more useful.

### Step 6 — Complete the lesson

Completion requires:

- all required fields attempted;
- a revised prompt submitted;
- at least 12 out of 18 overall;
- Safety and Teacher Review scored at least 1; and
- the two-change reflection completed.

If the threshold is not met, keep the participant’s work, focus the first missing dimension, and allow an immediate retry.

## PromptShala rubric

Each dimension is scored from 0 to 3. Maximum score: 18.

| Dimension | 0 — Missing | 1 — Emerging | 2 — Usable | 3 — Strong |
|---|---|---|---|---|
| Persona or role | No role is stated. | A broad role such as “teacher” is named. | A relevant role and subject responsibility are stated. | The role also includes an appropriate approach, expertise, or boundary. |
| Learner and level | No learner is identified. | A broad learner group is named. | Class/age and current level or need are stated. | Prior knowledge, misconception, language, accessibility, or differentiation need is also stated. |
| Context and source | No topic or context is given. | A topic is named. | Topic plus curriculum, classroom context, or source is given. | Relevant constraints, source boundaries, misconceptions, and classroom conditions are clear. |
| Task and learning goal | The request is unclear. | A general task is stated. | The required artifact and learning goal are clear. | Success criteria or desired learner behaviour is also measurable. |
| Format and quality criteria | No output guidance is provided. | One format or length preference is given. | Structure, tone/language, and useful limits are specified. | The prompt includes examples, answer-key needs, differentiation, or an explicit quality checklist. |
| Safety and teacher review | No safety or review instruction is present. | A general “check it” instruction is present. | Private data is excluded and teacher verification is required. | Verification names accuracy, source alignment, age suitability, inclusion, and copyright or privacy as relevant. |

## Feedback examples

### Missing learner information

- **What we noticed:** The prompt says “students” but does not identify a class or current understanding.
- **Why it matters:** The same explanation may be too simple for Class 9 and too difficult for Class 4.
- **Try adding:** Class level and one misconception or prior skill.
- **Example phrase:** “for Class 6 learners who confuse numerator and denominator”.

### Missing output criteria

- **What we noticed:** The prompt asks for an explanation but does not describe its length or structure.
- **Why it matters:** The result may be too long or difficult to use during a lesson.
- **Try adding:** A word limit, example type, and check-for-understanding questions.
- **Example phrase:** “under 180 words, with one analogy and two quick questions”.

### Missing safety and review

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

These checks support practice; they are not a definitive quality judgment. The UI must say “rubric feedback” rather than “AI-certified prompt”.

## Client confirmation questions

1. Do the six selected dimensions match the intended LEARN-LM/CRAFT-style direction?
2. Should PromptShala use a client-approved acronym, or present the dimensions without an acronym?
3. Is 12 out of 18 with a mandatory safety score acceptable for practice completion?
4. Should the first pilot use deterministic checks, an LLM with participant-provided API key, or both?
5. Which school board, grade range, subjects, and language variants should the first scenarios prioritise?

