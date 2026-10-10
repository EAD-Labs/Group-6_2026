import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createRuleBasedCraftEvaluation } from "@/features/learning/craft-ai";
import { createCraftScenario, craftScenarios, craftInputLimits } from "@/features/learning/craft";
import { evaluateCraftPromptWithGemini } from "@/lib/ai/gemini-craft";
import { consumeAiBudget, getAiAccess } from "@/lib/ai/access";
import { hasGeminiEnvironment } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSameOrigin, readJsonBody, RequestValidationError } from "@/lib/server/request";
import { readParticipantGeminiKey } from "@/lib/ai/gemini-key";

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "The request origin is not allowed." }, { status: 403 });
  try {
    const access = await getAiAccess();
    if (access.mode === "unauthenticated") return NextResponse.json({ code: "sign_in_required", error: "Sign in to your account to practise." }, { status: 401 });
    if (access.mode === "consent_required") return NextResponse.json({ code: "consent_required", error: "Read and accept the safe-use reminders. Wait until they are saved, then check your prompt again." }, { status: 403 });
    const payload = await readJsonBody(request, 16_000);
    const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
    const task = typeof payload.task === "string" ? payload.task.trim() : "";
    const suggestionId = typeof payload.suggestionId === "string" ? payload.suggestionId : undefined;
    if ((suggestionId && !craftScenarios.some((item) => item.id === suggestionId)) || task.length < craftInputLimits.min || task.length > craftInputLimits.task || prompt.length < craftInputLimits.min || prompt.length > craftInputLimits.prompt) {
      return NextResponse.json({ error: "Describe a task in 3 to 300 characters and enter a prompt between 3 and 2,500 characters." }, { status: 400 });
    }
    const scenario = createCraftScenario(task, suggestionId);
    const participantKey = readParticipantGeminiKey(request);
    let evaluation = createRuleBasedCraftEvaluation(prompt, scenario);
    let fallbackReason = access.mode === "demo" ? "This practice uses the course checklist. No prompt was sent to an AI service." : "AI is unavailable, so we checked your prompt with the course checklist.";
    if (access.mode === "authenticated" && access.participantId && (participantKey || hasGeminiEnvironment())) {
      try {
        if (!await consumeAiBudget(access.participantId, "craft")) return NextResponse.json({ error: "Please wait a minute before checking another prompt." }, { status: 429, headers: { "Retry-After": "60" } });
        evaluation = await evaluateCraftPromptWithGemini(prompt, scenario, participantKey);
        fallbackReason = "";
      } catch { fallbackReason = participantKey ? "Gemini could not use your key right now. We checked your prompt with the course checklist. Check your key or try again later." : "AI could not finish. We checked your prompt with the course checklist."; }
    }
    let saved = false;
    let saveError: string | undefined;
    if (access.participantId) {
      try {
        const { error } = await createAdminClient().from("craft_prompt_attempts").insert({
          participant_id: access.participantId, scenario_id: scenario.id,
          suggestion_id: suggestionId ?? null, task_source: suggestionId ? "suggestion" : "custom",
          task_text: task, prompt_text: prompt, evaluation,
          task_fingerprint: createHash("sha256").update(task).digest("hex"),
          prompt_fingerprint: createHash("sha256").update(prompt).digest("hex"),
          dimension_scores: Object.fromEntries(evaluation.dimensions.map((dimension) => [dimension.id, dimension.score])),
          overall_score: evaluation.overallScore, score_percent: evaluation.scorePercent,
          evaluation_source: evaluation.source, model: evaluation.model, safety_flags: evaluation.safetyFlags,
        });
        if (error) throw new Error("Practice save unavailable.");
        saved = true;
      } catch { saveError = "Your feedback is ready, but this prompt was not saved to your account. Keep this tab open and try checking it again when your connection is working."; }
    }
    return NextResponse.json({ evaluation, saved, saveError, fallbackReason: fallbackReason || undefined }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof RequestValidationError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Practice could not be checked. Your input is preserved; please retry." }, { status: 503 });
  }
}
