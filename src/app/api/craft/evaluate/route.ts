import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import {
  createRuleBasedCraftEvaluation,
  type CraftAiEvaluation,
} from "@/features/learning/craft-ai";
import { craftScenarios } from "@/features/learning/craft";
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
    scenarioId?: unknown;
  } | null;
  const prompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
  const scenarioId =
    typeof payload?.scenarioId === "string" ? payload.scenarioId : "";
  const scenario = craftScenarios.find((item) => item.id === scenarioId);

  if (!scenario || prompt.length < 3 || prompt.length > 2_500) {
    return NextResponse.json(
      {
        error:
          "Choose a valid scenario and enter a prompt between 3 and 2,500 characters.",
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

  await persistEvaluation(scenario.id, prompt, evaluation);

  return NextResponse.json({ evaluation, fallbackReason });
}
