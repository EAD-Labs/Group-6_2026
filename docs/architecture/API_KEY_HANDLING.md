# Participant API-Key Handling

## Decision

Module 1 does not require an AI API key. If the client approves live AI feedback for a later module, the participant enters their own Gemini API key on `/settings/api-key` immediately before the AI practice activity.

For the prototype, the key is stored only in browser `sessionStorage` under `promptshala:gemini-api-key`. It is not written to Supabase, application logs, analytics, cookies, local storage, source control, or support tooling. The participant can remove it at any time, and the browser clears it when the tab session ends.

## Required communication

Display this notice before the input:

> Your key is not saved to your PromptShala account. It stays in this browser tab session only and is cleared when the tab session ends or when you choose Remove key. Never share it in a lesson, screenshot, support message, or classroom prompt.

After saving, display only `A key is available for this tab session.` Never display the full key again.

## Implementation boundaries

- Render the input as a password field with autocomplete disabled.
- Never add a `GEMINI_API_KEY` participant value to `.env`, Supabase tables, or server logs.
- Never send the key to PromptShala analytics or error-reporting services.
- Redact common API-key patterns from client and server error messages.
- Do not include the key in a URL, query parameter, form action, screenshot, or exported learning record.
- Clear the value after use and provide an explicit Remove key action.
- A production implementation must confirm whether direct browser-to-provider use is permitted and secure. Until then, live API calls remain disabled.

## Client approval required

Before enabling an API call, confirm:

1. whether the pilot uses deterministic rubric checks, participant-owned keys, or both;
2. the approved provider, endpoint, model, and data-processing terms;
3. whether browser-direct requests are acceptable;
4. how key redaction and network-error handling will be tested; and
5. what non-sensitive prompt data may leave the PromptShala application.

