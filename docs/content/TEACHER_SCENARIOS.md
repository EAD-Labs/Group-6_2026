# Teacher-Specific Prompt Practice Scenarios

## How scenarios are used

Each scenario gives a realistic teacher task, a deliberately weak starting prompt, information the teacher should consider, a model prompt for feedback comparison, and a teacher-review checklist. Participants should write their own version before viewing the model.

All student examples are fictional and non-identifying. Participants must not paste real student records into PromptShala or a public AI service.

## Scenario 1 — Concept explanation

### Brief

A Class 7 science teacher needs a short explanation of photosynthesis. Learners understand that plants need water but some think plants obtain all food directly from soil.

### Weak prompt

> Explain photosynthesis.

### Information to include

- role: patient Class 7 science teaching assistant;
- learner: Class 7, beginner level, named misconception;
- context: photosynthesis and curriculum vocabulary;
- task: correct the misconception and explain the process;
- format: under 200 words, simple language, one analogy, four key terms, two questions;
- review: verify science, age suitability, and analogy limitations.

### Model prompt

> Act as a patient Class 7 science teaching assistant. Explain photosynthesis to learners who know plants need water but think plants get all their food from soil. Correct that misconception without shaming the learner. Use the terms sunlight, carbon dioxide, water, glucose, and oxygen. Keep the explanation under 200 words, include one simple analogy and two check-for-understanding questions. State where the analogy stops being scientifically accurate. Use no student names. I will verify the science and match it to the textbook before use.

### Teacher review checklist

- Are inputs and products scientifically correct?
- Does the explanation distinguish nutrients from food production?
- Is the analogy useful without creating a new misconception?
- Are vocabulary and questions suitable for Class 7?

## Scenario 2 — Quiz creation

### Brief

A Class 6 mathematics teacher needs a short formative quiz on fractions after an introductory lesson.

### Weak prompt

> Make a fractions quiz.

### Information to include

- learner: Class 6 with basic multiplication knowledge;
- content: numerator, denominator, equivalent fractions, and comparison;
- learning goal: diagnose misconceptions, not assign a high-stakes grade;
- format: six items of mixed type, answer key, explanation, difficulty tag;
- constraint: one correct answer for each multiple-choice item;
- review: solve every item and check ambiguity before use.

### Model prompt

> Act as a Class 6 mathematics assessment designer. Create a six-question low-stakes formative quiz on numerator and denominator, equivalent fractions, and comparing fractions with the same denominator. Include three multiple-choice questions, two short-answer questions, and one “explain your thinking” question. Label each item easy, medium, or challenge. Provide the correct answer and a one-sentence explanation for the teacher. Ensure each multiple-choice item has exactly one defensible answer. Use fictional contexts only. I will solve every item and check wording, difficulty, and curriculum alignment before use.

### Teacher review checklist

- Does each item assess the stated topic?
- Is there exactly one defensible MCQ answer?
- Are distractors based on plausible misconceptions rather than tricks?
- Do the key and explanations match the questions?

## Scenario 3 — Lesson planning

### Brief

A Class 8 mathematics teacher has 40 minutes to introduce linear equations. The room has a board and paper but unreliable internet access.

### Weak prompt

> Give me a lesson plan on linear equations.

### Information to include

- learner: Class 8, mixed readiness;
- duration and resources: 40 minutes, board and paper, offline-ready;
- goal: solve one-step equations and explain balance;
- structure: opening check, modelling, pair activity, independent practice, exit ticket;
- differentiation: support and extension;
- review: timing, maths, feasibility, inclusion.

### Model prompt

> Act as an experienced Class 8 mathematics lesson-planning colleague. Draft a 40-minute, offline-ready introduction to one-step linear equations for a mixed-readiness class. The learning goal is: “Learners can solve one-step equations and explain why both sides must remain balanced.” Use only a board, paper, and common classroom objects. Provide a table with time, teacher action, learner action, and formative check. Include a five-minute prior-knowledge check, one worked example, a pair activity, independent practice, an exit ticket, one scaffold, and one extension. I will verify the mathematics, timing, accessibility, and fit with our curriculum before teaching.

### Teacher review checklist

- Do activities fit within 40 minutes?
- Does each activity support the stated learning goal?
- Can the lesson run without internet access?
- Are support and extension meaningful and respectful?

## Scenario 4 — Parent communication

### Brief

A teacher needs a general message inviting a parent or caregiver to discuss repeated incomplete homework. No personal data should be entered into the AI tool.

### Weak prompt

> Write a message to a parent about bad homework.

### Information to include

- role and tone: respectful teacher, neutral and collaborative;
- privacy: use placeholders only;
- purpose: request a conversation and support plan;
- format: under 120 words, editable placeholders, no diagnosis or blame;
- review: replace placeholders outside the AI tool and check school policy.

### Model prompt

> Act as a respectful school teacher drafting a general parent/caregiver message. Use only the placeholders [Learner], [Subject], [Date], and [Contact Method]; do not request or invent personal details. Explain neutrally that several homework tasks are incomplete, state that the goal is to understand any barriers and agree on support, and invite a short conversation. Keep the message under 120 words, use warm professional language, and avoid blame, diagnosis, threats, or assumptions about home circumstances. I will add real details outside the AI tool and review the message against school communication policy before sending.

### Teacher review checklist

- Are all names and contact details still placeholders?
- Does the message describe observable facts without labelling the learner?
- Is the tone collaborative and culturally respectful?
- Has a teacher checked policy and added secure contact details outside the AI tool?

## Scenario 5 — Worksheet and slide creation

### Brief

A Class 5 environmental studies teacher needs a short slide outline and printable worksheet on the water cycle.

### Weak prompt

> Make slides and a worksheet on the water cycle.

### Information to include

- learner: Class 5, varied reading levels;
- source: teacher-approved textbook section;
- goal: sequence evaporation, condensation, precipitation, and collection;
- slides: six slides, limited text, visual description/alt-text suggestion;
- worksheet: six questions, mixed type, answer key;
- review: source accuracy, readability, accessibility, image rights.

### Model prompt

> Act as a Class 5 environmental studies resource designer. Using only the teacher-approved water-cycle notes pasted below, create (A) a six-slide outline and (B) a one-page worksheet. The learning goal is for learners to sequence and explain evaporation, condensation, precipitation, and collection. For each slide provide a title, no more than three short bullets, and a suggested original diagram with alt-text. For the worksheet include two matching items, two sequencing items, one labelled-diagram task, and one explanation question, followed by a separate answer key. Use plain language and avoid copyrighted images. Do not add facts that are absent from the source; flag any missing information. I will compare every statement with the source and review readability and accessibility before use.

### Teacher review checklist

- Does every factual claim match the approved source?
- Is slide text brief enough for projection?
- Can diagrams be created originally or obtained with suitable rights?
- Is the worksheet readable, answerable, and accompanied by a correct key?

## Scenario feedback behaviour

For every scenario, PromptShala should:

1. hide the model until the participant submits an attempt;
2. score each of the six rubric dimensions;
3. identify the strongest dimension and at most two priority improvements;
4. provide a short example phrase without replacing the full prompt;
5. allow editing and resubmission;
6. ask the participant to state what they changed; and
7. remind the participant to verify the generated classroom artifact.

