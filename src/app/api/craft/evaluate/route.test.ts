import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ access: vi.fn(), budget: vi.fn(), evaluate: vi.fn(), insert: vi.fn() }));
vi.mock("@/lib/ai/access", () => ({ getAiAccess: mocks.access, consumeAiBudget: mocks.budget }));
vi.mock("@/lib/ai/gemini-craft", () => ({ evaluateCraftPromptWithGemini: mocks.evaluate }));
vi.mock("@/lib/env", () => ({ hasGeminiEnvironment: () => true }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: () => ({ insert: mocks.insert }) }) }));
import { POST } from "./route";
const request = () => new Request("https://example.test/api/craft/evaluate", { method: "POST", body: JSON.stringify({ task: "Explain plants", prompt: "Explain photosynthesis to Class 7." }) });
beforeEach(() => { vi.clearAllMocks(); mocks.budget.mockResolvedValue(true); mocks.insert.mockResolvedValue({ error: null }); });
describe("CRAFT endpoint authorization and recovery", () => {
  it("does not call the paid provider for guided demos", async () => {
    mocks.access.mockResolvedValue({ mode: "demo" });
    const response = await POST(request());
    expect((await response.json()).evaluation.source).toBe("rule-based");
    expect(mocks.evaluate).not.toHaveBeenCalled(); expect(mocks.budget).not.toHaveBeenCalled();
  });
  it("blocks anonymous access and missing consent", async () => {
    mocks.access.mockResolvedValue({ mode: "unauthenticated" }); expect((await POST(request())).status).toBe(401);
    mocks.access.mockResolvedValue({ mode: "consent_required" });
    const denied = await POST(request()); expect(denied.status).toBe(403);
    expect((await denied.json()).code).toBe("consent_required");
    expect(mocks.evaluate).not.toHaveBeenCalled();
  });
  it("preserves useful fallback on provider failure and unavailable quota service", async () => {
    mocks.access.mockResolvedValue({ mode: "authenticated", participantId: "user" });
    mocks.evaluate.mockRejectedValue(new Error("timeout"));
    expect((await (await POST(request())).json()).evaluation.source).toBe("rule-based");
    mocks.evaluate.mockClear(); mocks.budget.mockRejectedValue(new Error("database offline"));
    expect((await (await POST(request())).json()).evaluation.source).toBe("rule-based");
    expect(mocks.evaluate).not.toHaveBeenCalled();
  });
  it("returns a service error when account access cannot be verified", async () => {
    mocks.access.mockRejectedValue(new Error("profile unavailable"));
    expect((await POST(request())).status).toBe(503);
    expect(mocks.evaluate).not.toHaveBeenCalled();
  });
  it("rejects over-limit prompts without calling the provider", async () => {
    mocks.access.mockResolvedValue({ mode: "authenticated", participantId: "user" });
    const response = await POST(new Request("https://example.test/api/craft/evaluate", { method: "POST", body: JSON.stringify({ task: "Explain plants", prompt: "x".repeat(2501) }) }));
    expect(response.status).toBe(400); expect(mocks.evaluate).not.toHaveBeenCalled();
  });
  it("enforces the shared account limit before a provider request", async () => {
    mocks.access.mockResolvedValue({ mode: "authenticated", participantId: "user" }); mocks.budget.mockResolvedValue(false);
    expect((await POST(request())).status).toBe(429); expect(mocks.evaluate).not.toHaveBeenCalled();
  });
});
