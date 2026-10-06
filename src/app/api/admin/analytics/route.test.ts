import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ staff: vi.fn(), rpc: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/platform/server", async () => ({ ...await vi.importActual<typeof import("@/features/platform/server")>("@/features/platform/server"), requireStaff: mocks.staff }));
import { GET } from "./route";
beforeEach(() => { vi.clearAllMocks(); mocks.staff.mockResolvedValue({ user: { id: "admin" }, role: "admin", admin: { rpc: mocks.rpc } }); mocks.rpc.mockResolvedValue({ data: { total: 0, people: [] }, error: null }); });
describe("individual learning reports", () => {
  it("blocks facilitator reads before using privileged queries", async () => {
    mocks.staff.mockResolvedValue({ role: "facilitator", admin: { rpc: mocks.rpc } });
    expect((await GET(new Request("https://example.test/api/admin/analytics"))).status).toBe(403); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("uses the authenticated actor and validates pagination", async () => {
    expect((await GET(new Request("https://example.test/api/admin/analytics?search=Teacher&page=2"))).status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_learning_roster", { p_actor: "admin", p_search: "Teacher", p_page: 2 });
    mocks.rpc.mockClear(); expect((await GET(new Request("https://example.test/api/admin/analytics?page=-1"))).status).toBe(400); expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
