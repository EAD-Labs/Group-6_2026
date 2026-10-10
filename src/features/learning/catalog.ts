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
      "Discover what AI can help with, spot mistakes, and check its work before using it.",
    estimatedMinutes: 180,
    id: "00000000-0000-4000-8000-000000000001",
    position: 1,
    slug: "module-1",
    title: "Understand AI",
  },
  {
    description:
      "Practise asking AI for lesson plans, quizzes, and explanations. Get feedback and save useful requests.",
    estimatedMinutes: 240,
    id: "00000000-0000-4000-8000-000000000002",
    position: 2,
    slug: "module-2",
    title: "Write better AI requests",
  },
  {
    description:
      "Save instructions for teaching tasks you do often. Try them, improve them, and use them again.",
    estimatedMinutes: 360,
    id: "00000000-0000-4000-8000-000000000003",
    position: 3,
    slug: "module-3",
    title: "Create a teaching helper",
  },
  {
    description:
      "Use your lesson notes to make worksheets and quizzes, then check each draft before class.",
    estimatedMinutes: 260,
    id: "00000000-0000-4000-8000-000000000004",
    position: 4,
    slug: "module-4",
    title: "Make resources from your material",
  },
];

export const moduleOne = learningModules[0];

export const moduleOneLessons: LessonDetail[] = [
  {
    "durationMinutes": 25,
    "eyebrow": "Lesson 1 · Build the right mental model",
    "id": "00000000-0000-4000-8000-000000000101",
    "moduleId": "00000000-0000-4000-8000-000000000001",
    "position": 1,
    "resources": [
      {
        "label": "How AI works — Code.org",
        "type": "video",
        "url": "https://www.youtube.com/watch?v=Ok-xpKjKp2g"
      },
      {
        "label": "Generative AI for Educators — Google",
        "type": "guide",
        "url": "https://grow.google/ai-for-educators/"
      },
      {
        "label": "Code.org: training data and tokens — optional teacher reading",
        "url": "https://lesson-plans.code.org/foundations-gen-ai-2024/20250507162310/teacher-lesson-plans/Input-Training-Data.pdf",
        "type": "guide"
      }
    ],
    "sections": [
      {
        "heading": "Worked example: a missing meeting time",
        "body": "Fictional teacher brief: “Draft a notice inviting families to a reading workshop next week. The time has not been decided.” A simulated draft says “Join us at 4 p.m.” The wording is useful, but the time is invented. Repair it to “Join us at [confirmed time]” and obtain the school-approved details before sending.",
        "highlight": "A plausible detail is not a supplied fact."
      },
      {
        "heading": "Try three different kinds of work",
        "body": "Classify these: find the school calendar; calculate 18 + 22; draft a welcoming notice from confirmed details. Use retrieval for the calendar, a calculation for the total (40), and generation for a draft. A product may combine them; explain which capability you need and how you will check it."
      },
      {
        "heading": "Check your explanation",
        "body": "Write two sentences for a colleague: what the prompt supplies, and why the response may be wrong. You have the idea if you distinguish current context from training and name a fact that requires outside verification. Common mistake: describing the model as a textbook that always retrieves the correct page."
      },
      {
        "heading": "Reflect on your next request",
        "body": "Choose one detail you previously left for AI to guess. Will you supply it, ask the tool to request it, or require a visible placeholder? Write the exact instruction you would add."
      }
    ],
    "slug": "meet-generative-ai",
    "summary": "Explain how a language model uses a prompt, distinguish generation from retrieval, and identify what a fluent answer still cannot establish.",
    "takeaways": [
      "Generated wording and retrieved evidence are different; tools can combine them.",
      "The same request can produce different wording.",
      "Teacher verification remains essential."
    ],
    "title": "Meet generative AI",
    "transcript": [
      "Suppose you need three ways to explain a familiar idea. A search tool can find existing explanations. A calculator can apply a specified calculation. A generative model can compose a new explanation in response to your request. Some products combine these capabilities, so ask what the tool actually did: retrieve a page, calculate, or generate wording.",
      "A language model learns patterns during training. When you use it, your instruction and available conversation provide context for the current response. The model processes text in small pieces called tokens and produces a continuation. A token can be a word or part of a word; you do not need to count tokens for these lessons. Adding classroom context is not the same as retraining the underlying model.",
      "Try completing “The teacher opened the…” with “book”, “window” or “lesson”. Adding “to let fresh air in” makes one continuation more suitable. This is a simple analogy for how context constrains a response, not a complete description of a language model. A suitable-sounding continuation can still describe something that never happened.",
      "That distinction matters when a model supplies a date, quotation or answer key. It can produce plausible details where your prompt left a gap. Some tools can search or use supplied documents, but the resulting sentence still needs checking against the actual evidence. Different runs can also produce different responses; repetition or confidence is not proof of correctness."
    ]
  },
  {
    "durationMinutes": 25,
    "eyebrow": "Lesson 2 · Start from a real teacher task",
    "id": "00000000-0000-4000-8000-000000000102",
    "moduleId": "00000000-0000-4000-8000-000000000001",
    "position": 2,
    "resources": [
      {
        "label": "How chatbots and language models work — Code.org",
        "type": "video",
        "url": "https://www.youtube.com/watch?v=X-AWdfSFCHQ"
      }
    ],
    "sections": [
      {
        "heading": "Worked example: a useful quiz brief",
        "body": "Meera needs a five-minute check of whether Class 5 learners can compare one half and one third of the same-sized whole. She asks for two questions, expected reasoning and one likely wrong answer. She then draws equal rectangles herself and checks the answer. A question that merely asks “What is a denominator?” does not assess her comparison objective."
      },
      {
        "heading": "Make a task map",
        "body": "For each job, choose a method and a review: draft an activity hook; calculate a total; translate a notice; assign a final grade; summarise a permitted article; recommend discipline. Possible decisions: AI draft plus subject review; calculator plus input check; draft plus competent language review; human assessment process; source comparison; human safeguarding/disciplinary process. Translation is still a draft until meaning is checked."
      },
      {
        "heading": "Decide whether the help was useful",
        "body": "Select one drafting task and write the objective, output, review method and rejection condition. Success means the review could catch a specific failure. Common mistake: keeping a long, attractive plan whose activity does not reveal the intended learning. Count checking and editing time before claiming a saving."
      },
      {
        "heading": "Reflect on the boundary",
        "body": "Finish: “I would use AI to help with ___, but I would stop if ___ because ___.” Name a concrete condition, such as an invented policy or an answer you cannot independently verify."
      }
    ],
    "slug": "useful-teacher-tasks",
    "summary": "Choose a bounded preparation task, define its learner benefit and assign a specific teacher check before trying AI.",
    "takeaways": [
      "Use AI for bounded drafts with a review you can perform.",
      "Do not delegate high-stakes learner decisions.",
      "Connect every request to a learning objective."
    ],
    "title": "Useful teacher tasks",
    "transcript": [
      "Begin with a preparation problem you can describe and inspect: an instruction that is too long, a need for alternative examples, or three questions for tomorrow’s lesson. “Use AI in my teaching” is too broad to test. State what learners should gain and what a usable output would look like.",
      "Drafting can be a suitable starting point because you can reject or edit the result before anyone relies on it. It is not automatically low-risk: a worksheet can teach an error and a parent-message draft can invent a school policy. Choose a small topic you know well and budget time to check the content, language and practical demands.",
      "Keep final decisions about grades, discipline, placement and learner support with the responsible people and institutional process. Those decisions involve evidence and consequences that a generated answer does not take responsibility for. In this course, use fictional learner responses to practise noticing errors and writing feedback.",
      "Name the review action before generating. “I will check it” is vague. “I will solve all three questions, compare the explanation with my verified notes, and remove equipment we do not have” gives you a stopping rule. If you cannot judge the output or obtain a competent review, narrow the task or choose another method."
    ]
  },
  {
    "durationMinutes": 30,
    "eyebrow": "Lesson 3 · Make teacher review specific",
    "id": "00000000-0000-4000-8000-000000000103",
    "moduleId": "00000000-0000-4000-8000-000000000001",
    "position": 3,
    "resources": [
      {
        "label": "UNESCO guidance for generative AI in education",
        "type": "guide",
        "url": "https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research?hub=67098"
      },
      {
        "label": "Exploring the ethics of AI — Code.org",
        "type": "video",
        "url": "https://www.youtube.com/watch?v=3oqxjPXbynE"
      }
    ],
    "sections": [
      {
        "heading": "Worked example: reduce the information",
        "body": "Unsafe fictional brief: “Rewrite feedback for R, the only child in Class 6 with [health detail], who scored 3/10.” A safer training brief is “Use this teacher-written fictional response to practise feedback on comparing fractions.” Replacing R with “Student A” while keeping the identifying story would not solve the problem."
      },
      {
        "heading": "Worked example: keep the maths, change the access",
        "body": "A draft says “Use your family’s car journey to estimate distance.” If the objective is estimating distance, offer a supplied fictional bus route or a shared map instead. Everyone can work on the same idea without disclosing family travel or owning a car. Then check that the distances and units are sensible."
      },
      {
        "heading": "Do a six-part review",
        "body": "Use one draft and record: factual accuracy; objective alignment; learner access and language; privacy; source permission/credit; remaining limits. For each, note one thing you actually inspected. Success is a revised draft with a reason for a substantive change, not six unchecked assurances."
      },
      {
        "heading": "Reflect before approving",
        "body": "Which part would you ask a colleague to review, and what exact question would you give them? For example: “Does this glossary preserve the science meaning in both languages?” Keep the draft unapproved while a necessary check remains unresolved."
      }
    ],
    "slug": "review-before-use",
    "summary": "Protect privacy and check accuracy, suitability, inclusion and curriculum fit before use.",
    "takeaways": [
      "Remove identifiable or confidential information.",
      "Verify facts with a trusted source.",
      "Adapt language, difficulty and format for your learners."
    ],
    "title": "Review before use",
    "transcript": [
      "Review begins before you enter the prompt. Supply the minimum information needed for the teaching task. For this course, create fictional examples instead of using student names, linked marks, health details, counselling notes or confidential school records. Removing a name is not enough if a distinctive incident or combination of details still identifies the child.",
      "Next inspect what the draft says and asks learners to do. Solve numerical questions independently; compare factual claims with the relevant approved source; read the instructions as a learner would. Check whether the activity measures the objective and whether a learner could complete it with the stated time and materials.",
      "Look for assumptions about families, language and access. A task that requires every child to bring a smartphone can exclude learners even when its subject content is correct. Change the unnecessary requirement while retaining the learning goal. Describe support needs without assigning fixed ability labels or making guesses about a child from their background.",
      "Finally check the right to use the source and the intended audience for the output. Publicly visible material is not automatically available for every reuse. Keep relevant credit and permission information. A teacher’s approval should describe what was checked, what changed and what remains uncertain; a tick beside “safe” does not supply that evidence."
    ]
  },
  {
    "durationMinutes": 30,
    "eyebrow": "Lesson 4 · Separate claims from evidence",
    "id": "00000000-0000-4000-8000-000000000104",
    "moduleId": "00000000-0000-4000-8000-000000000001",
    "position": 4,
    "resources": [
      {
        "label": "How chatbots and language models work — Code.org",
        "type": "video",
        "url": "https://www.youtube.com/watch?v=X-AWdfSFCHQ"
      }
    ],
    "sections": [
      {
        "heading": "Source for a four-claim audit",
        "body": "Original fictional note: “Class A has 18 learners and Class B has 22. Both classes will use paper. In this activity, learners may explain their answer orally or in writing. This note states no homework policy.” Simulated AI draft: “The activity uses paper. There are 42 learners. The school has abolished homework. Every school assessment can be answered orally.” This is a teaching example, not an observed model run."
      },
      {
        "heading": "Worked audit and correction",
        "body": "Paper: supported by the note. Total 42: contradicted by 18 + 22 = 40. Abolished homework: unsupported; request the actual policy. Every assessment oral: unsupported overgeneralisation; the note permits oral responses only for this activity. A repaired draft gives 40 learners, paper, and the two response options for this activity, leaving homework unresolved."
      },
      {
        "heading": "Try the audit on a new sentence",
        "body": "Audit “Both classes must submit written answers.” Identify the claim, quote or locate the evidence, give a verdict and repair it. It is contradicted because the note explicitly permits oral responses too. Success means your reason addresses the precise claim; a topic match or a working link alone is insufficient."
      },
      {
        "heading": "Reflect on what would settle the gap",
        "body": "For the homework claim, name the source you would need and who could confirm it. Do not fill the gap with a guess. In your next worksheet, which claim would most harm understanding if wrong? Check that claim first, then complete the remaining necessary checks."
      }
    ],
    "slug": "verify-ai-claims",
    "summary": "Audit AI output by connecting each important claim to independent evidence.",
    "takeaways": [
      "A citation must exist and support the claim.",
      "Use an independent source or tool to verify.",
      "Distinguish unsupported from proven false."
    ],
    "title": "Hallucinations and verification",
    "transcript": [
      "An AI hallucination is generated content that is false or unsupported, often presented in ordinary confident language. You do not need to identify why the model produced it to review the result. Separate three things: the claim being made, the evidence available, and the decision you will make about using it.",
      "Read a claim as an exact statement. Numbers, dates, negatives and words such as “all”, “only” or “always” can change its meaning. A passage permitting oral answers in one activity does not establish a school-wide assessment policy. A source about the same topic may still fail to support the particular sentence.",
      "Open a cited source and find the relevant passage. Check who produced it, what it covers and whether its version fits your question. For a calculation, recompute using the correct inputs. Asking the same model to reassure you may produce another confident sentence; it does not replace inspecting evidence.",
      "Use precise verdicts. Supported means the available evidence backs the claim. Contradicted means evidence conflicts with it. Unsupported means the material does not establish it, which is different from proving it false. If two relevant sources disagree, keep the conflict visible and seek the authoritative record. Do not hide disagreement by choosing the convenient answer."
    ]
  },
  {
    "durationMinutes": 30,
    "eyebrow": "Lesson 5 · Match the tool to the job",
    "id": "00000000-0000-4000-8000-000000000105",
    "moduleId": "00000000-0000-4000-8000-000000000001",
    "position": 5,
    "resources": [
      {
        "label": "NotebookLM teaching example",
        "type": "video",
        "url": "https://www.youtube.com/watch?v=0wfJeL-IalY"
      },
      {
        "label": "Add and manage NotebookLM sources — Google Help",
        "type": "guide",
        "url": "https://support.google.com/gemininotebook/answer/16215270?co=GENIE.Platform%3DDesktop&hl=en-6"
      }
    ],
    "sections": [
      {
        "heading": "Worked example: four jobs, four checks",
        "body": "Extract a deadline: read the official notice and verify its version. Draft three activity ideas: use approved chat and check feasibility. Check 18 + 22: calculate 40 and verify that those are the intended counts. Compare two policy notes: use the documents directly or a source notebook, then open both cited passages and report disagreements."
      },
      {
        "heading": "A familiar tool can still be the wrong choice",
        "body": "Common mistake: asking a writing assistant to provide an exact total, official date and classroom plan in one unchecked response. Split the work. Obtain the reliable numbers and dates first; then supply confirmed values for a draft. An AI tool may itself call a calculator, but inspect whether it used the right quantities and method."
      },
      {
        "heading": "Write a tool decision card",
        "body": "Choose one job and record: required evidence; tool or non-AI method; information you will supply; output you expect; independent check. Success means someone can explain why that method fits the job. “It is the newest tool” is not a sufficient reason."
      },
      {
        "heading": "Reflect on a fallback",
        "body": "If your preferred tool is unavailable, what part can you complete from the source or worked example? Label a paper exercise as practice rather than claiming a live run. Do not bypass a school’s account restrictions to finish the activity."
      }
    ],
    "slug": "choose-the-right-tool",
    "summary": "Choose chat, source-grounded tools, reusable assistants or reliable calculators according to the task.",
    "takeaways": [
      "Tool choice follows the teaching purpose.",
      "Source-grounded still requires checking.",
      "Use deterministic tools for exact calculations."
    ],
    "title": "Choose the right AI assistance",
    "transcript": [
      "Tool choice starts with the kind of answer you need. To locate an official timetable, open the current official document. To add marks in a fictional practice table, use a calculator or spreadsheet and check the inputs. To propose three alternative explanations, a general AI chat can draft options for you to review.",
      "A source notebook helps you ask questions about selected documents and inspect supporting passages. It is useful when “what do these notes say?” matters more than a general answer. You still select the sources, inspect the imported text and compare claims with passages. New research modes can add sources, so confirm the actual evidence boundary rather than assuming every feature uses only your original pack.",
      "A reusable assistant stores instructions for a repeated job, such as drafting an exit ticket in a chosen format. It does not become an expert or acquire guaranteed memory of every previous task. State today’s objective and constraints each time. Module 3 will teach how to test and repair these instructions.",
      "An API is a way for software to ask another service to do work. For example, a website can send a prompt-evaluation request to an AI service and display the response. This course does not require you to write code or paste an API key into a lesson. The provider, information sent and account approval still matter when you use an external tool."
    ]
  },
  {
    "durationMinutes": 40,
    "eyebrow": "Lesson 6 · Put responsible use into practice",
    "id": "00000000-0000-4000-8000-000000000106",
    "moduleId": "00000000-0000-4000-8000-000000000001",
    "position": 6,
    "resources": [
      {
        "label": "UNESCO AI competency framework for teachers",
        "type": "guide",
        "url": "https://www.unesco.org/en/articles/ai-competency-framework-teachers?hub=83294"
      }
    ],
    "sections": [
      {
        "heading": "A prepared draft to inspect",
        "body": "Fictional brief: Class 5, pairs, paper and pencils, ten minutes. Objective: justify whether one half or one third of an equal-sized whole is larger. Verified note: dividing the same whole into fewer equal parts makes each part larger. Simulated draft: “Play an eight-minute video, then compare two cakes of different sizes. Explain that one third is greater because three is greater than two.”"
      },
      {
        "heading": "Worked repair with visible reasoning",
        "body": "Reject the incorrect fraction rule and unequal wholes; a numerator of one with a larger denominator represents a smaller part of the same whole. Replace the unavailable video with equal paper strips. Use 2 minutes to predict, 4 to fold and compare, 2 to explain with a partner and 2 for an exit drawing. Check that folds make equal parts. Ask learners to justify the comparison, not only state 1/2."
      },
      {
        "heading": "Make your own decision card",
        "body": "Session A (20 minutes): choose the objective, brief the task and preserve the first draft. Session B (20 minutes): audit, revise and record the decision. Keep the source, request, first draft, checked answer and final activity in your own notes. Success means another teacher can trace one decision to evidence and run the activity with the listed resources."
      },
      {
        "heading": "Reflect and transfer",
        "body": "Write: “I changed/retained ___ because I checked ___. Before using this with a different class, I would verify ___.” Include preparation and checking time if you compare effort. A course practice record demonstrates this task only; it cannot guarantee later AI outputs or student learning results."
      }
    ],
    "slug": "responsible-use-challenge",
    "summary": "Create and document a small classroom activity that makes both AI help and teacher judgment visible.",
    "takeaways": [
      "Keep the task small and source-aware.",
      "Record checks, edits and rejected suggestions.",
      "The teacher approves final classroom use."
    ],
    "title": "Responsible-use challenge",
    "transcript": [
      "Your task is a ten-minute introduction to a topic you already know well. Choose a small learning objective that learners can demonstrate, such as explaining a comparison, identifying evidence in a passage or distinguishing two concepts. Prepare a short verified note and fictional class context. No real learner records are needed.",
      "First write what a usable activity would include: learner action, materials, timing and an exit question. Then draft a request and use an approved tool if available. Keep its first response before editing. If no tool is available, use the deliberately flawed worked draft below and label your work an audit of a prepared example.",
      "Review the draft in two passes. In the first, check claims and answers against the source or independent reasoning. In the second, try to follow the activity as a teacher: are the directions clear, materials available, timing plausible and response options accessible? Revise or reject anything that prevents the objective from being met.",
      "Your decision card should show the task, intended learner benefit, information supplied, tool or prepared-example route, checks, corrections, limitations and person responsible for use. Do not invent a successful run or a rejected suggestion. If a draft needs no substantive correction, document a specific check and what would have made you reject it."
    ]
  }
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
  {"lessonSlug": "meet-generative-ai", "prompt": "A meeting note does not include a start time. What should an AI summary do?", "options": [{"id": "a", "label": "Invent a likely time"}, {"id": "b", "label": "Leave the time unspecified and ask for it"}, {"id": "c", "label": "Use the time from an unrelated meeting"}], "correctOptionIds": ["b"], "explanation": "Missing information should remain visible. Generating a plausible value does not turn it into evidence.", "concept": "Meet generative ai", "kind": "single", "id": "m1-q6"},
  {"lessonSlug": "useful-teacher-tasks", "prompt": "Which request keeps the teacher in control of a spelling activity?", "options": [{"id": "a", "label": "Draft three activities for review against the learning objective"}, {"id": "b", "label": "Automatically rank named learners from their records"}, {"id": "c", "label": "Send an unchecked worksheet directly to families"}], "correctOptionIds": ["a"], "explanation": "Drafting supports preparation while the teacher reviews alignment and decides how to use the activity.", "concept": "Useful teacher tasks", "kind": "single", "id": "m1-q7"},
  {"lessonSlug": "verify-ai-claims", "prompt": "An AI names a journal article that you cannot find. What is the next useful step?", "options": [{"id": "a", "label": "Treat the formal citation as proof"}, {"id": "b", "label": "Replace it with another invented title"}, {"id": "c", "label": "Search the original publisher and label the claim unverified if no supporting source exists"}], "correctOptionIds": ["c"], "explanation": "A believable citation is not source evidence. Check whether the source exists and supports the claim.", "concept": "Verify ai claims", "kind": "single", "id": "m1-q8"},
  {"lessonSlug": "verify-ai-claims", "prompt": "A source supports one sentence but says nothing about a second claim. How should you record the second?", "options": [{"id": "a", "label": "Unsupported by the supplied source"}, {"id": "b", "label": "Confirmed because the first sentence was correct"}, {"id": "c", "label": "False in every possible setting"}], "correctOptionIds": ["a"], "explanation": "Absence of support is different from contradiction. Record the evidence gap and seek a suitable source.", "concept": "Verify ai claims", "kind": "single", "id": "m1-q9"},
  {"lessonSlug": "choose-the-right-tool", "prompt": "You need the latest official school circular. Which first step fits the task?", "options": [{"id": "a", "label": "Ask a text generator to invent its contents"}, {"id": "b", "label": "Retrieve the circular from the authorised school source"}, {"id": "c", "label": "Use a drawing tool to make a similar document"}], "correctOptionIds": ["b"], "explanation": "Use retrieval from the authoritative source when the task needs a particular existing document.", "concept": "Choose the right tool", "kind": "single", "id": "m1-q10"},
  {"lessonSlug": "choose-the-right-tool", "prompt": "A class has no reliable internet. What belongs in your AI-supported lesson plan?", "options": [{"id": "a", "label": "A reviewed offline alternative using available materials"}, {"id": "b", "label": "A promise the connection will recover"}, {"id": "c", "label": "A requirement that every child opens an AI account"}], "correctOptionIds": ["a"], "explanation": "A workable fallback protects the learning goal when a tool is unavailable.", "concept": "Choose the right tool", "kind": "single", "id": "m1-q11"},
  {"lessonSlug": "responsible-use-challenge", "prompt": "A draft worksheet contains a named learner and an incorrect answer key. Which repair is sufficient?", "options": [{"id": "a", "label": "Only change the font"}, {"id": "b", "label": "Remove identifying data, solve the questions and correct the key before use"}, {"id": "c", "label": "Hide the learner name in white text"}], "correctOptionIds": ["b"], "explanation": "Privacy and correctness are separate problems. Repair and independently verify both before classroom use.", "concept": "Responsible use challenge", "kind": "single", "id": "m1-q12"},
  {"lessonSlug": "responsible-use-challenge", "prompt": "Which decision-card note makes a repaired draft reviewable?", "options": [{"id": "a", "label": "The AI said it was excellent"}, {"id": "b", "label": "Ready because it sounds confident"}, {"id": "c", "label": "The error found, the supporting source, the correction and any remaining uncertainty"}], "correctOptionIds": ["c"], "explanation": "Recording what changed and why lets another teacher examine the decision.", "concept": "Responsible use challenge", "kind": "single", "id": "m1-q13"},
  {"lessonSlug": "responsible-use-challenge", "prompt": "A review finds a biased example but the maths is correct. What should you do?", "options": [{"id": "a", "label": "Use it because one check passed"}, {"id": "b", "label": "Revise the example and recheck the learning demand"}, {"id": "c", "label": "Delete the learning objective"}], "correctOptionIds": ["b"], "explanation": "A correct answer does not settle suitability or bias. Repair the example while preserving the learning goal.", "concept": "Responsible use challenge", "kind": "single", "id": "m1-q14"},
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
