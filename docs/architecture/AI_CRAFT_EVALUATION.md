# AI CRAFT evaluation

`POST /api/craft/evaluate` accepts `{ task, prompt, suggestionId? }`. A task must contain 3–300 characters and a prompt 3–2,500. `suggestionId`, when present, must name a registered example. Unknown examples and oversized or malformed bodies are rejected.

The guided demo always uses deterministic CRAFT scoring and sends no prompt to the provider. Live evaluation requires a verified participant, a saved safe-use acceptance and either the configured course Gemini key or an optional personal key provided for the current request. Anonymous requests receive 401 and missing consent receives 403. The course credential remains server-only; a personal key lives only in the current tab and is forwarded by the server without persistence.

A shared PostgreSQL request window limits each account to 12 CRAFT requests per minute, across application instances. Quota-service failure prevents a paid provider call and returns the transparent fallback; a consumed quota returns 429 with Retry-After. Assistant testing separately permits six requests per minute and is unavailable in presentation-demo mode.

Gemini Interactions receives the task and prompt only, with a structured JSON schema, 1,000-token limit, temperature 0.1 and 25-second timeout. The configured model defaults to `gemini-3.5-flash`. The server rejects missing/duplicate dimensions, noninteger or out-of-range scores and malformed response lists. It calculates the 15-point total itself. Any provider or validation failure returns deterministic dimension feedback and a clear fallback explanation while the browser retains the draft.

Checked CRAFT attempts contain the submitted task, prompt and validated feedback, plus SHA-256 fingerprints, five dimension scores, total, model/source and safety flags. They are private account records protected by owner-only row-level security, available for reuse and included in account export/deletion. Older attempts retain fingerprint-only history. See `API_KEY_HANDLING.md` for personal Gemini key handling and privacy disclosure.

Provider processing terms, approved configuration and a real authenticated quota/timeout test remain part of deployment acceptance. Unit/API tests exercise anonymous and consent rejection, demo isolation, provider failure, malformed model output and shared-limit failure without calling a live paid provider.
