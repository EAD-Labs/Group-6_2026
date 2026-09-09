# Supabase Provisioning Evidence

**Verified:** 9 September 2026  
**Project reference:** `atqbligrqsderauzfrqi`  
**Region:** Southeast Asia

## Applied migrations

1. `202609030001_module_1_foundation.sql`
2. `202609080001_participant_profile_and_pathway.sql`
3. `202609090001_authenticated_progress_and_craft.sql`

## Verification result

| Check | Result |
|---|---|
| Seeded learning modules | 4 |
| Seeded Module 1 lessons | 3 |
| Seeded Module 1 quizzes | 1 |
| Public tables with RLS enabled | 12 |
| `craft_prompt_attempts` available | Yes |
| Anonymous content-table read | Denied |
| Unauthenticated participant-state API | `401 unauthenticated` |

The application health route reports both Supabase and the AI evaluator as configured when the local private environment is loaded.

## Remaining evidence before staging acceptance

- create two disposable participant accounts and one administrator;
- verify participant A cannot read participant B records;
- complete sign-in, onboarding, lesson, quiz and refresh persistence with a real session;
- verify administrator permissions separately;
- deploy the same migrations to an isolated staging project; and
- attach the staging URL and test report to Jira.

No secret, publishable key or participant data belongs in this evidence file.
