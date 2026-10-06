import type { QuizQuestion } from "./catalog";

export type ModuleTwoLesson = {
  check: { prompt: string; options: string[]; answer: string; explanation: string };
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
    "durationMinutes": 25,
    "evidence": "Save the first prompt, the revision and a prediction of which output differences the revision should produce.",
    "id": "repair-vague-prompt",
    "practice": "Expand “Teach fractions” into a 20-minute Grade 5 activity using paper strips. State prior knowledge, materials, steps and an exit question.",
    "resources": [
      {
        "label": "LearnLM prompt guide",
        "url": "https://services.google.com/fh/files/misc/learnlm_prompt_guide.pdf"
      }
    ],
    "summary": "Replace vague adjectives with a visible learner action, success evidence and the conditions that shape the task.",
    "title": "Repair a vague prompt",
    "check": {
      "prompt": "A CRAFT prompt names all five elements but asks only for an attractive poster. The objective is to justify a fraction comparison. What still needs repair?",
      "options": [
        "Add more role adjectives",
        "Require learner reasoning and evidence matched to the objective",
        "Increase the word count"
      ],
      "answer": "Require learner reasoning and evidence matched to the objective",
      "explanation": "CRAFT makes the request inspectable. Having the labels does not establish alignment; the output must create a chance to demonstrate the intended comparison."
    }
  },
  {
    "durationMinutes": 30,
    "evidence": "Name one useful constraint, one assumption imported by the example and one remaining weakness. Keep observed outputs distinct from predicted effects.",
    "id": "context-constraints-examples",
    "practice": "Write requests with and without a checked teacher-written format example. Remove one misleading detail. If approved generation is available, compare actual outputs; otherwise annotate the expected differences as predictions.",
    "resources": [
      {
        "label": "LearnLM prompt guide",
        "url": "https://services.google.com/fh/files/misc/learnlm_prompt_guide.pdf"
      }
    ],
    "summary": "Add time, class context, prior knowledge, materials, source boundaries and examples only when they change the needed result.",
    "title": "Context, constraints and examples",
    "check": {
      "prompt": "Your sample layout uses a projector, but the task says there is no electricity. Which instruction best preserves the useful part?",
      "options": [
        "Copy the complete example exactly",
        "Use its layout only and produce a paper-based activity",
        "Remove every example and all context"
      ],
      "answer": "Use its layout only and produce a paper-based activity",
      "explanation": "The example clarifies format; it must not override the real material constraint. Inspect the result for any remaining equipment assumptions."
    }
  },
  {
    "durationMinutes": 35,
    "evidence": "Produce one aligned mini-lesson plus a teacher note describing one suggestion you rejected or improved.",
    "id": "learning-first-planning",
    "practice": "Generate a timed mini-lesson, test whether the exit ticket measures the objective, then change one constraint such as removing the projector.",
    "resources": [
      {
        "label": "Developing educational materials with Gemini",
        "url": "https://www.youtube.com/watch?v=ZvcLzoHybhY"
      },
      {
        "label": "Ready-to-use AI prompts for educators",
        "url": "https://edu.google.com/resources/ai-for-k-12-educators/"
      }
    ],
    "summary": "Separate the learning objective, activity and evidence of understanding, then make timing and low-resource alternatives explicit.",
    "title": "Lesson planning that begins with learning",
    "check": {
      "prompt": "The objective is to justify an inference about Nila. Which exit question best checks it?",
      "options": [
        "What object did Nila hold?",
        "What might her pause suggest, and which detail supports your view?",
        "Did you enjoy the story?"
      ],
      "answer": "What might her pause suggest, and which detail supports your view?",
      "explanation": "The answer must connect an interpretation to evidence. Recall and enjoyment can be useful information but do not demonstrate this objective."
    }
  },
  {
    "durationMinutes": 35,
    "evidence": "Submit three independently checked questions and feedback on two fictional responses, each with a concrete next action.",
    "id": "questions-rubrics-feedback",
    "practice": "Generate questions for one objective, solve them independently, check distractors and apply a two-criterion rubric to fictional work.",
    "resources": [
      {
        "label": "EEF guidance on effective feedback",
        "url": "https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/feedback"
      }
    ],
    "summary": "Request answer criteria and plausible errors, then turn generic praise into feedback that enables a useful next attempt.",
    "title": "Questions, rubrics and actionable feedback",
    "check": {
      "prompt": "A fictional response correctly says 1/2 is larger but gives no reasoning. What feedback best enables a next attempt?",
      "options": [
        "Correct; move on immediately",
        "Try harder to understand fractions",
        "Draw equal wholes in halves and thirds, then explain the part-size comparison"
      ],
      "answer": "Draw equal wholes in halves and thirds, then explain the part-size comparison",
      "explanation": "The next action targets the missing explanation while recognising that the comparison was correct. Look for the learner’s reasoning in the revised response."
    }
  },
  {
    "durationMinutes": 35,
    "evidence": "Complete an adaptation table covering the barrier, change, preserved objective and human verification needed.",
    "id": "differentiate-without-lowering",
    "practice": "Create standard, scaffolded and extension versions of one task while preserving its central concept and reasoning demand.",
    "resources": [
      {
        "label": "CAST Universal Design for Learning Guidelines 3.0",
        "url": "https://udlguidelines.cast.org/"
      }
    ],
    "summary": "Change vocabulary support, chunking and response options while protecting the same learning goal and conceptual demand.",
    "title": "Differentiate without lowering the goal",
    "check": {
      "prompt": "The goal is to explain a story inference. Which scaffold preserves that goal?",
      "options": [
        "Supply the interpretation and ask learners to copy it",
        "Offer a claim/detail/reason frame but leave the reasoning to the learner",
        "Replace the task with naming characters"
      ],
      "answer": "Offer a claim/detail/reason frame but leave the reasoning to the learner",
      "explanation": "The frame reduces organisational demands while learners still choose and justify an inference. Copying a conclusion does not demonstrate that reasoning."
    }
  },
  {
    "durationMinutes": 35,
    "evidence": "Keep three prompt versions, their feedback modes, a reasoned comparison and the remaining teacher check. Identify any real generation runs with tool/date; never label a prediction as an observed output.",
    "id": "prompt-laboratory",
    "practice": "Compare a baseline and two revisions in the CRAFT lab, changing one important element at a time. If you generate lesson drafts in an approved tool, review their actual outputs separately; otherwise label the output comparison a prediction.",
    "resources": [
      {
        "label": "PromptShala Prompt Sandbox",
        "url": "/learn/module-2/practice"
      }
    ],
    "summary": "Test one meaningful change at a time and judge the output itself rather than treating prompt completeness as proof of quality.",
    "title": "Prompt laboratory: test, compare, revise",
    "check": {
      "prompt": "A revised prompt receives a higher CRAFT score, but you have not run it to generate a worksheet. What can you conclude?",
      "options": [
        "Every worksheet from it will be accurate",
        "The feedback judged its structure more complete; output quality remains untested",
        "The revision has been independently validated with learners"
      ],
      "answer": "The feedback judged its structure more complete; output quality remains untested",
      "explanation": "Prompt feedback and actual output evidence answer different questions. Record what was evaluated and verify any generated material separately."
    }
  },
  {
    "durationMinutes": 45,
    "evidence": "Create three reviewed templates with named fields, a completed example, a limitation and a verification checklist. Label observed tool output or guided review; if no failure appeared, record the sampled inputs and a remaining risk.",
    "id": "teaching-prompt-library",
    "practice": "Build reusable prompts for lesson planning, assessment or feedback, and communication or adaptation; transfer one to a new topic.",
    "resources": [
      {
        "label": "Google prompting resources for educators",
        "url": "https://edu.google.com/intl/ALL_ca/ai-resources-in-education/"
      }
    ],
    "summary": "Turn successful prompts into transparent templates a colleague can fill, test and verify for a new classroom context.",
    "title": "Build your teaching prompt library",
    "check": {
      "prompt": "A colleague can copy your prompt but cannot tell what to replace or check. What should you add?",
      "options": [
        "A claim that it works with every subject",
        "Named input fields, a reviewed example, a known limit and checks",
        "Only a more memorable title"
      ],
      "answer": "Named input fields, a reviewed example, a known limit and checks",
      "explanation": "A reusable entry supports independent use and honest review. The name alone does not communicate its input requirements or limits."
    }
  }
];

