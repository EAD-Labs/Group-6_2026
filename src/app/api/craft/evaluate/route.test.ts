import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ access: vi.fn(), budget: vi.fn(), evaluate: vi.fn(), insert: vi.fn(), configured: true }));
vi.mock("@/lib/ai/access", () => ({ getAiAccess: mocks.access, consumeAiBudget: mocks.budget }));
vi.mock("@/lib/ai/gemini-craft", () => ({ evaluateCraftPromptWithGemini: mocks.evaluate }));
vi.mock("@/lib/env", () => ({ hasGeminiEnvironment: () => mocks.configured }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: () => ({ insert: mocks.insert }) }) }));
import { POST } from "./route";
const request = () => new Request("https://example.test/api/craft/evaluate", { method: "POST", body: JSON.stringify({ task: "Explain plants", prompt: "Explain photosynthesis to Class 7." }) });
beforeEach(() => { vi.clearAllMocks(); mocks.configured = true; mocks.budget.mockResolvedValue(true); mocks.insert.mockResolvedValue({ error: null }); });
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
  it("uses the participant key even without a configured course key and saves private text", async () => {
    mocks.configured = false;
    mocks.access.mockResolvedValue({ mode: "authenticated", participantId: "alice" });
    const key = "private_participant_key_for_testing";
    mocks.evaluate.mockRejectedValue(new Error("Provider unavailable"));
    const submitted = request(); submitted.headers.set("x-promptshala-gemini-key", key);
    const result = await (await POST(submitted)).json();
    expect(mocks.evaluate).toHaveBeenCalledWith("Explain photosynthesis to Class 7.", expect.any(Object), key);
    expect(mocks.budget).toHaveBeenCalledWith("alice", "craft");
    expect(result.saved).toBe(true);
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ participant_id: "alice", task_text: "Explain plants", prompt_text: "Explain photosynthesis to Class 7.", evaluation: expect.any(Object) }));
    expect(JSON.stringify(mocks.insert.mock.calls)).not.toContain(key);
    expect(JSON.stringify(result)).not.toContain(key);
  });
  it("reports failed database saves while preserving usable feedback", async () => {
    mocks.configured = false;
    mocks.access.mockResolvedValue({ mode: "authenticated", participantId: "alice" });
    mocks.insert.mockResolvedValue({ error: { message: "Table unavailable" } });
    const response = await POST(request()); const result = await response.json();
    expect(response.status).toBe(200); expect(result.evaluation).toBeDefined();
    expect(result.saved).toBe(false); expect(result.saveError).toContain("not saved");
    expect(JSON.stringify(result)).not.toContain("Table unavailable");
  });
  it("rejects malformed keys before contacting Gemini or saving a prompt", async () => {
    mocks.access.mockResolvedValue({ mode: "authenticated", participantId: "alice" });
    const submitted = request(); submitted.headers.set("x-promptshala-gemini-key", "short");
    expect((await POST(submitted)).status).toBe(400);
    expect(mocks.evaluate).not.toHaveBeenCalled(); expect(mocks.insert).not.toHaveBeenCalled();
  });
});
