# AI Credential and Prompt Data Handling

## Current decision

Module 1 does not need AI. Module 2 prompt practice uses one restricted server-side Gemini credential for the controlled prototype. Participants do not enter, view or store an API key.

The server reads `GEMINI_API_KEY` only from the deployment environment. The variable must never use a `NEXT_PUBLIC_` prefix and must never appear in source control, screenshots, Jira, logs or support messages.

## Prompt data flow

1. The browser sends the selected scenario and prompt text only after the participant selects **Score my CRAFT prompt**.
2. The server validates the scenario, prompt length and request rate.
3. Gemini returns a structured evaluation with five 0–3 dimension scores.
4. PromptShala validates the response and calculates the total itself.
5. If the evaluator fails, PromptShala returns the deterministic CRAFT fallback.
6. For an authenticated participant, Supabase receives only a SHA-256 prompt fingerprint, scores, model/source and safety flags. Raw prompt text is not persisted.

## Required communication

Display these points before live AI practice:

> Do not enter student names, marks, contact details or confidential school information. Your prompt is sent for evaluation only when you select Score. PromptShala does not store the raw prompt. Always review AI-assisted feedback and classroom drafts.

## Security controls

- Keep provider calls in server-only code.
- Limit prompts to 2,500 characters and throttle repeated requests.
- Validate model output against the expected CRAFT structure.
- Calculate totals in application code rather than trusting a model-supplied total.
- Keep the fallback available when the provider times out or returns invalid output.
- Store no raw prompt, generated answer or evaluator credential in Supabase.
- Rotate the pilot credential if it appears outside the approved environment.

## Before external pilot use

- move the in-memory rate limit to shared infrastructure;
- verify prompt-retention settings and provider terms;
- execute two-participant RLS isolation tests;
- add production monitoring that excludes prompt text; and
- approve privacy and acceptable-use wording with the client.
