import { describe, expect, it } from "vitest";

import { createCraftScenario, craftScenarios, evaluateCraftPrompt } from "./craft";

describe("CRAFT prompt evaluation", () => {
  const conceptScenario = craftScenarios[0];

  it("shows missing dimensions for a weak but relevant prompt", () => {
    const result = evaluateCraftPrompt("Explain photosynthesis.", conceptScenario);

    expect(result.completeCount).toBe(2);
    expect(result.dimensions.filter((dimension) => !dimension.met).map((dimension) => dimension.id)).toEqual([
      "role",
      "format",
      "target",
    ]);
  });

  it("recognises all five dimensions in the model answer", () => {
    const result = evaluateCraftPrompt(conceptScenario.strongPrompt, conceptScenario);

    expect(result.completeCount).toBe(5);
    expect(result.scorePercent).toBe(100);
    expect(result.headline).toBe("CRAFT structure complete");
  });

  it("uses scenario-specific context rather than generic prompt length", () => {
    const result = evaluateCraftPrompt(
      "Act as a teacher and write a 100-word bullet list for Class 7 learners.",
      conceptScenario,
    );

    expect(result.dimensions.find((dimension) => dimension.id === "context")?.met).toBe(false);
  });

  it("builds a custom scenario from the teacher's task", () => {
    const scenario = createCraftScenario("Make a question bank for revision");
    const result = evaluateCraftPrompt(
      "Act as a teacher and create a 10-question revision question bank for Class 7 learners.",
      scenario,
    );

    expect(scenario.id).toBe("custom");
    expect(scenario.contextKeywords).toContain("question");
    expect(result.dimensions.find((dimension) => dimension.id === "context")?.met).toBe(true);
  });
});
