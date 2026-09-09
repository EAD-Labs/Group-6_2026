import type { LearningModule, Lesson } from "./domain";

export type LessonSection = {
  body: string;
  heading: string;
  highlight?: string;
};

export type LessonDetail = Lesson & {
  durationMinutes: number;
  eyebrow: string;
  sections: LessonSection[];
  summary: string;
  takeaways: string[];
  transcript: string[];
};

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  concept: string;
  correctOptionIds: string[];
  explanation: string;
  id: string;
  kind: "single" | "multiple";
  lessonSlug: string;
  options: QuizOption[];
  prompt: string;
};

export const learningModules: LearningModule[] = [
  {
    description:
      "Understand what generative AI can do and use a safe teacher-review process.",
    estimatedMinutes: 25,
    id: "00000000-0000-4000-8000-000000000001",
    position: 1,
    slug: "module-1",
    title: "AI Foundations and Responsible Use",
  },
  {
    description:
      "Turn classroom needs into clear prompts using the CRAFT framework.",
    estimatedMinutes: 35,
    id: "00000000-0000-4000-8000-000000000002",
    position: 2,
    slug: "module-2",
    title: "Classroom Prompt Writing",
  },
  {
    description:
      "Convert a strong prompt into a reusable assistant for recurring teacher tasks.",
    estimatedMinutes: 35,
    id: "00000000-0000-4000-8000-000000000003",
    position: 3,
    slug: "module-3",
    title: "Reusable Teacher Assistants",
  },
  {
    description:
      "Use teacher-owned sources to build grounded worksheets, quizzes and slide outlines.",
    estimatedMinutes: 40,
    id: "00000000-0000-4000-8000-000000000004",
    position: 4,
    slug: "module-4",
    title: "Working with Teacher-Owned Sources",
  },
];

export const moduleOne = learningModules[0];

export const moduleOneLessons: LessonDetail[] = [
  {
    durationMinutes: 7,
    eyebrow: "Lesson 1 · Build the right mental model",
    id: "00000000-0000-4000-8000-000000000101",
    moduleId: moduleOne.id,
    position: 1,
    sections: [
      {
        body:
          "Generative AI creates a new response from your instruction and patterns learned from large collections of examples. It does not retrieve one guaranteed correct answer from a textbook.",
        heading: "It generates, rather than simply retrieves",
        highlight: "Useful draft ≠ verified fact",
      },
      {
        body:
          "A search engine mainly helps you find existing pages. A rule-based system follows fixed instructions. Generative AI can draft, transform and explain—but every output still needs review.",
        heading: "AI, search and automation are different",
      },
      {
        body:
          "The wording may change even when you repeat a request. That flexibility is useful for examples and drafts, but it also means confident language is not evidence of accuracy.",
        heading: "Responses are probabilistic",
      },
    ],
    slug: "meet-generative-ai",
    summary:
      "Distinguish generative AI from search and fixed automation without technical jargon.",
    takeaways: [
      "AI generates a likely response; it does not look up a guaranteed truth.",
      "The same request can produce different wording.",
      "Teacher verification remains essential.",
    ],
    title: "Meet generative AI",
    transcript: [
      "Welcome. You may already have used generative AI to rewrite text, translate a message or create questions.",
      "A search engine points to existing information. Rule-based automation follows a fixed condition. Generative AI creates a new draft from your instruction.",
      "Because that draft is produced from patterns, it can sound fluent while still being incomplete or incorrect. Treat every result as a starting point for professional review.",
    ],
  },
  {
    durationMinutes: 8,
    eyebrow: "Lesson 2 · Start from a real teacher task",
    id: "00000000-0000-4000-8000-000000000102",
    moduleId: moduleOne.id,
    position: 2,
    sections: [
      {
        body:
          "AI is most useful for low-risk drafting: alternative explanations, question ideas, lesson-plan outlines, worksheet variations and general parent-message templates.",
        heading: "Drafting support, not professional replacement",
        highlight: "You decide what reaches learners",
      },
      {
        body:
          "Avoid asking AI to make final grading, disciplinary, safeguarding or placement decisions. These decisions require context, accountability and qualified human judgment.",
        heading: "Keep consequential decisions human",
      },
      {
        body:
          "Begin with a clear learning objective, an age group and the classroom constraint you need help with. Module 2 will turn these ingredients into a CRAFT prompt.",
        heading: "Start with learning intent",
      },
    ],
    slug: "useful-teacher-tasks",
    summary:
      "Choose appropriate classroom tasks where AI can save preparation time without replacing judgment.",
    takeaways: [
      "Use AI for drafts, options and transformations.",
      "Do not delegate high-stakes learner decisions.",
      "Connect every request to a learning objective.",
    ],
    title: "Useful teacher tasks",
    transcript: [
      "A good first use of AI is a repeatable, low-risk drafting task.",
      "For example, ask for three analogies for evaporation, a short formative quiz, or a neutral parent-message template. Then review and adapt the draft.",
      "Do not use AI as the final decision-maker for grades, discipline or learner support. The teacher remains responsible for context, fairness and suitability.",
    ],
  },
  {
    durationMinutes: 8,
    eyebrow: "Lesson 3 · Apply the REVIEW check",
    id: "00000000-0000-4000-8000-000000000103",
    moduleId: moduleOne.id,
    position: 3,
    sections: [
      {
        body:
          "Use fictional or generalised learner examples. Never enter names, roll numbers, linked marks, health information, contact details or confidential school records.",
        heading: "Remove personal information",
        highlight: "No identifiable student data",
      },
      {
        body:
          "Check important claims against the curriculum, textbook or another trusted source. Look for invented facts, missing context and out-of-date information.",
        heading: "Verify accuracy and sources",
      },
      {
        body:
          "Review age suitability, inclusivity, accessibility, tone and copyright. Edit the output so it fits your learners and your professional purpose.",
        heading: "Adapt before classroom use",
      },
    ],
    slug: "review-before-use",
    summary:
      "Protect privacy and check accuracy, suitability, inclusion and curriculum fit before use.",
    takeaways: [
      "Remove identifiable or confidential information.",
      "Verify facts with a trusted source.",
      "Adapt language, difficulty and format for your learners.",
    ],
    title: "Review before use",
    transcript: [
      "Before using an AI-created resource, pause for a teacher review.",
      "First, protect privacy: use fictional or general classroom descriptions. Second, verify important facts and curriculum alignment. Third, adapt the reading level, tone, inclusion and accessibility.",
      "Attractive formatting does not make an output safe or accurate. The final classroom decision always belongs to the teacher.",
    ],
  },
];

