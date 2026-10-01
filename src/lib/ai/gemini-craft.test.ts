import { describe, expect, it } from "vitest";
import { validateCraftModelResponse } from "./gemini-craft";
import { craftDimensions } from "@/features/learning/craft";
const valid = () => ({ dimensions: craftDimensions.map(({ id }) => ({ id, score: 2, evidence: "Evidence", feedback: "Feedback", suggestion: "Suggestion" })), summary: "Review", nextSteps: [], safetyFlags: [] });
describe("model response trust boundary", () => {
  it("accepts one valid score per CRAFT dimension", () => expect(validateCraftModelResponse(valid())).toEqual(valid()));
  it("rejects empty, duplicate, missing and out-of-range dimension data", () => {
    expect(() => validateCraftModelResponse({})).toThrow();
    const duplicate = valid(); duplicate.dimensions[1] = duplicate.dimensions[0];
    expect(() => validateCraftModelResponse(duplicate)).toThrow();
    const invalid = valid(); invalid.dimensions[0].score = 4;
    expect(() => validateCraftModelResponse(invalid)).toThrow();
  });
});
