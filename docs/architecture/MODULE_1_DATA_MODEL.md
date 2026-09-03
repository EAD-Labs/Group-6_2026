# Module 1 Data Model

## Scope

The first migration defines the minimum entities needed for invitation-only participants, published Module 1 content, lesson completion, quiz attempts, feedback, and sequential unlocking. PostgreSQL in Supabase is the system of record.

## Entities

| Entity | Purpose | Important relationships |
|---|---|---|
| `profiles` | Application identity, display name, onboarding completion, and role | One-to-one with `auth.users` |
| `learning_modules` | Module metadata, order, publication state, duration, and pass threshold | Has many lessons; has one quiz; has many progress rows |
| `lessons` | Ordered learning units within a module | Belongs to a module; has many participant progress rows |
| `quizzes` | One module-level knowledge check | Belongs to one module; has many questions and attempts |
| `quiz_questions` | Ordered single- or multiple-choice prompts | Belongs to a quiz; has options and one answer key |
| `quiz_options` | Participant-visible answer choices | Belongs to one question; contains no correctness flag |
| `quiz_answer_keys` | Correct option IDs and post-submission explanation | Kept separate from participant-visible options |
| `module_progress` | Current status, best score, and timestamps for one participant/module | Composite key on participant and module |
| `lesson_progress` | Start and completion timestamps for one participant/lesson | Composite key on participant and lesson |
| `quiz_attempts` | Immutable scored submission and attempt number | Belongs to participant and quiz |
| `quiz_responses` | Immutable selected options and grading result by question | Belongs to an attempt and question |

## Security boundaries

- Every exposed table has Row Level Security enabled.
- Participants can read only their own profile, progress, attempts, and responses.
- Participants can read only published modules, lessons, quizzes, questions, and options.
- Answer keys are not granted to participants and have an admin-only policy.
- Participant-facing tables do not expose `is_correct` on quiz options.
- Progress and attempt writes are intentionally not granted directly to browser clients. A reviewed server-side grading function or server route must perform validated writes.
- Column-level update privileges allow participants to change only display name and onboarding completion, not role.
- Admin status is checked through the security-definer `is_admin()` helper to avoid recursive profile policies.

## Migration

The schema and initial Module 1 lesson records are in `supabase/migrations/202609030001_module_1_foundation.sql`.

The migration seeds only module and lesson metadata. Quiz questions remain in the reviewed content bank until an import script and server-side grading path are approved.

## Deferred entities

- reusable assistant specifications;
- prompt submissions and rubric feedback;
- teacher-owned source metadata;
- certificates;
- content versions and publishing audit log;
- aggregate pilot reports.

