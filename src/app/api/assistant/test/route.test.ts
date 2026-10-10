import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ access: vi.fn(), budget: vi.fn(), configured: false, provider: vi.fn() }));
vi.mock("@/lib/ai/access", () => ({ getAiAccess: mocks.access, consumeAiBudget: mocks.budget }));
vi.mock("@/lib/env", () => ({ getGeminiEnvironment: (key?: string) => ({ apiKey: key ?? "course-test-key", model: "test-model" }), hasGeminiEnvironment: () => mocks.configured }));
import { POST } from "./route";
const spec = { purpose: "Draft activities", persona: "Helpful teacher", task: "Write a classroom activity", context: "Class 6 science", format: "Five numbered steps", boundaries: "Use fictional examples", reviewChecks: "Check facts before use", input: "Help with a water-cycle lesson" };
function request(key?: string) {
  return new Request("https://example.test/api/assistant/test", { method: "POST", headers: { "Content-Type": "application/json", ...(key ? { "x-promptshala-gemini-key": key } : {}) }, body: JSON.stringify(spec) });
}
beforeEach(() => { vi.clearAllMocks(); mocks.configured = false; mocks.access.mockResolvedValue({ mode: "authenticated", participantId: "alice" }); mocks.budget.mockResolvedValue(true); vi.stubGlobal("fetch", mocks.provider); });
afterEach(() => vi.unstubAllGlobals());
describe("personal Gemini assistant connection", () => {
  it("forwards a personal key through the server and retains shared account limits", async () => {
    const key = "private_gemini_key_for_testing";
    mocks.provider.mockResolvedValue(new Response(JSON.stringify({ steps: [{ type: "model_output", content: [{ type: "text", text: "A fictional activity for review." }] }] }), { status: 200 }));
    const response = await POST(request(key)); const result = await response.json();
    expect(result.output).toBe("A fictional activity for review.");
    expect(mocks.provider).toHaveBeenCalledWith("https://generativelanguage.googleapis.com/v1beta/interactions", expect.objectContaining({ headers: expect.objectContaining({ "x-goog-api-key": key }) }));
    expect(mocks.budget).toHaveBeenCalledWith("alice", "assistant");
    expect(JSON.stringify(result)).not.toContain(key);
  });
  it.each(["unauthenticated", "consent_required", "demo"])("cannot use a personal key to bypass %s protection", async (mode) => {
    mocks.access.mockResolvedValue({ mode });
    expect((await POST(request("private_gemini_key_for_testing"))).ok).toBe(false);
    expect(mocks.provider).not.toHaveBeenCalled();
  });
  it("rejects malformed keys and does not expose provider error payloads", async () => {
    expect((await POST(request("short"))).status).toBe(400); expect(mocks.provider).not.toHaveBeenCalled();
    mocks.provider.mockResolvedValue(new Response(JSON.stringify({ error: { message: "Sensitive private provider message" } }), { status: 403 }));
    const response = await POST(request("private_gemini_key_for_testing"));
    expect(response.status).toBe(503); expect(JSON.stringify(await response.json())).not.toContain("Sensitive private provider message");
  });
});
