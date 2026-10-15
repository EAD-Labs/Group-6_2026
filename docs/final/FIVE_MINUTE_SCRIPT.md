# Five-minute poster and application explanation

Use with the final deployed version and actual evidence register. The clock is a speaking guide, not a measured demonstration result. Team: Group 6, PromptShala; client: Centre for Educational Technology, IIT Bombay.

## 0:00-0:40 - Problem and client requirements

"PromptShala helps teachers move from hearing about AI to using it responsibly in a classroom task. The client asked for four self-paced modules, guided practice, progress and evidence of completion. The problem is that a tool can produce an answer quickly while the teacher still has to judge its accuracy, learner fit and safe use. We designed the experience around that judgement."

Point to poster section 01; name one concrete classroom task rather than listing every feature.

## 0:40-1:15 - Learners and design choices

"Our primary persona is Meera, a beginner teacher of Classes 5-10 with limited technical confidence and short learning windows. She may use a phone or a shared laptop. That led to familiar teaching language, short guided steps, editable examples, clear next actions and private account records. The course is open to explore; completion is assessed separately."

Point to section 02. Explain that a persona is a design assumption, not a participant whose outcomes have been measured.

## 1:15-2:35 - Working visitor experience

"You can scan the QR and try this independently without an account. Start with 'Explain evaporation.' Our CRAFT checklist asks whether the request describes context, role, action, format and target. Compare it with the clearer example: the teacher specifies the class, duration, output and evidence boundary. The score is feedback on request structure, not a guarantee that AI will be right."

Check both prompts; move to the source draft.

"Now we prepare a worksheet scaffold from fictional teaching notes. The passages are numbered so the teacher can compare claims with the source. We can edit it, then review the purpose, sources, learner fit, accessibility and privacy before classroom use. This public path is local; it sends no content to AI and saves no course progress."

Show one source label and one specific evidence rating. Keep typing short; pre-open a fictional example if needed and clearly label it prepared.

## 2:35-3:15 - Pedagogy and client iteration

"The learning cycle is explain, practise, receive feedback, revise and transfer to a new task. Lessons and quizzes provide formative checks; helper repair/retests and source audits make judgement visible. The client then asked for simpler language, questions about existing AI use, personal Gemini keys and saved crafted requests. We incorporated each of those. Keys remain in the open tab; private prompt history can be exported or deleted."

Point to the feedback-to-change rows. Do not state that all users found it easy: that is a research question.

## 3:15-4:10 - Technical scope and generalisation

"The full course has four modules, 29 lessons and 75 questions. Authenticated progress and quizzes are validated on the server, with account permissions around private work. Next.js serves the interface, Supabase manages identity and data, and Gemini is optional for live operations. Tests cover scoring, permissions, state and provider failures; browser checks support the public visitor path."

"We also expanded beyond one client with Teaching Review Lab. A subject team can import its own versioned rubric, compare an original and revised resource, record evidence and export the review. It can support other subjects and teacher-development programmes. A human rating is still a judgement, not automatic fact verification."

Show the rubric import/export or a prepared, clearly labelled sample. Cite the current verified counts from the register; do not quote a stale count after further changes.

## 4:10-5:00 - Honest status and implementation plan

"The working core and development tests are available. Client UAT, operational recovery checks and complete accessibility/performance acceptance are recorded separately. The ten-teacher study is scheduled for 16 October-6 November; we will report genuine task completion, assistance, recurring errors and prompt/source-review evidence. We are not claiming learning gains or time saved before collecting those observations."

"Our next implementation decisions are approved curriculum, provider operations, retention and ownership. The poster and review packet show what is implemented, what was tested and what still needs a client decision. Please try the learner path and tell us where the next action or evidence check is unclear."

Update this paragraph on 23 October with actual study status and confirmed operational outcomes.

## Likely questions and concise answers

| Question | Evidence-led answer |
| --- | --- |
| Why another AI tool? | The educational value is guided practice, revision, evidence checking and accountable teacher review around a classroom task. |
| What is actually AI-powered? | Authenticated optional CRAFT evaluation, helper tests and source transformation. The public try-out uses transparent local checklist/scaffold methods. Demonstrate only the configured live paths that were verified. |
| Why not lock later modules? | The client approved open exploration; server-checked completion still requires recorded lesson, quiz and applicable practical evidence. |
| How is privacy handled? | Account-scoped private work, server role checks, keys held in tab memory, no pupil data needed, clear source-expiry/export/deletion boundaries. Provider/backups have separate retention. |
| How do you prove learning? | Versioned task/revision evidence supports assessment; the exploratory study observes independent use and project-created pre/post rubric evidence. It cannot establish causal effectiveness alone. |
| How does it scale? | Portable rubric/course patterns and cohort roles support adaptation. Hosted workload tests and operational ownership must be verified before claiming scale. |