export const moduleTwoMinutes = moduleTwoLessons.reduce(
  (total, lesson) => total + lesson.durationMinutes,
  0,
);

export const moduleTwoQuizQuestions: QuizQuestion[] = [
  { id: "m2-q1", lessonSlug: "repair-vague-prompt", kind: "single", concept: "Prompt repair", prompt: "Which revision best improves “Teach fractions” for a Class 5 lesson?", options: [{ id: "a", label: "Make it engaging and perfect" }, { id: "b", label: "Plan a 20-minute paper-strip activity for Class 5, with an exit question" }, { id: "c", label: "Write everything about fractions" }], correctOptionIds: ["b"], explanation: "The stronger prompt gives the learner level, time, materials, task and evidence of learning." },
  { id: "m2-q2", lessonSlug: "context-constraints-examples", kind: "multiple", concept: "CRAFT", prompt: "Which details make a classroom prompt testable? Select all that apply.", options: [{ id: "a", label: "The learning objective and learner level" }, { id: "b", label: "The requested output format" }, { id: "c", label: "A promise that AI will always be correct" }], correctOptionIds: ["a", "b"], explanation: "Context, target and format make the task concrete. AI output still needs verification." },
  { id: "m2-q3", lessonSlug: "questions-rubrics-feedback", kind: "single", concept: "Assessment", prompt: "An AI-generated answer key looks convincing. What should the teacher do before using it?", options: [{ id: "a", label: "Solve and check each question independently" }, { id: "b", label: "Publish it because the key is formatted" }, { id: "c", label: "Ask the same AI if it is sure" }], correctOptionIds: ["a"], explanation: "Independent checking catches plausible but wrong answers and misaligned questions." },
  { id: "m2-q4", lessonSlug: "differentiate-without-lowering", kind: "single", concept: "Differentiation", prompt: "Which change supports access while keeping the same learning goal?", options: [{ id: "a", label: "Remove all reasoning from the task" }, { id: "b", label: "Offer a visual scaffold and alternative response mode" }, { id: "c", label: "Give the answer first" }], correctOptionIds: ["b"], explanation: "Scaffolds can change representation or response while preserving conceptual demand." },
  { id: "m2-q5", lessonSlug: "prompt-laboratory", kind: "single", concept: "Controlled testing", prompt: "Why change one important prompt element at a time during testing?", options: [{ id: "a", label: "To know which change likely affected the output" }, { id: "b", label: "To guarantee factual accuracy" }, { id: "c", label: "To avoid reviewing the result" }], correctOptionIds: ["a"], explanation: "Controlled revisions make comparisons useful; output quality still requires teacher review." },
  {"lessonSlug": "repair-vague-prompt", "prompt": "Which instruction is easiest to check in the generated lesson?", "options": [{"id": "a", "label": "Make it wonderful"}, {"id": "b", "label": "Make it highly engaging"}, {"id": "c", "label": "Use paper strips and finish with one question that checks equivalent fractions"}], "correctOptionIds": ["c"], "explanation": "Observable materials and an exit question make output constraints testable.", "concept": "Repair vague prompt", "kind": "single", "id": "m2-q6"},
  {"lessonSlug": "context-constraints-examples", "prompt": "You want a short bilingual explanation without private learner details. Which context should you include?", "options": [{"id": "a", "label": "Named learners and their marks"}, {"id": "b", "label": "Class level, language needs and topic"}, {"id": "c", "label": "A promise that translation needs no checking"}], "correctOptionIds": ["b"], "explanation": "Relevant general classroom context supports a draft without identifiable learner records.", "concept": "Context constraints examples", "kind": "single", "id": "m2-q7"},
  {"lessonSlug": "learning-first-planning", "prompt": "A lesson objective is to explain why two fractions are equivalent. Which exit task aligns best?", "options": [{"id": "a", "label": "Copy the lesson title"}, {"id": "b", "label": "Explain with a diagram why 1/2 and 2/4 cover the same amount"}, {"id": "c", "label": "Name the classroom materials"}], "correctOptionIds": ["b"], "explanation": "The check must ask for the reasoning described in the objective.", "concept": "Learning first planning", "kind": "single", "id": "m2-q8"},
  {"lessonSlug": "learning-first-planning", "prompt": "An AI plan needs a projector your classroom does not have. What should you revise?", "options": [{"id": "a", "label": "State available materials and ask for an equivalent paper-based activity"}, {"id": "b", "label": "Remove all pupil practice"}, {"id": "c", "label": "Assume a projector will appear"}], "correctOptionIds": ["a"], "explanation": "Change the resource constraint while keeping the same intended learning.", "concept": "Learning first planning", "kind": "single", "id": "m2-q9"},
  {"lessonSlug": "learning-first-planning", "prompt": "A 20-minute plan contains 35 minutes of activities. What is a useful review?", "options": [{"id": "a", "label": "Ignore the totals"}, {"id": "b", "label": "Remove the assessment without considering the goal"}, {"id": "c", "label": "Rebalance timings and retain practice plus evidence of learning"}], "correctOptionIds": ["c"], "explanation": "Feasible timing should protect the objective, practice and a check of understanding.", "concept": "Learning first planning", "kind": "single", "id": "m2-q10"},
  {"lessonSlug": "questions-rubrics-feedback", "prompt": "Which feedback helps a pupil take a next step?", "options": [{"id": "a", "label": "Good work"}, {"id": "b", "label": "You compared denominators only; draw both fractions on equal-sized wholes and compare their shaded parts"}, {"id": "c", "label": "Try harder next time"}], "correctOptionIds": ["b"], "explanation": "Actionable feedback identifies the reasoning gap and a concrete improvement action.", "concept": "Questions rubrics feedback", "kind": "single", "id": "m2-q11"},
  {"lessonSlug": "questions-rubrics-feedback", "prompt": "Which rubric criterion measures reasoning rather than appearance?", "options": [{"id": "a", "label": "Uses the nicest handwriting"}, {"id": "b", "label": "Has the longest answer"}, {"id": "c", "label": "Explains the comparison with a valid representation"}], "correctOptionIds": ["c"], "explanation": "Assess the learning target. Length and handwriting do not establish mathematical understanding.", "concept": "Questions rubrics feedback", "kind": "single", "id": "m2-q12"},
  {"lessonSlug": "differentiate-without-lowering", "prompt": "A pupil can explain the concept orally but finds writing difficult. Which adaptation preserves the goal?", "options": [{"id": "a", "label": "Accept an oral explanation against the same reasoning criteria"}, {"id": "b", "label": "Ask only for a copied definition"}, {"id": "c", "label": "Skip the concept"}], "correctOptionIds": ["a"], "explanation": "Change the response mode while retaining the same conceptual criteria.", "concept": "Differentiate without lowering", "kind": "single", "id": "m2-q13"},
  {"lessonSlug": "differentiate-without-lowering", "prompt": "A simplified source changes “may happen” into “always happens.” What needs repair?", "options": [{"id": "a", "label": "Only the page layout"}, {"id": "b", "label": "Restore the uncertainty while simplifying the wording"}, {"id": "c", "label": "Remove all source references"}], "correctOptionIds": ["b"], "explanation": "Accessibility should preserve qualifications and the original meaning.", "concept": "Differentiate without lowering", "kind": "single", "id": "m2-q14"},
  {"lessonSlug": "prompt-laboratory", "prompt": "Two prompt versions change both audience and format. What can the comparison show?", "options": [{"id": "a", "label": "Exactly which single change caused improvement"}, {"id": "b", "label": "Guaranteed factual correctness"}, {"id": "c", "label": "An overall difference, with limited evidence about which change caused it"}], "correctOptionIds": ["c"], "explanation": "Changing several variables at once makes causal attribution weaker.", "concept": "Prompt laboratory", "kind": "single", "id": "m2-q15"},
  {"lessonSlug": "prompt-laboratory", "prompt": "A revised prompt improves structure but introduces a factual mistake. Which result should you record?", "options": [{"id": "a", "label": "The structural improvement and factual failure, followed by another repair"}, {"id": "b", "label": "A pass because the formatting improved"}, {"id": "c", "label": "Only the successful parts"}], "correctOptionIds": ["a"], "explanation": "A useful test records mixed results and directs a specific revision.", "concept": "Prompt laboratory", "kind": "single", "id": "m2-q16"},
  {"lessonSlug": "teaching-prompt-library", "prompt": "Which saved template is easiest for a colleague to reuse?", "options": [{"id": "a", "label": "A transcript full of private class details"}, {"id": "b", "label": "A generic task with input placeholders, output format and review checks"}, {"id": "c", "label": "Only a catchy title"}], "correctOptionIds": ["b"], "explanation": "A reusable template exposes its contract and review steps without private data.", "concept": "Teaching prompt library", "kind": "single", "id": "m2-q17"},
  {"lessonSlug": "teaching-prompt-library", "prompt": "A template worked for Class 5 science. How should a colleague use it for Class 3 language?", "options": [{"id": "a", "label": "Keep every assumption unchanged"}, {"id": "b", "label": "Treat the previous success as a guarantee"}, {"id": "c", "label": "Adapt the level, objective and examples, then test and review the result"}], "correctOptionIds": ["c"], "explanation": "Transfer needs explicit adaptation and fresh evidence in the new context.", "concept": "Teaching prompt library", "kind": "single", "id": "m2-q18"},
  {"lessonSlug": "teaching-prompt-library", "prompt": "Which note belongs beside a reusable prompt?", "options": [{"id": "a", "label": "Known limitations and the checks the teacher must perform"}, {"id": "b", "label": "A guarantee that every output is correct"}, {"id": "c", "label": "Learner contact information"}], "correctOptionIds": ["a"], "explanation": "Known limits and review criteria support responsible reuse.", "concept": "Teaching prompt library", "kind": "single", "id": "m2-q19"},
];
