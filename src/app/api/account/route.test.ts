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
    mocks.tables.mockImplementation((table: string) => ({ select: () => ({ eq: () => table === "craft_prompt_attempts" || table === "verified_quiz_submissions" ? paged : { data: [], error: null } }) }));
    expect((await GET()).status).toBe(503);
  });
  it("continues past the database's default result page", async () => {
    const paged = { order: vi.fn(), range: vi.fn().mockResolvedValueOnce({ data: Array.from({ length: 1000 }, (_, index) => ({ id: index })), error: null }).mockResolvedValueOnce({ data: [{ id: 1000 }], error: null }) };
    paged.order.mockReturnValue(paged);
    const empty = { order: vi.fn(), range: vi.fn().mockResolvedValue({ data: [], error: null }) }; empty.order.mockReturnValue(empty);
    mocks.tables.mockImplementation((table: string) => ({ select: () => ({ eq: () => table === "craft_prompt_attempts" ? paged : table === "verified_quiz_submissions" ? empty : { data: [], error: null } }) }));
    expect((await (await GET()).json()).craftPrompts).toHaveLength(1001);
    expect(paged.range).toHaveBeenNthCalledWith(1, 0, 999);
    expect(paged.range).toHaveBeenNthCalledWith(2, 1000, 1999);
  });
  it("exports owned grading receipts even before their progress snapshot syncs, including all pages", async () => {
    const ownerFilters: Array<[string, string]> = [];
    const selections = new Map<string, string>();
    const receipt = { attempt_id: "graded-before-sync", pass_threshold: 90, content_version: "assessment:fictional", grading_receipt: { scorePercent: 95, passed: true } };
    const pages = vi.fn().mockResolvedValueOnce({ data: Array.from({ length: 1000 }, () => receipt), error: null }).mockResolvedValueOnce({ data: [receipt], error: null });
    mocks.tables.mockImplementation((table: string) => {
      const result = { data: [], error: null };
      const query = { select: vi.fn((columns: string) => { selections.set(table, columns); return query; }), eq: vi.fn((column: string, value: string) => { ownerFilters.push([column, value]); return query; }), order: vi.fn(() => query), range: table === "verified_quiz_submissions" ? pages : vi.fn().mockResolvedValue(result), then: (resolve: (value: unknown) => void) => resolve(result) };
      return query;
    });
    const response = await GET(), exported = await response.json();
    expect(response.status).toBe(200);
    expect(exported.assessments).toHaveLength(1001);
    expect(exported.assessments[1000]).toEqual(receipt);
    expect(ownerFilters.every(([column, value]) => ["participant_id", "owner_id"].includes(column) && value === "alice")).toBe(true);
    expect(selections.get("certificates")).toContain("assessment_evidence");
    expect(pages).toHaveBeenLastCalledWith(1000, 1999);
  });
});
