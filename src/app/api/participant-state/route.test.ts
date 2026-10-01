import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ mode: vi.fn(), user: vi.fn(), load: vi.fn(), rpc: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: mocks.mode }) }));
vi.mock("@/lib/env", () => ({ hasPublicSupabaseEnvironment: () => true }));
vi.mock("@/lib/supabase/proxy", () => ({ presentationDemoCookie: "demo" }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: mocks.user } }) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: mocks.rpc }) }));
vi.mock("@/features/demo/participant-persistence", () => ({ getParticipantState: mocks.load }));
import { PUT } from "./route";
import { initialDemoState } from "@/features/demo/demo-state";
const userId = "00000000-0000-4000-8000-000000000999";
const request = (body: unknown) => new Request("https://example.test/api/participant-state", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => {
  vi.clearAllMocks(); mocks.mode.mockReturnValue(undefined);
  mocks.user.mockResolvedValue({ data: { user: { id: userId } }, error: null });
  mocks.load.mockResolvedValue({ state: initialDemoState, revision: 1, role: "participant" });
  mocks.rpc.mockResolvedValue({ data: 2, error: null });
});
describe("participant persistence trust boundary", () => {
  it("saves server scores and all progress in one revision-checked transaction", async () => {
    const response = await PUT(request({ participantId: userId, revision: 1, state: { ...initialDemoState, quizAttempts: [{ id: "test", answers: {}, attemptedAt: "2026-09-30T12:00:00Z", scorePercent: 100, passed: true }] } }));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.state.quizAttempts[0]).toMatchObject({ scorePercent: 0, passed: false });
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc.mock.calls[0][0]).toBe("save_participant_state");
    expect(mocks.rpc.mock.calls[0][1]).toMatchObject({ p_participant_id: userId, p_expected_revision: 1, p_progress: [{ status: "in_progress", scorePercent: 0 }, {}, {}, {}] });
  });
  it("rejects a draft belonging to a different account", async () => {
    const result = await PUT(request({ participantId: "someone-else", revision: 1, state: initialDemoState }));
    expect(result.status).toBe(409); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("does not overwrite a concurrent device revision", async () => {
    const result = await PUT(request({ participantId: userId, revision: 0, state: initialDemoState }));
    expect(result.status).toBe(409); expect((await result.json()).conflict).toBe(true); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("rejects anonymous saves and unknown answer IDs", async () => {
    mocks.user.mockResolvedValueOnce({ data: { user: null } });
    expect((await PUT(request({}))).status).toBe(401);
    const result = await PUT(request({ participantId: userId, revision: 1, state: { ...initialDemoState, quizAttempts: [{ answers: { unknown: ["fake"] }, attemptedAt: "2026-09-30" }] } }));
    expect(result.status).toBe(400); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("handles a database conflict without claiming a successful save", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "40001" } });
    const result = await PUT(request({ participantId: userId, revision: 1, state: initialDemoState }));
    expect(result.status).toBe(409); expect((await result.json()).saved).toBeUndefined();
  });
});
