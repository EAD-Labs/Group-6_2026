# AI CRAFT Evaluation

## Purpose

The evaluator helps a beginner teacher improve a prompt before using it with an AI tool. It scores the prompt itself rather than generating classroom content.

## Request contract

`POST /api/craft/evaluate`

```json
{
  "scenarioId": "concept",
  "prompt": "Explain photosynthesis."
}
```

The route accepts one of the five registered teacher scenarios and a prompt between 3 and 2,500 characters. It permits 12 requests per client address in a one-minute local window.

## CRAFT rubric

Each dimension receives 0 to 3 points:

| Score | Meaning |
|---|---|
| 0 | Missing |
| 1 | Present but vague |
| 2 | Usable with an important detail missing |
| 3 | Specific, relevant and easy for a teacher to review |

The application calculates the 15-point total and percentage from the normalized dimension scores. It never trusts a model-supplied total.

## Model configuration

- provider: Google Gemini Interactions API;
- default model: `gemini-3.5-flash`;
- thinking level: minimal;
- response: structured JSON;
- response limit: 1,000 tokens;
- request timeout: 25 seconds; and
- temperature: 0.1.

The model and secret can change through server environment variables without changing the participant interface.

## Failure path

Invalid or unavailable model output triggers `createRuleBasedCraftEvaluation`. The response clearly identifies `rule-based` as the source and explains that the fallback checks visible CRAFT signals rather than nuance or factual correctness.

## Data handling

The browser receives scores, feedback, suggestions and safety flags. It never receives the provider credential. For an authenticated participant, the server stores only a SHA-256 prompt fingerprint, dimension scores, total, evaluator source, model name and safety flags.

## Known pilot limits

- The rate ledger is process-local and must move to shared infrastructure before broad deployment.
- Prompt retention and provider processing terms require client approval before the 10-user pilot.
- The evaluator needs browser end-to-end tests for timeout, malformed output and rate-limit messages.
