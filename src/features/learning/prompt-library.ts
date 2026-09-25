import type { PromptTemplate } from "@/features/demo/demo-state";

export const promptLibraryCategories = [
  { id: "planning", label: "Lesson planning" },
  { id: "assessment", label: "Assessment or feedback" },
  { id: "adaptation", label: "Communication or adaptation" },
] as const;

export function promptLibraryReady(templates: PromptTemplate[]) {
  return promptLibraryCategories.every(({ id }) => {
    const template = templates.find((item) => item.category === id);
    return template && [template.template, template.completedExample, template.knownFailure,
      template.reviewChecklist, template.transferNote].every((value) => value.trim().length >= 20);
  });
}
