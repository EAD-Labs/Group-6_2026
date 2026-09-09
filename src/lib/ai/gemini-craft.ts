import {
  buildGeminiCraftRequest,
  normalizeGeminiCraftEvaluation,
  type CraftAiEvaluation,
} from "@/features/learning/craft-ai";
import type { CraftScenario } from "@/features/learning/craft";
import { getGeminiEnvironment } from "@/lib/env";

type GeminiResponse = {
  steps?: Array<{
    content?: Array<{ text?: string; type?: string }>;
    type?: string;
  }>;
  error?: { message?: string };
};

export async function evaluateCraftPromptWithGemini(
  prompt: string,
  scenario: CraftScenario,
): Promise<CraftAiEvaluation> {
  const { apiKey, model } = getGeminiEnvironment();
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

    return normalizeGeminiCraftEvaluation(JSON.parse(responseText), model);
  } finally {
    clearTimeout(timeout);
  }
}
