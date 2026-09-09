# Module 1 Test Report — Client Review Build

**Build date:** 9 September 2026  
**Scope:** Module 1 participant journey, early Module 2 CRAFT practice, Supabase foundation  
**Environment:** Local Next.js build with connected Supabase project and private server evaluator configuration

## Result summary

| Area | Result | Evidence |
|---|---|---|
| Automated tests | Pass | Authorization, local and server state sanitization, progress and unlocking, quiz scoring, CRAFT rules, AI response normalization and responsive CSS contracts |
| TypeScript | Pass | `pnpm typecheck` |
| Desktop participant journey | Pass | Guided demo, onboarding, dashboard, lessons, failed quiz, retry, pass and Module 2 unlock |
| Mobile responsive smoke test | Pass | 390 × 844 dashboard and Module 2 layouts without horizontal clipping |
| CRAFT evaluator | Pass | Weak prompt and strong prompt both returned structured five-dimension Gemini evaluations |
| CRAFT fallback contract | Pass | Deterministic five-dimension response remains available without the provider |
| Supabase provisioning | Pass | Three migrations applied, four modules seeded and twelve public tables protected by RLS |
| Real authenticated participant journey | Pending | No disposable pilot participant account has completed the full flow yet |
| External staging URL | Pending | Vercel project and isolated staging environment still require deployment |

## Acceptance rules verified

- Protected participant routes require a Supabase session or the explicit presentation-demo cookie.
- Safe-use acknowledgement gates onboarding.
- Three required lessons gate the Module 1 quiz.
- Three of five answers fails at 60%; four of five passes at 80%.
- Retry remains available after failure and a lower later attempt cannot reduce the best score.
- Passing Module 1 unlocks Module 2.
- CRAFT totals are calculated from normalized 0–3 dimension scores.
- Invalid scenarios and prompts outside the 3 to 2,500 character limit are rejected.
- Feedback uses text and icons rather than colour alone.
- Raw CRAFT prompt text is excluded from the persistence schema.

## Remaining pilot tests

1. Complete the full journey with two disposable participant accounts.
2. Prove participant-to-participant RLS isolation and administrator separation.
3. Run keyboard-only, 200% zoom and automated accessibility checks.
4. Exercise AI timeout, malformed output, rate-limit and provider-unavailable states in a browser test.
5. Run the production smoke test on the stable staging URL.
6. Validate final lesson media, transcript and attribution with the client.

## Release recommendation

Suitable for the 10 September assessment presentation as a controlled demonstration build. Do not invite the 10-user pilot until authenticated isolation, staging, accessibility and privacy acceptance tests pass.
