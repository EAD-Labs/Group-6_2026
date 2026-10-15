// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AiProviderError, requestGeminiText } from "./interactions";
const provider = vi.fn();
const output = (text: string, status: string | undefined = "completed") => new Response(JSON.stringify({ status, steps: [{ type: "model_output", content: [{ type: "text", text }] }] }));
beforeEach(() => { vi.stubGlobal("fetch", provider); vi.stubEnv("GEMINI_API_KEY", "private-course-key"); provider.mockReset(); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); vi.restoreAllMocks(); });
describe("bounded stateless AI transport", () => {
  it.each(["craft", "assistant", "transform"] as const)("disables provider conversation storage for %s and logs only safe metadata", async (workflow) => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    provider.mockResolvedValue(output("Reviewed fictional output"));
    const result = await requestGeminiText(workflow, { input: "PRIVATE SOURCE", store: true, model: "untrusted-override" }, "private-personal-key");
    const options = provider.mock.calls[0][1];
    expect(JSON.parse(options.body)).toMatchObject({ store: false, model: result.model });
    expect(result.text).toBe("Reviewed fictional output");
    expect(log.mock.calls.flat().join(" ")).not.toMatch(/PRIVATE SOURCE|private-personal-key|Reviewed fictional output/);
    expect(JSON.parse(String(log.mock.calls[0][0]))).toMatchObject({ workflow, requestId: result.requestId, outcome: "success", connection: "personal", providerStatus: 200 });
  });
  it.each([429, 403, 500])("does not expose or log the provider error body for HTTP %s", async (status) => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    provider.mockResolvedValue(new Response("PRIVATE PROVIDER ERROR", { status }));
    await expect(requestGeminiText("craft", { input: "PRIVATE INPUT" })).rejects.toMatchObject({ reason: status === 429 ? "rate_limit" : "provider", providerStatus: status });
    expect(log.mock.calls.flat().join(" ")).not.toMatch(/PRIVATE/);
    expect(JSON.parse(String(log.mock.calls[0][0])).providerStatus).toBe(status);
  });
  it("rejects empty, malformed and oversized output", async () => {
    for (const response of [output(""), new Response("not JSON"), output("x".repeat(24001)), new Response("x".repeat(128001))]) {
      provider.mockResolvedValueOnce(response);
      await expect(requestGeminiText("transform", {})).rejects.toMatchObject({ reason: "invalid_response" });
    }
  });
  it("aborts once at 25 seconds without a second chargeable request", async () => {
    vi.useFakeTimers();
    provider.mockImplementation((_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new Error("aborted")))));
    const result = requestGeminiText("assistant", {});
    const assertion = expect(result).rejects.toBeInstanceOf(AiProviderError);
    await vi.advanceTimersByTimeAsync(25_000); await assertion;
    expect(provider).toHaveBeenCalledTimes(1);
  });
  it("decodes split UTF-8 responses and ignores non-output provider steps", async () => {
    const bytes = new TextEncoder().encode(JSON.stringify({ status: "completed", steps: [
      { type: "thought", content: [{ type: "text", text: "Do not display provider thoughts" }] },
      { type: "model_output", content: [{ type: "text", text: "पानी becomes vapour." }, { type: "image", text: "Ignore image fields" }] },
    ] }));
    provider.mockResolvedValue(new Response(new ReadableStream({ start(controller) {
      for (let offset = 0; offset < bytes.length; offset += 2) controller.enqueue(bytes.slice(offset, offset + 2));
      controller.close();
    } })));
    const result = await requestGeminiText("transform", { input: "Fictional source" });
    expect(result.text).toBe("पानी becomes vapour.");
    expect(provider.mock.calls[0][0]).toBe("https://generativelanguage.googleapis.com/v1beta/interactions");
    expect(provider.mock.calls[0][1].headers["x-goog-api-key"]).toBe("private-course-key");
  });
  it("treats workflow schema rejection as invalid output without logging the rejected material", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    provider.mockResolvedValue(output("PRIVATE WRONG SCHEMA"));
    await expect(requestGeminiText("craft", {}, undefined, () => { throw new Error("PRIVATE VALIDATION DETAILS"); })).rejects.toMatchObject({ reason: "invalid_response" });
    expect(provider).toHaveBeenCalledTimes(1);
    expect(log.mock.calls.flat().join(" ")).not.toMatch(/PRIVATE/);
  });
  it("reduces network diagnostics to a public-safe single attempt", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    provider.mockRejectedValue(new Error("PRIVATE network diagnostic with a provider key"));
    await expect(requestGeminiText("assistant", {})).rejects.toMatchObject({ reason: "provider", message: "The AI request could not finish." });
    expect(log.mock.calls.flat().join(" ")).not.toMatch(/PRIVATE|provider key/);
    expect(provider).toHaveBeenCalledTimes(1);
  });
  it.each(["incomplete", "failed", "cancelled", "requires_action", "in_progress", "queued", ""])("rejects partial text from a %s interaction", async status => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    provider.mockResolvedValue(output("PRIVATE PARTIAL ANSWER KEY", status));
    await expect(requestGeminiText("assistant", {})).rejects.toMatchObject({ reason: "invalid_response", providerStatus: 200 });
    expect(log.mock.calls.flat().join(" ")).not.toMatch(/PRIVATE|PARTIAL/);
    expect(JSON.parse(String(log.mock.calls[0][0])).outcome).toBe("invalid_response");
  });
  it("uses documented minimal thinking and default sampling for the accepted 3.5 model", async () => {
    vi.stubEnv("GEMINI_CRAFT_MODEL", "gemini-3.5-flash"); provider.mockResolvedValue(output("A reviewed fictional draft."));
    await requestGeminiText("assistant", { input: "Fictional task", generation_config: { max_output_tokens: 1500, temperature: 0.3, top_p: 0.5, top_k: 10 } });
    expect(JSON.parse(provider.mock.calls[0][1].body).generation_config).toEqual({ max_output_tokens: 1500, thinking_level: "minimal" });
  });
});
