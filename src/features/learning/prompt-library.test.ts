import { describe, expect, it } from "vitest";
import { promptLibraryCategories, promptLibraryReady } from "./prompt-library";
import type { PromptTemplate } from "@/features/demo/demo-state";
const library: PromptTemplate[] = promptLibraryCategories.map(({ id }) => ({ category: id, reviewBasis: "guided", template: "Draft [task] for [grade] using [source].", completedExample: "Draft a Class 6 exit question using the supplied fictional source.", knownFailure: "Predicted risk: the request leaves timing ambiguous. No AI output was generated.", reviewChecklist: "Check factual support, objective, language and safety before use.", transferNote: "Reviewed a different grade and changed the vocabulary slot." }));
describe("honest prompt library evidence", () => {
  it("accepts a clearly labelled guided review without fabricated observations", () => { expect(promptLibraryReady(library)).toBe(true); });
  it("accepts all-pass observed trials with a stated untested limitation", () => {
    expect(promptLibraryReady(library.map(value => ({ ...value, reviewBasis: "observed", knownFailure: "All sampled outputs passed; an unfamiliar grade still needs checking." })))).toBe(true);
  });
  it("requires a review basis for legacy entries before crediting completion", () => { expect(promptLibraryReady(library.map(value => ({ ...value, reviewBasis: undefined })))).toBe(false); });
});
