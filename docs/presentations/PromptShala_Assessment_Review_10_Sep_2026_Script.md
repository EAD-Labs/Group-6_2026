# PromptShala Five-Minute Assessment Script

## Timing

The planned speaking time is 4 minutes 35 seconds. Keep 25 seconds for handovers or one short interruption.

## Slide 1: PromptShala

**Darshan, 20 seconds**

PromptShala helps beginner school teachers learn practical AI use through short activities and feedback. In five minutes we will show the teacher persona, the working participant journey, live CRAFT evaluation, engineering evidence and our next delivery target.

## Slide 2: The teacher persona shaped the product

**Vishal, 35 seconds**

We designed for Meera, a beginner science teacher who may use a phone or shared laptop and has only 20 to 30 minutes. That led to short activities, plain language, visible lock states, transcripts, captions, keyboard focus and mobile navigation. The Stitch wireframes were refined into the responsive screens shown here.

## Slide 3: Working participant journey

**Darshan, 55 seconds**

The approved flow now works from sign-in through Module 2 unlock. Module 1 contains safe onboarding, a teacher profile, three short lessons, transcripts and concept checks. A three-out-of-five quiz result shows focused feedback and an immediate retry. Four out of five meets the 70 percent rule, preserves the best score and unlocks Module 2.

## Slide 4: CRAFT feedback is live

**Ashok, 55 seconds**

CRAFT means Context, Role, Action, Format and Target. The prompt “Explain photosynthesis” receives one out of fifteen because the action is present but vague. A complete classroom prompt receives detailed feedback for all five dimensions and reaches fifteen. The evaluator runs on the server. The browser never receives the key, raw prompts are not stored, and a deterministic fallback remains available.

## Slide 5: Working system evidence

**Raghuram, 40 seconds**

The final suite contains 56 automated tests, and lint, type checking and the production build pass. We applied three migrations to Supabase, seeded four modules and verified row-level security on twelve public tables. The health route reports Supabase and the evaluator as configured. A real two-participant staging journey is the remaining validation boundary.

## Slide 6: Project evidence and team ownership

**Vishal, 40 seconds**

We divided delivery into four equal workstreams. Darshan owns planning and client flow. I own the persona and responsive experience. Ashok owns learning content and CRAFT review. Raghuram owns platform validation and staging. Evidence includes HLD v1.3, four meeting records, twenty Jira tasks with five per member, and sixteen scoped commits. GitHub attribution remains tied to the account that actually commits or reviews.

## Slide 7: Next client review

**Raghuram, 30 seconds**

For the next review we will show a stable staging link, real sign-in, two-participant data isolation, server-backed lesson and quiz progress, and the Module 1 test report. We need confirmation on CRAFT wording, scenario priority, pilot context, privacy wording and one safe teacher-owned source. The final presentation remains due on 15 October.

## Demo contingency

The deck already contains verified screenshots. If time remains, open `/learn/module-2/practice`, score the weak prompt once and then load the strong example. Stop after the score comparison.
