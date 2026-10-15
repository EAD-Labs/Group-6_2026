# PromptShala HLD v1.3 Change Record

**Historical 8-9 September record retained below. Consolidation note: 14 October 2026.** Later authorised changes supersede prerequisite locking, fingerprint-only CRAFT history and the original 15 October presentation milestone. All modules are open; completion is assessed separately. The October client approved immediate signup, optional tab-memory personal keys, private full CRAFT prompt/history and simplified teacher wording. The course announcement now requires A0 poster submission on **20 October** and presentation on **23 October, 9:30 AM-12:00 PM**, reporting **9:15 AM**, LA-LHC Complex Foyer. The HLD study window remains 16 October-6 November. Preserve the earlier signatures as historical records; consolidated acceptance of the final version must be recorded by a real reviewer using the [client packet](../final/CLIENT_REVIEW_AND_DECISIONS.md).

**Decision date:** 8 September 2026  
**Implementation evidence updated:** 9 September 2026  
**Schedule authority:** HLD v1.3 Section 17.4  
**Approval history:** The signed Version 1.1 page remains the final page of the revised HLD.

## Controlled changes

1. **CRAFT selected:** PromptShala uses Context, Role, Action, Format and Target for prompt practice.
2. **Teacher safeguards retained:** Privacy, factual verification, suitability and teacher review apply to every prompt and classroom draft.
3. **AI-assisted feedback added:** A server-side evaluator scores each CRAFT dimension from 0 to 3 and calculates a total out of 15.
4. **Safe fallback retained:** If the evaluator is unavailable, the same screen returns a transparent deterministic CRAFT structure check.
5. **Prompt privacy tightened:** The browser never receives the evaluator key. Authenticated history stores only a one-way prompt fingerprint, scores, source and safety flags.
6. **Five teacher scenarios retained:** Concept explanation, quiz creation, lesson planning, parent communication, and worksheet or slide creation.
7. **Schedule unchanged:** Module 1A remains due 13 September, Module 1B remains due 20 September, Module 2A remains due 27 September, and the complete project presentation remains due 15 October.

## Implementation status at 9 September

| HLD delivery item | Status | Evidence |
|---|---|---|
| Module 1A access and learning shell | Implemented in the client review build | Sign-in, safe-use onboarding, teacher profile, goals, dashboard, lesson and transcript shell, saved progress, loading and locked states, desktop and mobile layouts |
| Module 1B assessment and progress | Implemented early in the client review build | Five-question quiz, exact multi-select scoring, explanations, retry flow, 70% gate, best-score retention and Module 2 unlock |
| Module 2A CRAFT practice | Working vertical slice | Five teacher scenarios, 0–3 scores for every CRAFT dimension, 15-point total, revision comparison, safety flags and deterministic fallback |
| Supabase foundation | Provisioned | Three migrations applied, four modules seeded, twelve public tables protected by RLS, participant-state API added |
| External staging and pilot accounts | Pending | Stable Vercel staging URL, two-participant isolation test and real participant journey still require execution |

## Review request

The next client review should validate the CRAFT wording, first scenario order, Module 1 lesson language, privacy copy, pilot subjects and language preferences. Record each requested change in Jira before changing the HLD baseline.
