# AI Credential and Prompt Data Handling

## Optional personal Gemini connection

Participants can add their own Gemini API key at `/settings/api-key`. The course's `GEMINI_API_KEY` remains the default when configured. Module 1 and the checklist/source-based fallbacks do not require an AI key.

A personal key stays in React memory in the current open tab. It is never written to localStorage, sessionStorage, cookies, the participant state or Supabase. Refreshing, signing out, or changing the signed-in participant removes it. The input is masked and clears immediately after connecting. The setting means the key is ready for the next request, not that Google has validated it.

CRAFT checks, assistant tests and optional source transformations send the personal key in the `x-promptshala-gemini-key` request header. The same-origin server route verifies the signed-in identity, saved safe-use acknowledgement, input limits and shared account rate budget before forwarding the credential to Google's fixed Gemini endpoint. A supplied personal key takes precedence over the deployment key. Provider errors use generic user-facing recovery text and never include the key or Google's private error payload.

The deployment credential reads `GEMINI_API_KEY` only on the server and must never have a `NEXT_PUBLIC_` prefix. Neither credential belongs in source control, screenshots, logs, support messages, or analytics. Google's account limits and any usage charges apply to a participant's personal key.

## Submitted CRAFT prompts

1. The browser sends a task and prompt only when the participant chooses **Check my prompt**.
2. The server validates both fields and chooses live Gemini feedback when an AI connection is available; otherwise it uses the course's transparent CRAFT checklist.
3. The validated task text, prompt text and feedback are saved to `craft_prompt_attempts`, together with fingerprints, scores, source/model and safety flags, under the authenticated participant's ID.
4. The response reports `saved: true` only when the database confirms the write. When saving fails, feedback remains usable and the interface says that the prompt was not saved to the account.
5. `/api/craft/history` returns the account's 20 most recent saved prompts for viewing and reuse. Owner-only row-level security excludes other participants and staff. Only the trusted server can insert checked records.
6. Account export includes every saved CRAFT record, and account deletion removes these records through the existing foreign-key cascade. Device drafts remain separately clearable in the profile.

Old fingerprint-only history retains null text. The new migration does not recreate previously submitted prompts.

## Privacy communication

Before a check, participants see that the task, prompt and feedback will be saved privately. They must use fictional examples and keep student names, marks, contact details and confidential school information out of the tools. Every AI-assisted classroom result needs teacher review. Saved learning-record retention beyond the pilot remains governed by the programme's declared policy; resources and activity events keep their existing expiry schedules.

## Service setup and validation

Apply `202610100002_private_craft_prompts.sql` before enabling the updated prompt practice against a live database. No production migration is executed by the redesign task. Without that schema, a check still returns feedback and clearly reports that account saving failed; history/export report service unavailability.

The existing shared `consume_ai_rate_limit` service remains enforced for both course keys and personal keys. Automated tests cover in-memory key removal, key overriding and validation, database save failure reporting, owner/staff isolation, server-only writes, retrieval/export and account-deletion cascades. Verify the deployed TLS connection, provider retention policy, database migration and two-account behavior before inviting a cohort.
