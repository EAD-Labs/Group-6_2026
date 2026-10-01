import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ access: vi.fn(), budget: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/access", () => ({ getAiAccess: mocks.access, consumeAiBudget: mocks.budget }));
vi.mock("@/lib/env", () => ({ getGeminiEnvironment: () => ({ apiKey: "test-only", model: "test-model" }), hasGeminiEnvironment: () => true, hasPublicSupabaseEnvironment: () => true }));
import { POST } from "./route";
const input = { title: "Fictional science notes", audience: "Class 6", objective: "Explain how evaporation changes water.", source: "Water can change from liquid into water vapour. This fictional teacher-authored passage supports a simple classroom observation and invites careful comparison.", format: "summary", permission: "own", safe: true };
const request = (body: Record<string, unknown>) => new Request("https://example.test/api/transform", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...input, ...body }) });
const provider = vi.fn();
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal("fetch", provider); mocks.budget.mockResolvedValue(true); });
afterEach(() => vi.unstubAllGlobals());
describe("source transformation privacy and recovery", () => {
  it.each(["demo", "consent_required"])("never sends a source for %s sessions, even if live AI is requested", async (mode) => {
    mocks.access.mockResolvedValue({ mode });
    const result = await POST(request({ useAi: true }));
    expect(result.status).toBe(200); expect((await result.json()).source).toBe("extractive");
    expect(provider).not.toHaveBeenCalled(); expect(mocks.budget).not.toHaveBeenCalled();
  });
  it("requires an explicit live-AI choice even for an authenticated account", async () => {
    mocks.access.mockResolvedValue({ mode: "authenticated", participantId: "alice" });
    expect((await (await POST(request({ useAi: false }))).json()).source).toBe("extractive");
    expect(provider).not.toHaveBeenCalled();
  });
  it("provides a scaffold when shared quota checks or the provider fail", async () => {
    mocks.access.mockResolvedValue({ mode: "authenticated", participantId: "alice" });
    mocks.budget.mockRejectedValueOnce(new Error("unavailable"));
    expect((await (await POST(request({ useAi: true }))).json()).source).toBe("extractive");
    expect(provider).not.toHaveBeenCalled();
    provider.mockRejectedValue(new Error("timeout"));
    expect((await (await POST(request({ useAi: true }))).json()).source).toBe("extractive");
  });
  it("blocks signed-out sessions and rejects invented citation labels", async () => {
    mocks.access.mockResolvedValueOnce({ mode: "unauthenticated" }); expect((await POST(request({ useAi: true }))).status).toBe(401);
    mocks.access.mockResolvedValue({ mode: "authenticated", participantId: "alice" });
    provider.mockResolvedValue(new Response(JSON.stringify({ steps: [{ type: "model_output", content: [{ type: "text", text: "An invented claim [S999]." }] }] }), { status: 200 }));
    expect((await (await POST(request({ useAi: true }))).json()).source).toBe("extractive");
  });
});
