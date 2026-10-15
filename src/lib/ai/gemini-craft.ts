import {
  buildGeminiCraftRequest,
  normalizeGeminiCraftEvaluation,
  type CraftAiEvaluation,
} from "@/features/learning/craft-ai";
import type { CraftScenario } from "@/features/learning/craft";
import { craftDimensions } from "@/features/learning/craft";
import { requestGeminiText } from "./interactions";

export function validateCraftModelResponse(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Invalid evaluation structure.");
  const result = value as Record<string, unknown>;
  if (!Array.isArray(result.dimensions) || result.dimensions.length !== 5 ||
    typeof result.summary !== "string" || !result.summary.trim() || !Array.isArray(result.nextSteps) || !Array.isArray(result.safetyFlags) ||
    result.nextSteps.length > 3 || result.safetyFlags.length > 4 || [...result.nextSteps, ...result.safetyFlags].some((entry) => typeof entry !== "string")) {
    throw new Error("Incomplete evaluation structure.");
  }
  for (const expected of craftDimensions) {
    const entries = result.dimensions.filter((item) => item && item.id === expected.id);
    const item = entries[0];
    if (entries.length !== 1 || !Number.isInteger(item.score) || item.score < 0 || item.score > 3 ||
      [item.evidence, item.feedback, item.suggestion].some((entry) => typeof entry !== "string")) {
      throw new Error("Invalid evaluation dimension.");
    }
  }
  return value;
}

export async function evaluateCraftPromptWithGemini(
  prompt: string,
  scenario: CraftScenario,
  participantKey?: string,
): Promise<CraftAiEvaluation> {
  const { text, model } = await requestGeminiText("craft", buildGeminiCraftRequest(prompt, scenario), participantKey,
    text => { validateCraftModelResponse(JSON.parse(text)); });
  return normalizeGeminiCraftEvaluation(validateCraftModelResponse(JSON.parse(text)), model);
}
