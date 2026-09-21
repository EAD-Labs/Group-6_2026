import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import {
  createRuleBasedCraftEvaluation,
  type CraftAiEvaluation,
} from "@/features/learning/craft-ai";
import { createCraftScenario, craftScenarios } from "@/features/learning/craft";
import { evaluateCraftPromptWithGemini } from "@/lib/ai/gemini-craft";
import {
  hasGeminiEnvironment,
  hasPublicSupabaseEnvironment,
} from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const rateWindowMs = 60_000;
const rateLimit = 12;
const requestLedger = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(clientId: string) {
  const now = Date.now();
  const current = requestLedger.get(clientId);

  if (!current || current.resetAt <= now) {
    requestLedger.set(clientId, { count: 1, resetAt: now + rateWindowMs });
    return false;
  }

  current.count += 1;
  return current.count > rateLimit;
}

async function persistEvaluation(
  scenarioId: string,
  suggestionId: string | undefined,
  task: string,
  prompt: string,
  evaluation: CraftAiEvaluation,
) {
  if (!hasPublicSupabaseEnvironment()) {
    return;
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return;
    }

    await supabase.from("craft_prompt_attempts").insert({
      participant_id: data.user.id,
      scenario_id: scenarioId,
      suggestion_id: suggestionId ?? null,
      task_source: suggestionId ? "suggestion" : "custom",
      task_fingerprint: createHash("sha256").update(task).digest("hex"),
      prompt_fingerprint: createHash("sha256").update(prompt).digest("hex"),
      dimension_scores: Object.fromEntries(
        evaluation.dimensions.map((dimension) => [
          dimension.id,
          dimension.score,
        ]),
      ),
      overall_score: evaluation.overallScore,
      score_percent: evaluation.scorePercent,
      evaluation_source: evaluation.source,
      model: evaluation.model,
      safety_flags: evaluation.safetyFlags,
    });
  } catch {}
}

export async function POST(request: Request) {
  const clientId =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (isRateLimited(clientId)) {
    return NextResponse.json(
      { error: "Please wait a minute before checking another prompt." },
      { status: 429 },
    );
  }

  const payload = (await request.json().catch(() => null)) as {
    prompt?: unknown;
    suggestionId?: unknown;
    task?: unknown;
  } | null;
  const prompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
  const task = typeof payload?.task === "string" ? payload.task.trim() : "";
  const suggestionId =
    typeof payload?.suggestionId === "string" ? payload.suggestionId : undefined;
  const knownSuggestion = suggestionId
    ? craftScenarios.some((item) => item.id === suggestionId)
    : true;
  const scenario = createCraftScenario(task, suggestionId);

  if (
    !knownSuggestion ||
    task.length < 3 ||
    task.length > 300 ||
    prompt.length < 3 ||
    prompt.length > 2_500
  ) {
    return NextResponse.json(
      {
        error:
          "Describe a task in 3 to 300 characters and enter a prompt between 3 and 2,500 characters.",
      },
      { status: 400 },
    );
  }

  let evaluation = createRuleBasedCraftEvaluation(prompt, scenario);
  let fallbackReason: string | undefined;

  if (hasGeminiEnvironment()) {
    try {
      evaluation = await evaluateCraftPromptWithGemini(prompt, scenario);
    } catch (error) {
      console.error(
        "CRAFT evaluator unavailable:",
        error instanceof Error ? error.message : "unknown error",
      );
      fallbackReason =
        "The AI evaluator was unavailable, so PromptShala used its transparent CRAFT fallback.";
    }
  } else {
    fallbackReason =
      "No server evaluator is configured, so PromptShala used its transparent CRAFT fallback.";
  }

  await persistEvaluation(scenario.id, suggestionId, task, prompt, evaluation);

  return NextResponse.json({ evaluation, fallbackReason });
}
