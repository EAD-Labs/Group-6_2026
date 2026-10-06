import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ participant: vi.fn(), rpc: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/platform/server", async () => ({ ...await vi.importActual<typeof import("@/features/platform/server")>("@/features/platform/server"), requireParticipant: mocks.participant }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: mocks.rpc }) }));
import { POST } from "./route";
const id = "10000000-0000-4000-8000-000000000001";
const body = { participantId: id, events: [{ id, sessionId: id, kind: "page_view", path: "/dashboard", activeMs: 0, occurredAt: new Date().toISOString() }] };
const request = (value: unknown, origin = "https://example.test") => new Request("https://example.test/api/activity", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(value) });
beforeEach(() => { vi.clearAllMocks(); mocks.participant.mockResolvedValue({ user: { id } }); mocks.rpc.mockResolvedValue({ data: 1, error: null }); });
describe("activity ingestion", () => {
  it("uses the verified account identity", async () => { expect((await POST(request(body))).status).toBe(200); expect(mocks.rpc.mock.calls[0][1].p_participant).toBe(id); });
  it("rejects another account queue and cross-site requests before writing", async () => {
    expect((await POST(request({ ...body, participantId: "another" }))).status).toBe(409);
    expect((await POST(request(body, "https://foreign.test"))).status).toBe(403); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("does not claim a save when rate-limited", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "P0001" } });
    expect((await POST(request(body))).status).toBe(429);
  });
});
