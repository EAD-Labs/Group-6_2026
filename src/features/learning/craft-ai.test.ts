import { describe, expect, it } from "vitest";

import {
  buildGeminiCraftRequest,
  createRuleBasedCraftEvaluation,
  normalizeGeminiCraftEvaluation,
} from "./craft-ai";
import { craftScenarios } from "./craft";

describe("CRAFT AI evaluation contract", () => {
  const scenario = craftScenarios[0];

  it("keeps a deterministic fallback for an unavailable model", () => {
    const result = createRuleBasedCraftEvaluation(
      scenario.startingPrompt,
      scenario,
    );

    expect(result.source).toBe("rule-based");
    expect(result.dimensions).toHaveLength(5);
    expect(result.overallScore).toBe(6);
    expect(result.scorePercent).toBe(40);
  });

  it("requests one score for every CRAFT dimension", () => {
    const request = buildGeminiCraftRequest(scenario.strongPrompt, scenario);
    const schema = request.response_format.schema;

    expect(schema.properties.dimensions.minItems).toBe(5);
    expect(schema.properties.dimensions.maxItems).toBe(5);
    expect(request.generation_config.temperature).toBe(0.1);
    expect(request.generation_config.max_output_tokens).toBeLessThanOrEqual(1000);
    expect(request.generation_config.thinking_level).toBe("minimal");
  });

  it("normalizes model scores and calculates the total itself", () => {
    const result = normalizeGeminiCraftEvaluation(
      {
        dimensions: [
          { id: "context", score: 4, feedback: "Clear.", evidence: "Class 7", suggestion: "Keep it." },
          { id: "role", score: 3, feedback: "Clear.", evidence: "Teacher", suggestion: "Keep it." },
          { id: "action", score: 2, feedback: "Usable.", evidence: "Explain", suggestion: "Add a verb." },
          { id: "format", score: 1, feedback: "Vague.", evidence: "Short", suggestion: "Name sections." },
          { id: "target", score: -2, feedback: "Missing.", evidence: "", suggestion: "Name learners." },
        ],
        summary: "A useful starting point.",
        nextSteps: ["Specify the format."],
        safetyFlags: [],
      },
      "gemini-3.5-flash",
    );

    expect(result.dimensions.map((dimension) => dimension.score)).toEqual([
      3, 3, 2, 1, 0,
    ]);
    expect(result.overallScore).toBe(9);
    expect(result.scorePercent).toBe(60);
    expect(result.source).toBe("gemini");
  });
});
