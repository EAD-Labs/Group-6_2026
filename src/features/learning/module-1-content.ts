import type { LearningModule, Lesson } from "./domain";

export const moduleOne: LearningModule = {
  description:
    "Recognise what generative AI can do and apply a responsible teacher-review process.",
  estimatedMinutes: 20,
  id: "00000000-0000-4000-8000-000000000001",
  position: 1,
  slug: "module-1",
  title: "AI Foundations and Responsible Use",
};

export const moduleOneLessons: Lesson[] = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    moduleId: moduleOne.id,
    position: 1,
    slug: "meet-generative-ai",
    title: "Meet generative AI",
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    moduleId: moduleOne.id,
    position: 2,
    slug: "useful-teacher-tasks",
    title: "Useful teacher tasks",
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    moduleId: moduleOne.id,
    position: 3,
    slug: "review-before-use",
    title: "Review before use",
  },
];
