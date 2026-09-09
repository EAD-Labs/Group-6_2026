export type CraftDimensionId = "context" | "role" | "action" | "format" | "target";

export type CraftDimension = {
  description: string;
  id: CraftDimensionId;
  label: string;
  prompt: string;
};

export type CraftScenario = {
  contextKeywords: string[];
  id: string;
  startingPrompt: string;
  strongPrompt: string;
  summary: string;
  title: string;
};

export type CraftDimensionResult = CraftDimension & {
  feedback: string;
  met: boolean;
};

export type CraftEvaluation = {
  completeCount: number;
  dimensions: CraftDimensionResult[];
  headline: string;
  scorePercent: number;
};

export const craftDimensions: CraftDimension[] = [
  {
    description: "State the topic, classroom need and useful constraints.",
    id: "context",
    label: "Context",
    prompt: "What is happening in your classroom?",
  },
  {
    description: "Give the AI a relevant professional perspective.",
    id: "role",
    label: "Role",
    prompt: "Who should the AI act as?",
  },
  {
    description: "Use a precise verb for the work you need done.",
    id: "action",
    label: "Action",
    prompt: "What should it create or explain?",
  },
  {
    description: "Describe the structure, length or sections you expect.",
    id: "format",
    label: "Format",
    prompt: "How should the answer be organised?",
  },
  {
    description: "Name the learner, level and learning need.",
    id: "target",
    label: "Target",
    prompt: "Who is the result for?",
  },
];

export const craftScenarios: CraftScenario[] = [
  {
    contextKeywords: ["photosynthesis", "plant", "science", "misconception"],
    id: "concept",
    startingPrompt: "Explain photosynthesis.",
    strongPrompt:
      "Act as a patient science teaching assistant. Explain photosynthesis for Class 7 learners who know plants need water but think plants get all food from soil. Correct the misconception using sunlight, carbon dioxide, water, glucose and oxygen. Use one simple analogy, stay under 180 words and finish with two check-for-understanding questions. I will verify the science against our textbook before use.",
    summary: "Clarify a misconception without overwhelming the learner.",
    title: "Explain a concept",
  },
  {
    contextKeywords: ["fractions", "quiz", "assessment", "numerator", "denominator"],
    id: "quiz",
    startingPrompt: "Make a quiz on fractions.",
    strongPrompt:
      "Act as a Class 6 mathematics assessment designer. Create a low-stakes quiz for learners who can multiply but often reverse numerator and denominator. Include four multiple-choice questions and one short explanation question, followed by a separate answer key with one-sentence explanations. Keep the language simple and avoid collecting learner names. I will review every answer before use.",
    summary: "Create a formative check with useful explanations.",
    title: "Create a quiz",
  },
  {
    contextKeywords: ["linear equations", "lesson", "mathematics", "40-minute"],
    id: "lesson-plan",
    startingPrompt: "Plan a lesson on equations.",
    strongPrompt:
      "Act as an experienced Class 8 mathematics lesson-planning colleague. Draft a 40-minute introduction to one-step linear equations for a mixed-readiness class. The goal is for learners to solve one-step equations and explain why both sides remain balanced. Use a table with time, teacher action, learner action and formative check. Include one scaffold, one extension and an exit ticket. I will verify the mathematics and curriculum fit.",
    summary: "Turn a learning goal into a usable classroom sequence.",
    title: "Plan a lesson",
  },
  {
    contextKeywords: ["parent", "caregiver", "homework", "message", "communication"],
    id: "parent-message",
    startingPrompt: "Write a message to a parent about homework.",
    strongPrompt:
      "Act as a respectful school teacher drafting a general parent or caregiver message. Explain neutrally that several homework tasks are incomplete and invite a short conversation about possible barriers and support. Use only the placeholders [Learner], [Subject] and [Date]. Keep the message under 120 words, warm and professional, with no blame, diagnosis or invented personal details. I will add real information outside the AI tool and review the message before sending.",
    summary: "Draft neutral communication without exposing personal data.",
    title: "Parent communication",
  },
  {
    contextKeywords: ["water cycle", "worksheet", "slides", "resource", "evaporation"],
    id: "worksheet",
    startingPrompt: "Make slides and a worksheet on the water cycle.",
    strongPrompt:
      "Act as a Class 5 environmental studies resource designer. Using only my teacher-approved water-cycle notes, create a six-slide outline and a one-page worksheet for learners with varied reading levels. The goal is to sequence evaporation, condensation, precipitation and collection. Give each slide a title, no more than three bullets and suggested alt text. Add five worksheet items and a separate answer key. Flag missing source information and use no copyrighted images. I will verify every statement before use.",
    summary: "Transform teacher-owned notes into accessible resources.",
    title: "Worksheet and slides",
  },
];

const dimensionPatterns: Record<Exclude<CraftDimensionId, "context">, RegExp> = {
  action:
    /\b(create|draft|design|explain|generate|make|outline|plan|prepare|rewrite|summari[sz]e|transform|write)\b/i,
  format:
    /\b(answer key|bullet|diagram|example|format|heading|item|list|minute|question|section|slide|table|under|word|worksheet)\b|\d+\s*(?:word|minute|question|slide|item)/i,
  role:
    /\b(act as|you are|assistant|colleague|designer|educator|expert|facilitator|planner|teacher|tutor)\b/i,
  target:
    /\b(age|beginner|caregiver|class\s*[1-9]|grade\s*[1-9]|learner|parent|reading level|student|mixed-readiness|misconception)\b/i,
};

const missingFeedback: Record<CraftDimensionId, string> = {
  action: "Add a precise action such as explain, create, draft or design.",
  context: "Name the topic, classroom situation or constraint that matters.",
  format: "Specify the structure, length and sections you want back.",
  role: "Start with a useful role, for example: ‘Act as a Class 7 science teaching assistant.’",
  target: "Name the class, learner level or specific learning need.",
};

const successFeedback: Record<CraftDimensionId, string> = {
  action: "A clear action tells the tool what work to perform.",
  context: "The classroom topic or constraint is visible.",
  format: "The expected response structure is clear enough to review.",
  role: "The requested professional perspective is explicit.",
  target: "The intended learner or audience is identified.",
};

export function evaluateCraftPrompt(
  prompt: string,
  scenario: CraftScenario,
): CraftEvaluation {
  const normalizedPrompt = prompt.trim().toLowerCase();
  const metByDimension: Record<CraftDimensionId, boolean> = {
    action: dimensionPatterns.action.test(normalizedPrompt),
    context: scenario.contextKeywords.some((keyword) =>
      normalizedPrompt.includes(keyword.toLowerCase()),
    ),
    format: dimensionPatterns.format.test(normalizedPrompt),
    role: dimensionPatterns.role.test(normalizedPrompt),
    target: dimensionPatterns.target.test(normalizedPrompt),
  };
  const dimensions = craftDimensions.map((dimension) => ({
    ...dimension,
    feedback: metByDimension[dimension.id]
      ? successFeedback[dimension.id]
      : missingFeedback[dimension.id],
    met: metByDimension[dimension.id],
  }));
  const completeCount = dimensions.filter((dimension) => dimension.met).length;
  const scorePercent = completeCount * 20;
  const headline =
    completeCount === 5
      ? "CRAFT structure complete"
      : completeCount === 4
        ? "Strong structure—one detail remains"
        : completeCount >= 2
          ? "Good start—make the missing parts visible"
          : "Build the prompt one CRAFT step at a time";

  return { completeCount, dimensions, headline, scorePercent };
}
