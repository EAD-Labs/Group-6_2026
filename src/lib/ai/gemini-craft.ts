import {
  buildGeminiCraftRequest,
  normalizeGeminiCraftEvaluation,
  type CraftAiEvaluation,
} from "@/features/learning/craft-ai";
import type { CraftScenario } from "@/features/learning/craft";
import { getGeminiEnvironment } from "@/lib/env";
import { craftDimensions } from "@/features/learning/craft";

type GeminiResponse = {
  steps?: Array<{
    content?: Array<{ text?: string; type?: string }>;
    type?: string;
  }>;
  error?: { message?: string };
};

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
  const { apiKey, model } = getGeminiEnvironment(participantKey);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model,
          ...buildGeminiCraftRequest(prompt, scenario),
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );
    const payload = (await response.json()) as GeminiResponse;

    if (!response.ok) {
      throw new Error(
        payload.error?.message ??
          "Gemini request failed with status " + response.status + ".",
      );
    }

    const responseText = payload.steps
      ?.find((step) => step.type === "model_output")
      ?.content?.filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!responseText) {
      throw new Error("Gemini returned no structured evaluation.");
    }

    return normalizeGeminiCraftEvaluation(validateCraftModelResponse(JSON.parse(responseText)), model);
  } finally {
    clearTimeout(timeout);
  }
}
