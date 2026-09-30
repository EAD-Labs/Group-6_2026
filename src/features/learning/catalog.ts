import type { LearningModule, Lesson } from "./domain";

export type LessonSection = {
  body: string;
  heading: string;
  highlight?: string;
};

export type LessonDetail = Lesson & {
  durationMinutes: number;
  eyebrow: string;
  resources: {
    label: string;
    type: "guide" | "video";
    url: string;
  }[];
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
    estimatedMinutes: 180,
    id: "00000000-0000-4000-8000-000000000001",
    position: 1,
    slug: "module-1",
    title: "AI Foundations and Responsible Use",
  },
  {
    description:
      "Turn classroom needs into clear prompts using the CRAFT framework.",
    estimatedMinutes: 240,
    id: "00000000-0000-4000-8000-000000000002",
    position: 2,
    slug: "module-2",
    title: "Classroom Prompt Writing",
  },
  {
    description:
      "Convert a strong prompt into a reusable assistant for recurring teacher tasks.",
    estimatedMinutes: 360,
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
    durationMinutes: 25,
    eyebrow: "Lesson 1 · Build the right mental model",
    id: "00000000-0000-4000-8000-000000000101",
    moduleId: moduleOne.id,
    position: 1,
    resources: [
      {
        label: "How AI works — Code.org",
        type: "video",
        url: "https://www.youtube.com/watch?v=Ok-xpKjKp2g",
      },
      {
        label: "Generative AI for Educators — Google",
        type: "guide",
        url: "https://grow.google/ai-for-educators/",
      },
    ],
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
    durationMinutes: 25,
    eyebrow: "Lesson 2 · Start from a real teacher task",
    id: "00000000-0000-4000-8000-000000000102",
    moduleId: moduleOne.id,
    position: 2,
    resources: [
      {
        label: "How chatbots and language models work — Code.org",
        type: "video",
        url: "https://www.youtube.com/watch?v=X-AWdfSFCHQ",
      },
    ],
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
    durationMinutes: 30,
    eyebrow: "Lesson 3 · Apply the REVIEW check",
    id: "00000000-0000-4000-8000-000000000103",
    moduleId: moduleOne.id,
    position: 3,
    resources: [
      {
        label: "UNESCO guidance for generative AI in education",
        type: "guide",
        url: "https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research?hub=67098",
      },
      {
        label: "Exploring the ethics of AI — Code.org",
        type: "video",
        url: "https://www.youtube.com/watch?v=3oqxjPXbynE",
      },
    ],
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
  {
    durationMinutes: 30,
    eyebrow: "Lesson 4 · Separate claims from evidence",
    id: "00000000-0000-4000-8000-000000000104",
    moduleId: moduleOne.id,
    position: 4,
    resources: [
      {
        label: "How chatbots and language models work — Code.org",
        type: "video",
        url: "https://www.youtube.com/watch?v=X-AWdfSFCHQ",
      },
    ],
    sections: [
      {
        body:
          "A polished sentence can contain an invented reference, a wrong total or an overgeneralisation. Mark each important statement as supported, contradicted or not established by the available source.",
        heading: "Fluency is not evidence",
        highlight: "Claim → evidence → teacher decision",
      },
      {
        body:
          "Checking with the same model is not independent verification. Open the cited source, compare the exact passage, or use a calculator or trusted reference for facts and numbers.",
        heading: "Verify outside the response",
      },
      {
        body:
          "When evidence is missing, say that the claim is not established. That is more accurate than guessing that it is definitely false.",
        heading: "Name uncertainty precisely",
      },
    ],
    slug: "verify-ai-claims",
    summary:
      "Audit AI output by connecting each important claim to independent evidence.",
    takeaways: [
      "A citation must exist and support the claim.",
      "Use an independent source or tool to verify.",
      "Distinguish unsupported from proven false.",
    ],
    title: "Hallucinations and verification",
    transcript: [
      "AI can produce language that sounds certain even when the underlying claim is unsupported.",
      "Build a simple audit table with four columns: claim, available evidence, verdict and correction.",
      "For classroom material, verify the facts that affect learning and remove or qualify anything the source does not establish.",
    ],
  },
  {
    durationMinutes: 30,
    eyebrow: "Lesson 5 · Match the tool to the job",
    id: "00000000-0000-4000-8000-000000000105",
    moduleId: moduleOne.id,
    position: 5,
    resources: [
      {
        label: "NotebookLM teaching example",
        type: "video",
        url: "https://www.youtube.com/watch?v=0wfJeL-IalY",
      },
      {
        label: "Add and manage NotebookLM sources — Google Help",
        type: "guide",
        url: "https://support.google.com/gemininotebook/answer/16215270?co=GENIE.Platform%3DDesktop&hl=en-6",
      },
    ],
    sections: [
      {
        body:
          "Use general chat for drafting and alternatives, a source notebook for questions about selected documents, and a calculator or spreadsheet for exact arithmetic.",
        heading: "Choose by task and evidence",
        highlight: "Start from the task, then choose the tool",
      },
      {
        body:
          "A reusable assistant can hold stable instructions for a repeated job. An API lets software request a service; teachers do not need to program one to use PromptShala.",
        heading: "Know the levels of assistance",
      },
      {
        body:
          "Uploading a file does not guarantee that every detail was interpreted correctly. Record the source boundary and how you will verify the output.",
        heading: "Keep a verification plan",
      },
    ],
    slug: "choose-the-right-tool",
    summary:
      "Choose chat, source-grounded tools, reusable assistants or reliable calculators according to the task.",
    takeaways: [
      "Tool choice follows the teaching purpose.",
      "Source-grounded still requires checking.",
      "Use deterministic tools for exact calculations.",
    ],
    title: "Choose the right AI assistance",
    transcript: [
      "One tool does not suit every classroom task.",
      "Drafting three activity ideas is different from calculating a total or answering questions from two approved documents.",
      "State the intended source, choose the least risky suitable tool and record how the teacher will check the result.",
    ],
  },
  {
    durationMinutes: 40,
    eyebrow: "Lesson 6 · Put responsible use into practice",
    id: "00000000-0000-4000-8000-000000000106",
    moduleId: moduleOne.id,
    position: 6,
    resources: [
      {
        label: "UNESCO AI competency framework for teachers",
        type: "guide",
        url: "https://www.unesco.org/en/articles/ai-competency-framework-teachers?hub=83294",
      },
    ],
    sections: [
      {
        body:
          "Choose a topic you know well and design a ten-minute introductory activity using fictional class context and an approved source or your own verified notes.",
        heading: "Set a bounded classroom brief",
        highlight: "The evidence must show teacher judgment",
      },
      {
        body:
          "Save the first output, mark claims that need checking, verify them, adapt language and materials, and identify at least one AI suggestion you rejected.",
        heading: "Show the review trail",
      },
      {
        body:
          "Complete a decision card: task, learner benefit, information supplied, tool, checks, changes, approver and the situations where AI would be unsuitable.",
        heading: "Make responsibility visible",
      },
    ],
    slug: "responsible-use-challenge",
    summary:
      "Create and document a small classroom activity that makes both AI help and teacher judgment visible.",
    takeaways: [
      "Keep the task small and source-aware.",
      "Record checks, edits and rejected suggestions.",
      "The teacher approves final classroom use.",
    ],
    title: "Responsible-use challenge",
    transcript: [
      "This challenge combines task choice, privacy, verification and professional judgment.",
      "Your final activity should be usable, but the review trail matters just as much as the polished result.",
      "Another educator should be able to see what the AI contributed, what you checked and why you changed or rejected parts of the draft.",
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

  return Math.round(
    (Math.min(completedLessonCount, moduleOneLessons.length) /
      (moduleOneLessons.length + 1)) *
      100,
  );
}
