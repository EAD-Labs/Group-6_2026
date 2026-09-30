export const moduleTwoTeaching: Record<string, { heading: string; body: string }[]> = {
  "repair-vague-prompt": [
    { heading: "Start with the learner's action", body: "Before asking AI to draft anything, state what learners should be able to do. 'Understand fractions' is hard to observe; 'compare one half and two quarters using paper strips' gives a visible target." },
    { heading: "Add the classroom conditions", body: "Specify learner level, prior knowledge, time, materials and the evidence you want at the end. These details constrain the draft to a real lesson without prescribing every sentence." },
    { heading: "Compare before and after", body: "Run the vague version and a revised version. Check alignment, feasibility and accuracy. Record which details improved the result and what the teacher still needs to edit." },
  ],
  "context-constraints-examples": [
    { heading: "Context changes the answer", body: "The same concept needs a different explanation for a Class 5 newcomer and a Class 10 revision group. Include relevant prior knowledge, language needs and available resources." },
    { heading: "Constraints should be purposeful", body: "A time limit, materials limit or source boundary can make an output practical. Too many arbitrary restrictions may reduce useful options; test the effect of each important constraint." },
    { heading: "Examples can help and mislead", body: "A teacher-written example shows tone and structure, but may import an assumption. Inspect the result for copied mistakes or overfitting to the sample." },
  ],
  "learning-first-planning": [
    { heading: "Objective, activity, evidence", body: "Write the learning objective first. Ask for a task where learners practise it, then an exit question that actually reveals whether they achieved it." },
    { heading: "Plan for the room you have", body: "Include class duration, group size, materials and a low-resource alternative. A beautiful plan that needs an unavailable projector is not ready for use." },
    { heading: "Review the sequence", body: "Check whether the opening elicits prior knowledge, the main task supports the objective and the assessment measures the same idea. Edit unrealistic timing yourself." },
  ],
  "questions-rubrics-feedback": [
    { heading: "Generate to an objective", body: "Specify the skill, difficulty and question type. Ask for an answer key, likely errors and scoring criteria, then solve every generated question independently." },
    { heading: "Make feedback actionable", body: "Replace generic praise with what was done well, the specific gap and one next step. Use fictional work for practice; avoid sending real student submissions to an unapproved AI tool." },
    { heading: "Inspect distractors", body: "A distractor should represent a plausible misconception rather than a trick or a second correct answer. Edit language for age suitability and fairness." },
  ],
  "differentiate-without-lowering": [
    { heading: "Hold the goal steady", body: "Start with the same core concept for every learner. Change how it is represented or how learners respond, rather than quietly replacing the task with an easier learning objective." },
    { heading: "Offer useful supports", body: "Ask for vocabulary aids, chunked instructions, diagrams, worked starts or oral response options. Include an extension that deepens reasoning rather than adding busywork." },
    { heading: "Review for assumptions", body: "AI may label learners or infer ability from background. Keep descriptions general and teacher-controlled. Check that every version remains respectful and practical." },
  ],
  "prompt-laboratory": [
    { heading: "Create a baseline", body: "Use a real but non-sensitive teacher task in the CRAFT lab. Record the first result and its weaknesses before changing the prompt." },
    { heading: "Revise one thing at a time", body: "First improve context, then perhaps source boundary or format. Compare the outputs for accuracy, alignment, practicality and clarity, not only the rubric score." },
    { heading: "Repeat the strongest version", body: "Generative outputs vary. Run the strongest prompt again to see whether it stays usable, then document the teacher edit still required." },
  ],
  "teaching-prompt-library": [
    { heading: "Turn a draft into a template", body: "Keep the reusable instruction and mark fields another teacher must fill: objective, class, time, source and format. Include one completed fictional example." },
    { heading: "Record a known limit", body: "A template should state a failure you observed, such as invented references or unrealistic materials, and the check that catches it." },
    { heading: "Test transfer", body: "Use the template on a second topic. If it works only for the first example, revise the stable instruction or narrow its stated purpose." },
  ],
};
