import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ require: vi.fn(), query: { select: vi.fn(), eq: vi.fn(), not: vi.fn(), order: vi.fn(), limit: vi.fn() } }));
vi.mock("@/features/platform/server", () => ({
  requireParticipant: mocks.require,
  json: (value: unknown) => Response.json(value, { headers: { "Cache-Control": "no-store" } }),
  failure: () => Response.json({ error: "Unavailable" }, { status: 503 }),
}));
import { GET } from "./route";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.require.mockResolvedValue({ user: { id: "alice" }, client: { from: () => mocks.query } });
  mocks.query.select.mockReturnValue(mocks.query); mocks.query.eq.mockReturnValue(mocks.query);
  mocks.query.not.mockReturnValue(mocks.query); mocks.query.order.mockReturnValue(mocks.query);
});
describe("saved CRAFT prompt retrieval", () => {
  it("filters by the verified account and returns only the latest text records", async () => {
    mocks.query.limit.mockResolvedValue({ data: [{ id: "one", prompt_text: "A private fictional prompt" }], error: null });
    const response = await GET();
    expect(mocks.query.eq).toHaveBeenCalledWith("participant_id", "alice");
    expect(mocks.query.not).toHaveBeenCalledWith("prompt_text", "is", null);
    expect(mocks.query.limit).toHaveBeenCalledWith(20);
    expect((await response.json()).attempts).toHaveLength(1);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("reports database failures rather than an empty history", async () => {
    mocks.query.limit.mockResolvedValue({ data: null, error: { message: "Migration missing" } });
    expect((await GET()).status).toBe(503);
  });
});
