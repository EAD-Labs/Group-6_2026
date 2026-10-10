import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ require: vi.fn(), state: vi.fn(), tables: vi.fn() }));
vi.mock("@/features/platform/server", () => ({ requireParticipant: mocks.require, failure: () => Response.json({ error: "Export unavailable" }, { status: 503 }), json: Response.json, readBody: vi.fn(), RequestError: class extends Error {} }));
vi.mock("@/features/demo/participant-persistence", () => ({ getParticipantState: mocks.state }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
import { GET } from "./route";
beforeEach(() => { vi.clearAllMocks(); mocks.state.mockResolvedValue({ state: { displayName: "Alice" } }); mocks.require.mockResolvedValue({ user: { id: "alice", email: "alice@example.test" }, client: { from: mocks.tables } }); });
describe("account CRAFT export", () => {
  it("includes all owned submitted prompt text and feedback", async () => {
    const result = { data: [{ task_text: "Plan a lesson", prompt_text: "A private fictional prompt", evaluation: { summary: "Feedback" } }], error: null };
    const paged = { order: vi.fn(), range: vi.fn().mockResolvedValue(result) };
    paged.order.mockReturnValue(paged);
    const where = vi.fn().mockImplementation(() => ({ ...result, ...paged }));
    mocks.tables.mockReturnValue({ select: () => ({ eq: where }) });
    const response = await GET(); const exported = await response.json();
    expect(exported.craftPrompts[0]).toMatchObject({ prompt_text: "A private fictional prompt", evaluation: { summary: "Feedback" } });
    expect(mocks.tables).toHaveBeenCalledWith("craft_prompt_attempts");
    expect(where).toHaveBeenCalledWith("participant_id", "alice");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("does not claim a complete export when prompt history is unavailable", async () => {
    const paged = { order: vi.fn(), range: vi.fn().mockResolvedValue({ data: null, error: { message: "Unavailable" } }) };
    paged.order.mockReturnValue(paged);
    mocks.tables.mockImplementation((table: string) => ({ select: () => ({ eq: () => table === "craft_prompt_attempts" ? paged : { data: [], error: null } }) }));
    expect((await GET()).status).toBe(503);
  });
  it("continues past the database's default result page", async () => {
    const paged = { order: vi.fn(), range: vi.fn().mockResolvedValueOnce({ data: Array.from({ length: 1000 }, (_, index) => ({ id: index })), error: null }).mockResolvedValueOnce({ data: [{ id: 1000 }], error: null }) };
    paged.order.mockReturnValue(paged);
    mocks.tables.mockImplementation((table: string) => ({ select: () => ({ eq: () => table === "craft_prompt_attempts" ? paged : { data: [], error: null } }) }));
    expect((await (await GET()).json()).craftPrompts).toHaveLength(1001);
    expect(paged.range).toHaveBeenNthCalledWith(1, 0, 999);
    expect(paged.range).toHaveBeenNthCalledWith(2, 1000, 1999);
  });
});