export const moduleOneQuizQuestions: QuizQuestion[] = [
  {
    concept: "Generative AI",
    correctOptionIds: ["b"],
    explanation:
      "Generative AI creates a new response from an instruction. The other examples calculate, follow a fixed rule or retrieve existing pages.",
    id: "m1-q1",
    kind: "single",
    lessonSlug: "meet-generative-ai",
    options: [
      { id: "a", label: "A calculator returns 72 for 8 × 9." },
      { id: "b", label: "A tool drafts three age-appropriate analogies for evaporation." },
      { id: "c", label: "A portal marks attendance late after 9:00 a.m." },
      { id: "d", label: "A search page lists links containing ‘evaporation’." },
    ],
    prompt: "Which example best describes generative AI?",
  },
  {
    concept: "Accuracy review",
    correctOptionIds: ["c"],
    explanation:
      "Generative AI can produce fluent but incorrect information. Verify important claims before classroom use.",
    id: "m1-q2",
    kind: "single",
    lessonSlug: "review-before-use",
    options: [
      { id: "a", label: "Assume confidence means accuracy." },
      { id: "b", label: "Add more adjectives to the response." },
      { id: "c", label: "Verify important claims with trusted curriculum sources." },
      { id: "d", label: "Use it immediately and ask learners to find mistakes." },
    ],
    prompt: "An AI explanation sounds confident. What should a teacher do?",
  },
  {
    concept: "Student privacy",
    correctOptionIds: ["c"],
    explanation:
      "Fictional or generalised examples reduce privacy risk. Personal records and contact details should not be entered into a public AI service.",
    id: "m1-q3",
    kind: "single",
    lessonSlug: "review-before-use",
    options: [
      { id: "a", label: "Include a learner’s full name and linked marks." },
      { id: "b", label: "Upload counselling notes and request a summary." },
      { id: "c", label: "Use a fictional learner profile without identifying details." },
      { id: "d", label: "Include a parent’s phone number for realism." },
    ],
    prompt: "Which request handles student privacy most safely?",
  },
  {
    concept: "Teacher review checklist",
    correctOptionIds: ["a", "b", "c", "d"],
    explanation:
      "Confidence is not evidence of quality. Accuracy, suitability, privacy, copyright and curriculum fit require human review.",
    id: "m1-q4",
    kind: "multiple",
    lessonSlug: "review-before-use",
    options: [
      { id: "a", label: "Factual accuracy" },
      { id: "b", label: "Age and reading-level suitability" },
      { id: "c", label: "Privacy and copyright" },
      { id: "d", label: "Curriculum alignment" },
      { id: "e", label: "Whether the AI used confident language" },
    ],
    prompt: "Which checks are needed before using an AI-generated worksheet?",
  },
  {
    concept: "Appropriate teacher use",
    correctOptionIds: ["b"],
    explanation:
      "AI can support drafting and idea generation, but professional judgment and responsibility remain with the teacher.",
    id: "m1-q5",
    kind: "single",
    lessonSlug: "useful-teacher-tasks",
    options: [
      { id: "a", label: "Replace teacher judgment." },
      { id: "b", label: "Produce drafts that the teacher reviews and adapts." },
      { id: "c", label: "Make final high-stakes decisions about learners." },
      { id: "d", label: "Store private student records inside prompts." },
    ],
    prompt: "What is an appropriate role for AI in teaching?",
  },
];

export function getLessonBySlug(slug: string) {
  return moduleOneLessons.find((lesson) => lesson.slug === slug);
}

export function getNextLesson(slug: string) {
  const currentIndex = moduleOneLessons.findIndex((lesson) => lesson.slug === slug);
  return currentIndex >= 0 ? moduleOneLessons[currentIndex + 1] : undefined;
}

export function getModuleOneProgress(completedLessonCount: number, passed: boolean) {
  if (passed) {
    return 100;
  }

  return Math.round((Math.min(completedLessonCount, 3) / 4) * 100);
}
