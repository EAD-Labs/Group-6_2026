# PromptShala Assessment Runbook

**Date:** 10 September 2026  
**Presentation limit:** 5 minutes  
**Target finish:** 4 minutes 35 seconds

## Ten minutes before

1. Run `pnpm check` and `pnpm build`.
2. Start the app and verify `/api/health`.
3. Open the deck in PowerPoint and keep the app open at `/learn/module-2/practice`.
4. Use the prepared guided-demo state rather than completing onboarding live.
5. Keep Jira, GitHub and the HLD open only for Q&A.
6. Never show environment variables or the provider credential.

## Five-minute delivery

| Time | Slide | Speaker | Purpose |
|---|---|---|---|
| 0:00–0:20 | 1 | Darshan | Purpose and review scope |
| 0:20–0:55 | 2 | Vishal | Persona, wireframes and accessibility |
| 0:55–1:50 | 3 | Darshan | Working participant journey |
| 1:50–2:45 | 4 | Ashok | Live CRAFT scoring and privacy |
| 2:45–3:25 | 5 | Raghuram | Supabase, tests and honest boundary |
| 3:25–4:05 | 6 | Vishal | Evidence and equal workstream ownership |
| 4:05–4:35 | 7 | Raghuram | Next milestone and decisions |
| 4:35–5:00 | Buffer | Team | One interruption or handover buffer |

## Optional 30-second live proof

Use this only if the assessor asks for a live demo.

1. Open the CRAFT lab with **Explain photosynthesis.**
2. Select **Score my CRAFT prompt** and show the 1/15 result.
3. Select **Load strong example**, score again and show 15/15.
4. Point to one dimension suggestion and the evaluator source.

## Q&A facts

- Audience: beginner school teachers and educators.
- Pilot size: 10 participants.
- Framework: CRAFT, confirmed as the product baseline.
- Module 1 pass rule: 70%.
- AI boundary: server-only key, no raw prompt persistence, deterministic fallback.
- Supabase status: schema provisioned and RLS enabled; multi-user staging evidence pending.
- Final presentation date: 15 October 2026.

## Avoid these claims

- Do not say the 10-user pilot has started.
- Do not say real multi-user persistence is accepted.
- Do not claim equal GitHub authorship when one authenticated account created the commits.
- Do not show or read the API key.
- Do not present Modules 3 and 4 as implemented.
