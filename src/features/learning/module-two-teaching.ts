export const moduleTwoTeaching: Record<string, { heading: string; body: string; example?: string }[]> = {
  "repair-vague-prompt": [
    {
      "heading": "Start with a result you can observe",
      "body": "A request such as “make fractions engaging” does not say what learners should demonstrate. Replace it with an action: compare, explain, justify or revise something specific. Then state what evidence would show success. The AI is drafting teaching material; the learner is doing the learning.",
      "example": "Objective: learners justify why 1/2 is greater than 1/3 when the whole is the same size. Evidence: two equal-sized drawings and an explanation about the size of each equal part."
    },
    {
      "heading": "Build the request with CRAFT",
      "body": "In PromptShala, CRAFT means Context, Role, Action, Format and Target. Context gives the teaching situation and constraints; Role sets the support job; Action asks for the work; Format specifies its shape; Target names the intended learners and success requirements. Relevant details may overlap. Use the labels to check meaning, not to collect keywords. Privacy, verification and teacher review apply across all five.",
      "example": "Context: 20 minutes, 40 learners in pairs, paper and pencils. Role: support a primary maths teacher. Action: draft a comparison activity. Format: timed steps, two questions and checked-answer guidance. Target: Class 5 learners who recognise halves; each should justify the comparison."
    },
    {
      "heading": "A complete prompt you can adapt",
      "body": "Read the example and predict what the added details should change. Asking for a teacher role can shape wording, but does not prove mathematical expertise. Add a rule for missing source information, and keep the output a draft for your review.",
      "example": "“Help a Class 5 teacher draft a 20-minute activity comparing 1/2 and 1/3 of equal-sized wholes. Forty learners work in pairs with paper and pencils only. Return an objective, timed learner actions, two likely wrong answers and an exit question with reasoning. Keep each whole the same size. Do not invent curriculum codes. List what I must check.”"
    },
    {
      "heading": "Review the result against the brief",
      "body": "Check whether the draft uses equal wholes, fits 20 minutes and asks for reasoning. A longer response is not necessarily better. Common mistake: rewarding all five CRAFT labels even if the actual task contradicts the objective. The sandbox evaluates prompt structure; it does not certify the accuracy of a generated lesson.",
      "example": "Reject a draft comparing half a large sheet with a third of a small sheet. Repair the equal-whole condition before comparing the fractions."
    },
    {
      "heading": "Finish with a prediction you can test",
      "body": "Keep your first request and revision. Underline where each CRAFT element is expressed and predict two observable changes, such as materials staying within the brief and an exit question requiring an explanation. You have succeeded when a colleague could judge the draft against those conditions. Reflect: which added detail prevents the most consequential error?",
      "example": "Evidence note: “I added equal-sized wholes to prevent a misleading comparison; I will inspect the drawing instructions to see whether the draft preserves it.”"
    }
  ],
  "context-constraints-examples": [
    {
      "heading": "Include details that change the work",
      "body": "Useful context narrows a decision the tool would otherwise guess: prior knowledge, time, language, class size, materials or permitted sources. Leave out identifying learner details. If two details conflict, resolve them before generating or ask the tool to identify the conflict.",
      "example": "“Class 7; learners can spot a quotation but need practice separating observation from inference; fifteen minutes; one printed passage per pair.” This affects the activity more than describing the lesson as outstanding."
    },
    {
      "heading": "Separate instructions, evidence and examples",
      "body": "Make three labelled blocks: what the tool must do, the source it may use, and an example of the desired output. A source supplies evidence; an example illustrates a pattern. Neither should silently override your instructions. Tell the tool which parts of an example to imitate.",
      "example": "Task: create two questions. SOURCE: a short teacher-written story. FORMAT EXAMPLE: “Question | evidence line | reason”. Add: “Copy this format, not the example’s facts or topic.”"
    },
    {
      "heading": "Worked example: a sample imports the wrong assumption",
      "body": "Suppose your format example asks learners to watch a projected video, while today’s class has no electricity. Without a clear boundary, the response may copy the equipment assumption along with the layout. Retain the helpful format and remove or explicitly exclude the irrelevant detail.",
      "example": "Before: “Use the following video lesson as a model.” After: “Use its question/evidence/reason layout only. Our sources are printed; no projector or internet is available.” Check the next draft for hidden requirements such as printing extra sheets."
    },
    {
      "heading": "Try a controlled comparison",
      "body": "Keep one task and source unchanged. Draft once without an example and once with a checked example. Compare the requested layout, factual fidelity and usefulness, then remove one misleading detail and inspect the result again. Record a teacher-authored expected output separately from any actual model response.",
      "example": "In the log, “followed the three columns” is a specific observation. “Much more creative” needs an example of the difference and why it helps learning."
    },
    {
      "heading": "Check and reflect",
      "body": "Success means you can name one useful constraint, one imported assumption and one remaining weakness. Do not add ten restrictions simply to make a prompt look sophisticated. Reflect: which constraint would you relax first if the output became too rigid, and what learning requirement must remain?",
      "example": "Keep the evidence-line requirement; allow either a table or short labelled items if a wide table is difficult to read on a phone."
    }
  ],
  "learning-first-planning": [
    {
      "heading": "Distinguish the objective from the activity",
      "body": "An objective describes what learners should demonstrate. An activity is how they practise. Evidence is what you inspect to decide whether the objective was met. Writing these separately helps you catch plans that are busy without teaching the intended idea.",
      "example": "Objective: justify a character inference using a detail. Activity: read a short story and compare interpretations. Evidence: a claim, a quoted detail and an explanation of the connection. “Watch a video” describes an activity, not the learning."
    },
    {
      "heading": "Worked example: align a short lesson",
      "body": "Use the fictional text “Nila held a folded map. She paused at two paths, looked at the map and chose the left one.” Ask for a fifteen-minute lesson on evidence-based inference. A suitable sequence allows learners to notice details, propose a possibility and defend it without claiming the story states more than it does.",
      "example": "3 minutes: mark explicit details. 5 minutes: pairs propose what Nila may be deciding. 4 minutes: compare two interpretations and their evidence. 3 minutes: exit response, “What might explain her pause? Give a detail and keep your conclusion tentative.” The total is 15 minutes."
    },
    {
      "heading": "Test the exit question before accepting the plan",
      "body": "Answer the proposed exit question yourself. If it can be answered without the targeted thinking, revise it. A heading such as “higher-order question” does not make the question demanding. Keep the answer guide open to more than one defensible interpretation when the text supports that.",
      "example": "“What did Nila hold?” assesses recall. “What might her pause suggest, and which detail supports your idea?” assesses inference. “She was definitely lost” exceeds the evidence."
    },
    {
      "heading": "Fit the room and provide an alternative",
      "body": "State available time and materials, grouping, prior knowledge and an access support. Check transitions and whether learners can see or hear the source. To test the plan, remove one resource and ask for an adaptation preserving the objective; then judge what learning evidence was lost or retained.",
      "example": "With no projector, read the short text aloud and write it on the board. Allow an oral response that still includes a detail and a reason. If reading fluency were the objective, a different assessment arrangement would be needed."
    },
    {
      "heading": "Check and reflect",
      "body": "Keep the objective/activity/evidence chain, timings and one reasoned edit. Success means the exit task reveals the stated learning and the instructions can be carried out with your resources. Reflect: which tempting activity did you shorten or reject because it did not contribute to the objective?",
      "example": "Review note: “I replaced a ten-minute poster decoration with comparing two interpretations, because the objective concerns evidence rather than presentation.”"
    }
  ],
  "questions-rubrics-feedback": [
    {
      "heading": "Design the evidence before the questions",
      "body": "Specify the objective and decide what a correct response must show. Ask for a small range of question demands, an answer guide and plausible errors. Solve every question independently before using it. A fluent explanation or a nicely formatted answer key can still be wrong.",
      "example": "For comparing unit fractions, include a comparison, an explanation and a new equal-whole example. Three questions asking learners to name the denominator would leave the comparison objective untested."
    },
    {
      "heading": "Worked example: separate answer and reasoning",
      "body": "Fictional task: “Which is greater, 1/2 or 1/3 of the same-sized whole? Explain.” Response A: “1/2.” Response B: “1/2, because fewer equal parts make each part larger when the whole stays the same.” Use two criteria: correct comparison, and reasoning about equal wholes and parts. These are practice criteria, not an automated final grade.",
      "example": "A meets the comparison criterion but has not shown the explanation. B meets both. “1/3 because 3 is bigger” suggests a denominator misconception, but one response alone does not diagnose a learner."
    },
    {
      "heading": "Write feedback that enables a next attempt",
      "body": "Connect feedback to the work, name the missing element and set one manageable action. Plan a chance to use that feedback. Praise without a next step, a list of every weakness or a personal label does not tell the learner how to improve.",
      "example": "Feedback for A: “Your comparison is correct. Draw two equal rectangles, divide one into halves and the other into thirds, and explain why one shaded half is larger.” Ask for the revised explanation afterwards."
    },
    {
      "heading": "Inspect the distractors and rubric",
      "body": "Each wrong option should reveal a plausible misunderstanding while the correct answer remains clear. Avoid accidental second answers and irrelevant reading difficulty. Try applying the rubric to two different responses; if a criterion such as “good understanding” does not tell you what evidence counts, rewrite it.",
      "example": "Useful distractor: “1/3 is larger because 3 is larger than 2.” Weak distractor: an obviously unrelated word. For open explanations, accept different wording that establishes equal wholes, equal parts and the correct comparison."
    },
    {
      "heading": "Check and reflect",
      "body": "Produce three checked questions with rationales and feedback on two fictional responses. Success means you can justify the answer and explain what each next action should reveal. Reflect: what response to your feedback would show that the learner improved, rather than merely copied your correction?",
      "example": "Look for a correct comparison with a new equal-whole drawing and an explanation, not only replacing “1/3” with “1/2”."
    }
  ],
  "differentiate-without-lowering": [
    {
      "heading": "Name the barrier and protect the goal",
      "body": "Begin with a concrete barrier: unfamiliar vocabulary, dense instructions, inaccessible audio or an unhelpful response format. Then state the thinking that must remain. Do not assume a learner has a fixed “visual” or “auditory” identity, or infer ability from language background.",
      "example": "Goal: justify an inference from a story. Barrier: complex sentence structure. Support: shorter sentences and a glossary while retaining the same details and the need to justify an interpretation."
    },
    {
      "heading": "Worked example: three routes to the same evidence",
      "body": "Original task: “Explain why Nila may have paused, using the map and two paths as evidence.” Keep that reasoning in the supported version. The extension should deepen the comparison, rather than merely add more of the same questions.",
      "example": "Standard: write a claim, detail and reason. Scaffold: “Nila might ___; the detail ___ suggests this because ___.” Extension: give two possible explanations and say what further evidence would distinguish them. All routes still require a justified, tentative inference."
    },
    {
      "heading": "Choose support that does not reveal the answer",
      "body": "A word bank, chunked directions, enlarged text or an oral response can reduce an access barrier. Giving the conclusion before asking for it may remove the thinking you wanted to assess. Match the support to the objective: an oral answer can show conceptual reasoning but may not demonstrate a targeted writing skill.",
      "example": "A diagram of two equal blank rectangles supports a fraction comparison. Pre-shading and labelling “1/2 is bigger” supplies the conclusion; decide whether that belongs in teaching or in the independent check."
    },
    {
      "heading": "Review translations for meaning",
      "body": "A bilingual glossary can support access if a competent reviewer checks subject meaning and natural wording. Machine translation is a draft. Preserve qualifiers, symbols and key distinctions; do not replace a technical term with a familiar word that changes the concept.",
      "example": "Mark an unreviewed glossary “draft for language review”. If no reviewer is available, keep the verified language version and another access support rather than claiming the translation is ready."
    },
    {
      "heading": "Check and reflect",
      "body": "Record the barrier, adaptation, unchanged objective and review needed for each version. Success means each learner still has an opportunity to demonstrate the core reasoning. Reflect: when would you fade the scaffold, and what independent response would tell you it is no longer needed?",
      "example": "After a learner can connect a detail to an inference with the sentence frame, try a different short passage without the frame and compare the reasoning."
    }
  ],
  "prompt-laboratory": [
    {
      "heading": "Two different things are being evaluated",
      "body": "The CRAFT lab reviews your task description and prompt for useful structure. It does not run the proposed classroom lesson or verify every future response. Its rule-based fallback checks explicit features and can miss meaning. Separate a prompt score from the quality of an actual lesson draft.",
      "example": "A prompt can mention “Class 5”, “table” and “20 minutes” and still ask for unsuitable content. Record the feedback mode shown and review whether each suggestion serves your task."
    },
    {
      "heading": "Define the comparison before changing the prompt",
      "body": "Choose one non-sensitive task and a fixed source. Write criteria for accuracy, objective alignment, feasibility and clarity. Keep the tool and task as consistent as possible, then change one meaningful element at a time. This makes differences easier to interpret; one comparison cannot prove the change caused every difference.",
      "example": "Baseline: “Create fraction questions.” Revision 1 adds Class 5 and a comparison objective. Revision 2 adds equal-whole conditions and an answer-explanation format. Do not simultaneously change to a different subject and claim that context alone improved the result."
    },
    {
      "heading": "Keep an honest run log",
      "body": "For each version keep the prompt, changed element, feedback mode, observed result, review and next decision. Use the sandbox for prompt feedback. If you also run the prompt in an approved generation tool, save that actual output and tool/date separately. Without generation access, use an explicitly labelled prediction and the worked example; do not record it as an observed result.",
      "example": "Teacher-authored comparison: V1 may omit equal wholes; V2 explicitly requires them. That is a predicted effect until a real response is inspected. An observed failure would quote the actual instruction that used unequal wholes."
    },
    {
      "heading": "Score with reasons and repeat",
      "body": "For each criterion use 0 = not met, 1 = partly met, 2 = met, and add a short reason. Treat this as a local comparison aid, not a calibrated measure of teaching quality. Repeat the strongest prompt if a generation service is available and inspect whether the important condition survives.",
      "example": "Accuracy 0: answer key says 1/3 is larger than 1/2 of the same whole. Alignment 2: asks for comparison reasoning. Correct the error despite the alignment score; an average must not hide a substantive mistake."
    },
    {
      "heading": "Check and reflect",
      "body": "Keep a baseline and two revisions; compare at least two sandbox attempts. Success means you can link a revision to a specific need and distinguish tested behavior from a prediction. Reflect: which remaining weakness needs a source check or teacher edit rather than another prompt adjective?",
      "example": "“The structure score rose, but I still need to verify the answer key” is a defensible conclusion. “The prompt scored highly, so the worksheet is accurate” is not."
    }
  ],
  "teaching-prompt-library": [
    {
      "heading": "Save a procedure, not just a successful sentence",
      "body": "A useful template tells the next teacher its purpose, required inputs, expected output and review steps. Keep stable instructions separate from fields that change. Reuse only for the job you actually tested; a good fractions template is not automatically a good history template.",
      "example": "Fields: [class], [objective], [prior knowledge], [time/materials], [approved source], [output format]. Say which fields are required and ask for a missing essential field instead of silently filling it."
    },
    {
      "heading": "Worked example: an exit-ticket template",
      "body": "Use the example as a starting point, then complete every field for a familiar lesson. Add a reviewed example and an observed limit. Do not describe a polished but untried prompt as tested.",
      "example": "“Support a [class/subject] teacher. From [source], draft three exit questions for [objective], using [prior knowledge] and taking [minutes]. Return questions, separate answers, reasoning and source locations. Include one explanation item. If the source cannot support an answer, flag the gap. List checks for the teacher.”"
    },
    {
      "heading": "Test transfer before widening its purpose",
      "body": "Use the stable instructions on a meaningfully different topic. Record what you changed, what failed and whether the output still meets the criteria. If the template requires extensive rewriting, narrow its stated purpose or revise the reusable procedure.",
      "example": "Fractions to a short story exposes a hidden assumption if every answer is still numeric. Repair “give a numerical answer” to “give an answer or defensible response criteria appropriate to the task”, then retest the original fractions case."
    },
    {
      "heading": "Make a small library maintainable",
      "body": "Create three entries: planning; assessment or feedback; communication or adaptation. Include the filled example, tool/date if tested, an observed limitation or clearly predicted risk, required review and a version note. If every sampled output passed, say so and identify a boundary not yet tested. A guided review may examine the prompt without AI access; label its risks as predictions. Save fictional data only. Keep a previous version if an instruction change needs comparison, and retire a version that repeatedly misleads.",
      "example": "A parent-notice template keeps date and venue as required inputs. Known limit: it may invent missing arrangements. Review: match every logistical detail with the approved notice before sending through the normal school process."
    },
    {
      "heading": "Check and reflect",
      "body": "Work in two sessions: complete and test one entry, then adapt the method to the other two. Success means a colleague can fill the fields and knows what to verify without your explanation. Reflect: which promise would you remove from the template’s description because your evidence does not support it?",
      "example": "Prefer “tested on two fictional Class 5 fraction activities; check equal wholes and each answer” to “works for every classroom”."
    }
  ]
};
