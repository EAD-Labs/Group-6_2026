import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createRuleBasedCraftEvaluation } from "@/features/learning/craft-ai";
import { createCraftScenario, craftScenarios, craftInputLimits } from "@/features/learning/craft";
import { evaluateCraftPromptWithGemini } from "@/lib/ai/gemini-craft";
import { consumeAiBudget, getAiAccess } from "@/lib/ai/access";
import { hasGeminiEnvironment } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSameOrigin, readJsonBody, RequestValidationError } from "@/lib/server/request";

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "The request origin is not allowed." }, { status: 403 });
  try {
    const access = await getAiAccess();
    if (access.mode === "unauthenticated") return NextResponse.json({ code: "sign_in_required", error: "Sign in to your account to practise." }, { status: 401 });
    if (access.mode === "consent_required") return NextResponse.json({ code: "consent_required", error: "Review and accept the safe-use notice, then wait for Progress synced before trying live AI practice." }, { status: 403 });
    const payload = await readJsonBody(request, 16_000);
    const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
    const task = typeof payload.task === "string" ? payload.task.trim() : "";
    const suggestionId = typeof payload.suggestionId === "string" ? payload.suggestionId : undefined;
    if ((suggestionId && !craftScenarios.some((item) => item.id === suggestionId)) || task.length < craftInputLimits.min || task.length > craftInputLimits.task || prompt.length < craftInputLimits.min || prompt.length > craftInputLimits.prompt) {
      return NextResponse.json({ error: "Describe a task in 3 to 300 characters and enter a prompt between 3 and 2,500 characters." }, { status: 400 });
    }
    const scenario = createCraftScenario(task, suggestionId);
    let evaluation = createRuleBasedCraftEvaluation(prompt, scenario);
    let fallbackReason = access.mode === "demo" ? "Guided demo uses the transparent CRAFT checklist. No prompt is sent to an AI provider." : "Live AI is unavailable, so PromptShala used its transparent CRAFT checklist.";
    if (access.mode === "authenticated" && access.participantId && hasGeminiEnvironment()) {
      try {
        if (!await consumeAiBudget(access.participantId, "craft")) return NextResponse.json({ error: "Please wait a minute before checking another prompt." }, { status: 429, headers: { "Retry-After": "60" } });
        evaluation = await evaluateCraftPromptWithGemini(prompt, scenario);
        fallbackReason = "";
      } catch { /* Input stays in the browser. Do not log provider payloads or private prompt text. */ }
    }
    if (access.participantId) {
      try {
        await createAdminClient().from("craft_prompt_attempts").insert({
          participant_id: access.participantId, scenario_id: scenario.id,
          suggestion_id: suggestionId ?? null, task_source: suggestionId ? "suggestion" : "custom",
          task_fingerprint: createHash("sha256").update(task).digest("hex"),
          prompt_fingerprint: createHash("sha256").update(prompt).digest("hex"),
          dimension_scores: Object.fromEntries(evaluation.dimensions.map((dimension) => [dimension.id, dimension.score])),
          overall_score: evaluation.overallScore, score_percent: evaluation.scorePercent,
          evaluation_source: evaluation.source, model: evaluation.model, safety_flags: evaluation.safetyFlags,
        });
      } catch { /* Evaluation can still be used if optional analytics are unavailable. */ }
    }
    return NextResponse.json({ evaluation, fallbackReason: fallbackReason || undefined }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof RequestValidationError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Practice could not be checked. Your input is preserved; please retry." }, { status: 503 });
  }
}
