export type ModuleTwoLesson = {
  durationMinutes: number;
  evidence: string;
  id: string;
  practice: string;
  resources: { label: string; url: string }[];
  summary: string;
  title: string;
};

export const moduleTwoLessons: ModuleTwoLesson[] = [
  {
    durationMinutes: 25,
    evidence:
      "Save the first prompt, the revision and a prediction of which output differences the revision should produce.",
    id: "repair-vague-prompt",
    practice:
      "Expand “Teach fractions” into a 20-minute Grade 5 activity using paper strips. State prior knowledge, materials, steps and an exit question.",
    resources: [
      {
        label: "LearnLM prompt guide",
        url: "https://services.google.com/fh/files/misc/learnlm_prompt_guide.pdf",
      },
    ],
    summary:
      "Replace vague adjectives with a visible learner action, success evidence and the conditions that shape the task.",
    title: "Repair a vague prompt",
  },
  {
    durationMinutes: 30,
    evidence:
      "Compare two outputs and name one improvement, one remaining weakness and any assumption imported by the example.",
    id: "context-constraints-examples",
    practice:
      "Run a prompt with and without a teacher-written example, remove one misleading detail, then compare format, accuracy and creativity.",
    resources: [
      {
        label: "LearnLM prompt guide",
        url: "https://services.google.com/fh/files/misc/learnlm_prompt_guide.pdf",
      },
    ],
    summary:
      "Add time, class context, prior knowledge, materials, source boundaries and examples only when they change the needed result.",
    title: "Context, constraints and examples",
  },
  {
    durationMinutes: 35,
    evidence:
      "Produce one aligned mini-lesson plus a teacher note describing one suggestion you rejected or improved.",
    id: "learning-first-planning",
    practice:
      "Generate a timed mini-lesson, test whether the exit ticket measures the objective, then change one constraint such as removing the projector.",
    resources: [
      {
        label: "Developing educational materials with Gemini",
        url: "https://www.youtube.com/watch?v=ZvcLzoHybhY",
      },
      {
        label: "Ready-to-use AI prompts for educators",
        url: "https://edu.google.com/resources/ai-for-k-12-educators/",
      },
    ],
    summary:
      "Separate the learning objective, activity and evidence of understanding, then make timing and low-resource alternatives explicit.",
    title: "Lesson planning that begins with learning",
  },
  {
    durationMinutes: 35,
    evidence:
      "Submit three independently checked questions and feedback on two fictional responses, each with a concrete next action.",
    id: "questions-rubrics-feedback",
    practice:
      "Generate questions for one objective, solve them independently, check distractors and apply a two-criterion rubric to fictional work.",
    resources: [
      {
        label: "EEF guidance on effective feedback",
        url: "https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/feedback",
      },
    ],
    summary:
      "Request answer criteria and plausible errors, then turn generic praise into feedback that enables a useful next attempt.",
    title: "Questions, rubrics and actionable feedback",
  },
  {
    durationMinutes: 35,
    evidence:
      "Complete an adaptation table covering the barrier, change, preserved objective and human verification needed.",
    id: "differentiate-without-lowering",
    practice:
      "Create standard, scaffolded and extension versions of one task while preserving its central concept and reasoning demand.",
    resources: [
      {
        label: "CAST Universal Design for Learning Guidelines 3.0",
        url: "https://udlguidelines.cast.org/",
      },
    ],
    summary:
      "Change vocabulary support, chunking and response options while protecting the same learning goal and conceptual demand.",
    title: "Differentiate without lowering the goal",
  },
  {
    durationMinutes: 35,
    evidence:
      "Keep a three-version output log, repeat the strongest prompt once and record inconsistency plus the remaining teacher edit.",
    id: "prompt-laboratory",
    practice:
      "Run a baseline, a clearer-context revision and a source/format revision. Score accuracy, alignment, practicality and clarity.",
    resources: [
      {
        label: "PromptShala Prompt Sandbox",
        url: "/learn/module-2/practice",
      },
    ],
    summary:
      "Test one meaningful change at a time and judge the output itself rather than treating prompt completeness as proof of quality.",
    title: "Prompt laboratory: test, compare, revise",
  },
  {
    durationMinutes: 45,
    evidence:
      "Create three tested templates with named fields, a completed example, a known failure and a verification checklist.",
    id: "teaching-prompt-library",
    practice:
      "Build reusable prompts for lesson planning, assessment or feedback, and communication or adaptation; transfer one to a new topic.",
    resources: [
      {
        label: "Google prompting resources for educators",
        url: "https://edu.google.com/intl/ALL_ca/ai-resources-in-education/",
      },
    ],
    summary:
      "Turn successful prompts into transparent templates a colleague can fill, test and verify for a new classroom context.",
    title: "Build your teaching prompt library",
  },
];

export const moduleTwoMinutes = moduleTwoLessons.reduce(
  (total, lesson) => total + lesson.durationMinutes,
  0,
);
