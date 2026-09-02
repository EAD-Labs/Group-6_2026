# Introductory Interactive AI Activity

## Activity summary

**Title:** AI, Automation, or Search?

**Module:** 1 — AI Foundations and Responsible Use

**Duration:** 8–10 minutes

**Purpose:** Activate the teacher’s existing experience, clarify what generative AI does, and introduce safe use before any prompt-writing lesson.

**Prototype mode:** All examples and responses are local placeholder content. No AI API is required.

## Learning outcomes

The participant will:

- distinguish generative AI from search and rule-based automation;
- identify one appropriate classroom use;
- recognise that AI output requires teacher review; and
- avoid entering personal or confidential student information.

## Screen 1 — Welcome and prior experience

### Interface copy

**Heading:** You may already use AI without calling it AI

**Body:** This activity takes about 10 minutes. There are no penalties for a wrong answer. Choose what feels correct, read the explanation, and continue.

**Question:** Where have you used an AI tool before?

### Select-any options

- Writing or rewriting text
- Creating questions or lesson ideas
- Translation
- Image creation
- Searching for information
- I have not knowingly used AI

### Free-text prompt

“What is one school task you would like help with?”

### Safety notice

“Use a general example. Do not enter a student’s name, marks, health information, contact details, or other private information.”

## Screen 2 — Classification challenge

Show one card at a time. The participant selects **Generative AI**, **Search**, or **Rule-based automation** and then sees the explanation.

| Card | Scenario | Correct choice | Explanation |
|---|---|---|---|
| 1 | A tool writes three different analogies to explain evaporation to Class 5. | Generative AI | It creates new wording from the instruction and learned patterns. The teacher must still check the science and suitability. |
| 2 | A school portal marks attendance as “late” when the entry time is after 9:00 a.m. | Rule-based automation | It follows a fixed rule and does not create a new response. |
| 3 | A website returns links that contain the phrase “water cycle worksheet”. | Search | It retrieves and ranks existing pages rather than composing the requested worksheet. |
| 4 | A tool drafts a polite parent message from a general description of missed homework. | Generative AI | It creates a draft. The teacher must remove private data and review accuracy and tone. |
| 5 | A calculator produces 48 when asked for 6 × 8. | Rule-based automation | It performs a defined operation with a deterministic result. |

### Feedback behaviour

- Correct: “Correct. Here is why…”
- Incorrect: “Good attempt. This example is better described as…”
- Always reveal the explanation before enabling **Next**.
- Show progress as `Example 2 of 5`, not as a competitive score.

## Screen 3 — Can AI always be trusted?

### Comparison card

**Teacher request:** “Explain why seasons happen.”

**Output A:** A short but incorrect explanation claiming that seasons are caused mainly by Earth being closer to the Sun in summer.

**Question:** What should the teacher do before using this response?

### Options

- Use it because it sounds confident
- Verify the explanation using a trusted curriculum source **(correct)**
- Ask the AI to make it longer
- Remove difficult words and use it immediately

### Explanation

“AI can produce fluent but incorrect information. The teacher should compare important claims with the textbook, curriculum, or another trusted source before classroom use.”

## Screen 4 — Privacy decision

### Question

“Which request is safest to enter into a public AI tool?”

### Options

- “Write feedback for Aarav Mehta, roll number 18, who scored 42%.”
- “Draft general, encouraging feedback for a fictional Class 6 learner who needs more practice with fractions.” **(correct)**
- “Summarise the attached student counselling notes.”
- “Email this parent using the phone number and medical details below.”

### Explanation

“Use fictional or generalised examples. Do not enter names, roll numbers, marks linked to a person, medical information, contact details, or confidential school records.”

## Screen 5 — Teacher judgment checklist

Ask the participant to select every check needed before using an AI-created classroom resource.

- Is it factually accurate? **(required)**
- Is it suitable for the learner’s age and level? **(required)**
- Is the language respectful and inclusive? **(required)**
- Does it reveal personal or confidential information? **(required)**
- Does it match the learning objective and curriculum? **(required)**
- Does it use attractive colours? *(optional, not a safety/quality requirement)*

Feedback explains that an attractive output may still be inaccurate or inappropriate.

## Screen 6 — Reflection and completion

### Reflection prompt

“Complete this sentence: AI could help me draft __________, but I would check __________ before using it.”

### Completion message

“You have completed the introduction. Next, you will learn how a clear prompt helps an AI produce a more useful classroom draft.”

### Primary action

`Continue to Prompt Writing`

## Scoring and analytics

- Classification: 5 points
- Accuracy-review question: 1 point
- Privacy decision: 1 point
- Review checklist: 5 points
- Reflection: completion-only, not graded
- Activity success indicator: 9 of 12 points, but the participant may continue after reviewing explanations at any score

Store selected options, completion, and aggregate score. Do not store private information; the free-text reminder remains visible while typing.

## Accessibility and responsive behaviour

- Use buttons with both text and icons; never communicate correctness by colour alone.
- Announce feedback using an `aria-live` region.
- Keep each choice at least 44 × 44 CSS pixels.
- Support keyboard selection and visible focus states.
- Place explanations directly after the selected answer in reading order.
- On mobile, stack cards and keep the primary action sticky only when it does not obscure content.
- Provide a reduced-motion option for progress and success animations.

