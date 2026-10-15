import { getGeminiEnvironment } from "@/lib/env";

export type AiWorkflow = "craft" | "assistant" | "transform";
export type AiFailureReason = "timeout" | "rate_limit" | "provider" | "invalid_response";
export class AiProviderError extends Error {
  constructor(public reason: AiFailureReason, public requestId: string, public providerStatus?: number) {
    super("The AI request could not finish.");
  }
}

// Fixed labels only: never include a prompt, key, account identity, provider
// error body or source text. These events can be aggregated in deployment logs.
function logAttempt(workflow: AiWorkflow, requestId: string, start: number, outcome: string, personal: boolean, providerStatus?: number) {
  console.info(JSON.stringify({ event: "ai_request", workflow, requestId,
    durationMs: Math.round(performance.now() - start), outcome, connection: personal ? "personal" : "course",
    ...(Number.isInteger(providerStatus) && Number(providerStatus) >= 100 && Number(providerStatus) <= 599 ? { providerStatus } : {}) }));
}

function responseText(payload: unknown) {
  if (!payload || typeof payload !== "object") throw new Error("Invalid response");
  // HTTP 200 also carries failed/incomplete interactions. Never present partial
  // material (for example a truncated answer key) as a successfully prepared draft.
  if ((payload as { status?: unknown }).status !== "completed") throw new Error("Interaction did not complete");
  const steps = (payload as { steps?: unknown }).steps;
  if (!Array.isArray(steps)) throw new Error("Missing output");
  const text = steps.filter(step => step?.type === "model_output")
    .flatMap(step => Array.isArray(step.content) ? step.content : [])
    .filter(part => part?.type === "text" && typeof part.text === "string")
    .map(part => part.text).join("").trim();
  if (!text || text.length > 24_000) throw new Error("Invalid output length");
  return text;
}

export async function requestGeminiText(workflow: AiWorkflow, input: Record<string, unknown>, participantKey?: string, validate?: (text: string) => void) {
  const { apiKey, model } = getGeminiEnvironment(participantKey);
  const configuration = input.generation_config;
  const generationConfig = configuration && typeof configuration === "object" && !Array.isArray(configuration)
    ? { ...configuration as Record<string, unknown> } : {};
  // The accepted 3.5 Flash model supports minimal thinking for simple, bounded
  // single-turn drafts. Other configured models retain their own defaults.
  if (model === "gemini-3.5-flash" && generationConfig.thinking_level === undefined) generationConfig.thinking_level = "minimal";
  // Current Gemini 3 guidance asks callers to retain default sampling settings.
  if (/^gemini-3(?:\.|-)/.test(model)) {
    delete generationConfig.temperature; delete generationConfig.top_p; delete generationConfig.top_k;
  }
  const requestId = crypto.randomUUID(), start = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  let reason: AiFailureReason = "provider";
  let providerStatus: number | undefined;
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      // Single-turn classroom requests do not need provider-side conversation
      // storage. This does not override the provider's general processing terms.
      body: JSON.stringify({ ...input, generation_config: generationConfig, model, store: false }), cache: "no-store", signal: controller.signal,
    });
    providerStatus = response.status;
    if (!response.ok) {
      reason = response.status === 429 ? "rate_limit" : "provider";
      await response.body?.cancel();
      throw new Error("Provider unavailable");
    }
    reason = "invalid_response";
    // Bound the response as well as the submitted classroom material.
    let payload: unknown;
    if (response.body) {
      const reader = response.body.getReader(), decoder = new TextDecoder();
      let bytes = 0, body = "";
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        bytes += part.value.byteLength;
        if (bytes > 128_000) { await reader.cancel(); throw new Error("Response too large"); }
        body += decoder.decode(part.value, { stream: true });
      }
      payload = JSON.parse(body + decoder.decode());
    } else { payload = await response.json(); }
    const text = responseText(payload);
    validate?.(text);
    logAttempt(workflow, requestId, start, "success", Boolean(participantKey), providerStatus);
    return { text, model, requestId };
  } catch {
    if (controller.signal.aborted) reason = "timeout";
    logAttempt(workflow, requestId, start, reason, Boolean(participantKey), providerStatus);
    throw new AiProviderError(reason, requestId, providerStatus);
  } finally { clearTimeout(timer); }
}
