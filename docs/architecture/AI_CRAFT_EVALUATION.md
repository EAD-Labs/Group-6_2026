# AI CRAFT evaluation

`POST /api/craft/evaluate` accepts `{ task, prompt, suggestionId? }`. A task must contain 3–300 characters and a prompt 3–2,500. `suggestionId`, when present, must name a registered example. Unknown examples and oversized or malformed bodies are rejected.

The guided demo always uses deterministic CRAFT scoring and sends no prompt to the provider. Live evaluation requires a verified participant, a saved safe-use acceptance and a configured server Gemini key. Anonymous requests receive 401 and missing consent receives 403. Provider credentials remain server-only.

A shared PostgreSQL request window limits each account to 12 CRAFT requests per minute, across application instances. Quota-service failure prevents a paid provider call and returns the transparent fallback; a consumed quota returns 429 with Retry-After. Assistant testing separately permits six requests per minute and is unavailable in presentation-demo mode.

Gemini Interactions receives the task and prompt only, with a structured JSON schema, 1,000-token limit, temperature 0.1 and 25-second timeout. The configured model defaults to `gemini-3.5-flash`. The server rejects missing/duplicate dimensions, noninteger or out-of-range scores and malformed response lists. It calculates the 15-point total itself. Any provider or validation failure returns deterministic dimension feedback and a clear fallback explanation while the browser retains the draft.

Authenticated evaluation analytics contain task/prompt SHA-256 fingerprints, five dimension scores, total, model/source and safety flags. They do not store the submitted CRAFT draft. Participant-saved prompt templates, assistant examples and generated practice outputs are distinct private learning artifacts with their own retention disclosure; see `API_KEY_HANDLING.md`.

Provider processing terms, approved configuration and a real authenticated quota/timeout test remain part of deployment acceptance. Unit/API tests exercise anonymous and consent rejection, demo isolation, provider failure, malformed model output and shared-limit failure without calling a live paid provider.
