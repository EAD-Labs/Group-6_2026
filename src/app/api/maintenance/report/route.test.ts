// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: mocks.rpc }) }));
import { GET } from "./route";
const request = (authorization?: string) => new Request("https://example.test/api/maintenance/report", { headers: authorization ? { authorization } : {} });
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("CRON_SECRET", "private-report-secret"); });
afterEach(() => vi.unstubAllEnvs());
describe("private read-only retention report", () => {
  it.each([undefined, "", "Bearer wrong", "Bearer private-report-secreu"])("rejects an unauthorised request without accessing the database: %s", async value => {
    const response = await GET(request(value));
    expect(response.status).toBe(401); expect(mocks.rpc).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("fails closed when the scheduler secret is not configured", async () => {
    vi.stubEnv("CRON_SECRET", ""); expect((await GET(request("Bearer "))).status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("calls only the read-only report and prevents response caching", async () => {
    const report = { mode: "read_only", deletedRows: 0, policy: { longTermCleanup: "disabled" } };
    mocks.rpc.mockResolvedValue({ data: report, error: null });
    const response = await GET(request("Bearer private-report-secret"));
    expect(response.status).toBe(200); expect(await response.json()).toEqual(report);
    expect(mocks.rpc).toHaveBeenCalledExactlyOnceWith("retention_readiness_report");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("does not leak database diagnostics or claim a report on failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "private database information" } });
    const response = await GET(request("Bearer private-report-secret"));
    expect(response.status).toBe(503); expect(await response.text()).not.toContain("private database information");
  });
});
