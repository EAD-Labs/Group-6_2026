import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ participant: vi.fn(), rpc: vi.fn(), tables: vi.fn(), select: vi.fn(), filter: vi.fn(), not: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/platform/server", async () => ({ ...await vi.importActual<typeof import("@/features/platform/server")>("@/features/platform/server"), requireParticipant: mocks.participant }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: mocks.rpc, from: mocks.tables }) }));
import { POST } from "./route";
import { baseAssessment } from "@/features/content-authoring/server-assessment-releases";
const id = "10000000-0000-4000-8000-000000000001";
const body = { participantId: id, events: [{ id, sessionId: id, kind: "page_view", path: "/dashboard", activeMs: 0, occurredAt: new Date().toISOString() }] };
const request = (value: unknown, origin = "https://example.test") => new Request("https://example.test/api/activity", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(value) });
beforeEach(() => {
  vi.clearAllMocks(); mocks.participant.mockResolvedValue({ user: { id } }); mocks.rpc.mockResolvedValue({ data: 1, error: null });
  const query = { select: mocks.select, in: mocks.filter, not: mocks.not };
  mocks.tables.mockReturnValue(query); mocks.select.mockReturnValue(query); mocks.filter.mockReturnValue(query); mocks.not.mockResolvedValue({ data: [], error: null });
});
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
  it("grades a queued archived release using trusted published history", async () => {
    const releaseId = "70000000-0000-4000-8000-000000000001";
    mocks.not.mockResolvedValue({ data: [{ id: releaseId, module_number: 1, title: "Earlier released check", questions: [{ ...baseAssessment(1).questions[0], correctOptionIds: ["a"] }], pass_threshold: 80, version: 1, status: "archived", published_at: "2026-10-13T10:00:00Z" }], error: null });
    const event = { ...body.events[0], kind: "question_answer", module: 1, path: "/learn/module-1/quiz", attemptId: id, questionId: "m1-q1", selectedOptions: ["a"], contentVersion: `assessment:${releaseId}`, correct: false };
    expect((await POST(request({ ...body, events: [event] }))).status).toBe(200);
    expect(mocks.filter).toHaveBeenCalledWith("id", [releaseId]);
    expect(mocks.filter).toHaveBeenCalledWith("status", ["published", "archived"]);
    expect(mocks.not).toHaveBeenCalledWith("published_at", "is", null);
    expect(mocks.rpc.mock.calls[0][1].p_events[0]).toMatchObject({ correct: true, contentVersion: `assessment:${releaseId}` });
  });
  it("does not save unknown drafts, cross-module releases or unavailable lookup results", async () => {
    const event = { ...body.events[0], kind: "quiz_submit", module: 1, path: "/learn/module-1/quiz", attemptId: id, contentVersion: "assessment:70000000-0000-4000-8000-000000000001" };
    expect((await POST(request({ ...body, events: [event] }))).status).toBe(400); expect(mocks.rpc).not.toHaveBeenCalled();
    mocks.not.mockResolvedValue({ data: null, error: { message: "Private database diagnostic" } });
    const response = await POST(request({ ...body, events: [event] }));
    expect(response.status).toBe(503); expect(await response.text()).not.toContain("Private database diagnostic"); expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
