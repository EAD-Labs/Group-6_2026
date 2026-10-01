import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ update: vi.fn(), insert: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn(), from: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/platform/server", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/features/platform/server")>(),
  requireParticipant: async () => ({ user: { id: "10000000-0000-4000-8000-000000000001" }, client: { from: mocks.from } }),
}));
import { POST } from "./route";
const id = "20000000-0000-4000-8000-000000000001";
const input = { title: "Fictional science notes", audience: "Class 6", objective: "Explain how evaporation changes water.", source: "Water can change from liquid into water vapour. This fictional teacher-authored passage supports a simple classroom observation and invites careful comparison.", format: "summary", permission: "own", safe: true, draft: "A reviewed classroom draft about evaporation." };
const request = (body: Record<string, unknown>) => new Request("https://example.test/api/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => {
  vi.clearAllMocks();
  const query = { update: mocks.update, insert: mocks.insert, eq: mocks.eq, select: mocks.select, single: mocks.single };
  for (const fn of [mocks.from, mocks.update, mocks.insert, mocks.eq, mocks.select]) fn.mockReturnValue(query);
  mocks.single.mockResolvedValue({ data: { id, expires_at: "2026-10-31" }, error: null });
});
describe("private resource writes", () => {
  it("retains the teaching brief and sets ownership only on insert", async () => {
    expect((await POST(request(input))).status).toBe(200);
    expect(mocks.insert.mock.calls[0][0]).toMatchObject({ audience: input.audience, objective: input.objective, owner_id: "10000000-0000-4000-8000-000000000001" });
  });
  it("updates only granted resource columns and explicitly scopes the owner", async () => {
    expect((await POST(request({ ...input, id }))).status).toBe(200);
    expect(mocks.update.mock.calls[0][0]).toMatchObject({ audience: input.audience, objective: input.objective });
    expect(mocks.update.mock.calls[0][0]).not.toHaveProperty("owner_id");
    expect(mocks.update.mock.calls[0][0]).not.toHaveProperty("expires_at");
    expect(mocks.eq).toHaveBeenCalledWith("owner_id", "10000000-0000-4000-8000-000000000001");
  });
});
