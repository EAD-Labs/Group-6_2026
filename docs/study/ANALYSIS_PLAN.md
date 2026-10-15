# Analysis plan and blank-data codebook

Prepared before collection, 14 October 2026. This is an exploratory usability and task-evidence pilot of ten beginner educators, with no control group. It cannot support population-wide or causal learning-effect claims.

## Questions

1. Which core tasks can teachers complete independently, and where do they need help?
2. Can they improve a classroom request and explain the change?
3. Can they identify and correct an unsupported draft claim using supplied passages?
4. Which interface, access and conceptual difficulties recur?
5. What conditions support returning to the self-paced course?

## Files and values

Copy blank CSVs to approved restricted storage before data entry. Keep any identity key/consent/recordings outside the analysis files and repository.

| File | Key fields and interpretation |
| --- | --- |
| `participants.csv` | P01-P10; status (invited/consented/started/returned/completed/withdrew/declined); dates and minimal context. Blank is unknown/unrecorded. |
| `task-observations.csv` | One observed task per row; actual start/end/duration, result, help code, interruption, device/release and redacted issue. |
| `rubric-ratings.csv` | One task/dimension/rater row; score 0/1/2 or blank with `not_observed` reason; first rating preserved; agreed scores separately. |
| `themes.csv` | De-identified observation/quotation permission, proposed code/theme, source-task reference and analyst interpretation. |

Identifiers: participant P01-P10; session B (baseline), X (exit), S1 etc (self-paced); tasks A/B/L1/C1/S1/R1/H1; rater R1/R2. Avoid name/email/device serial numbers and exact private school details. A date may be reduced to study day in a public report if distinctive.

## Descriptive summaries

- Report recruitment denominators: invited, eligible, consented, started, returned, completed, withdrew and missing observations. Never use only completers as the unlabelled denominator.
- For each task, give observed n, independent n, helped n and incomplete/declined n. State the denominator beside every percentage; with n=10, counts are often clearer.
- For successfully timed tasks, report median and range or interquartile range, with n. Report incomplete/technical-interruption counts separately; do not assign a favourable time to a failed task.
- Report types/frequency of assistance and recurring interface versus conceptual errors. Keep participant counts distinct from repeated event counts.
- For matched baseline/exit tasks, report each dimension and total change only when all relevant ratings exist. Give matched n and missing reasons. Include task order, prior experience and unequal help. Do not impute missing outcomes as success or zero.
- For double-rated records, report exact per-dimension agreement and disagreements with the number double-rated. This small review does not establish psychometric reliability.
- Summarise actual course return/completion and recorded requirements descriptively. Certificate completion is not proof of teaching effectiveness.

No significance testing or causal attribution is planned for this small sample. If the design changes, document why and which analyses changed before presenting results.

## Qualitative method

Two team members read de-identified notes, independently propose codes for several records, discuss differences and keep a codebook. Suggested initial codes: next-step clarity, source evidence, learner adaptation, terminology, save/recovery, device/access, privacy understanding, return motivation. Add emergent codes with definitions and examples.

Count how many participants express/experience a theme, not how often one person repeats it. Keep observed facts, participant statements and analyst interpretations in separate columns. Retain contradictory cases. Use direct quotations only with permission and remove identifiable context. A quoted opinion about usefulness is not an objective outcome.

## From findings to action

| Finding | Evidence/denominator | Educational or usability consequence | Proposed change | Priority/owner | Retest and client decision |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

Prioritise data/privacy failures and blocked primary tasks first, then recurring confusion and conceptual weaknesses. Reobserve corrected tasks with permission; a code fix alone does not prove the confusion resolved.

## Final report structure

Actual dates/release/context; participants and consent; method/deviations; task results with denominators; paired rubric evidence and missing data; recurring themes/negative cases; defects and revisions; limitations; deployment/support recommendations; client disposition.

State that this is a small, volunteer, potentially assisted sample with a project-created rubric and short observation window. Account for practice and non-equivalent parallel tasks. If the 23 October poster precedes completion, label any observations **preliminary as of [date], n=[actual]**. Until genuine collection occurs, say **study preparation complete; results not yet collected**.

## Data-quality and release checklist

[ ] Consent/restrictions reconciled before analysis.

[ ] Dates, task IDs, duplicate rows and missing reasons checked.

[ ] First and agreed ratings retained separately.

[ ] Withdrawal requests applied before the stated cut-off.

[ ] Public material de-identified; quotes permitted.

[ ] Every result includes denominator and limits.

[ ] No fabricated participant rows/outcomes or retroactive consent.

[ ] Client reviews recommendations; actual retention/deletion dates recorded.
