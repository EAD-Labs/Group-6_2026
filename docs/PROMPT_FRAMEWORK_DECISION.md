# Prompt Framework Decision

## Decision

PromptShala uses **CRAFT: Context, Role, Action, Format and Target** as the initial prompt-construction framework. The Student Team confirmed this implementation baseline on 8 September 2026.

## Implemented learning loop

1. The teacher selects one of five classroom scenarios.
2. The teacher writes or revises a prompt.
3. A server-side evaluator scores every CRAFT dimension from 0 to 3.
4. PromptShala calculates the total out of 15 and shows evidence, feedback and one concrete suggestion per dimension.
5. The teacher compares attempts and improves the prompt.
6. A deterministic CRAFT check supplies feedback if the evaluator is unavailable.

The rubric evaluates prompt quality and completeness. It does not certify the factual correctness, pedagogical suitability or safety of an AI-generated answer.

## Safeguards

- The evaluator key stays on the server.
- PromptShala does not store raw prompt text.
- Authenticated history stores a one-way fingerprint, rubric scores, source and safety flags.
- Teachers must verify facts, curriculum fit, privacy, copyright and learner suitability.

## Client review focus

Ramkumar Rajendran and Aditya Narayan Rajmane should confirm that the five labels are understandable to beginner school teachers and approve the first three pilot scenarios. Terminology remains configurable without changing the learning flow.
