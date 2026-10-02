import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ cookie: vi.fn(), user: vi.fn(), profile: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: mocks.cookie }) }));
vi.mock("@/lib/env", () => ({ hasPublicSupabaseEnvironment: () => true }));
vi.mock("@/lib/supabase/proxy", () => ({ presentationDemoCookie: "demo" }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: mocks.user }, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.profile }) }) }) }) }));
import { getAiAccess } from "./access";
beforeEach(() => { vi.resetAllMocks(); mocks.user.mockResolvedValue({ data: { user: { id: "alice" } }, error: null }); });
describe("live AI access", () => {
  it("requires a saved acknowledgement and permits a participant who has accepted", async () => {
    mocks.profile.mockResolvedValue({ data: { safe_use_accepted_at: null }, error: null });
    expect(await getAiAccess()).toEqual({ mode: "consent_required" });
    mocks.profile.mockResolvedValue({ data: { safe_use_accepted_at: "2026-10-02" }, error: null });
    expect(await getAiAccess()).toEqual({ mode: "authenticated", participantId: "alice" });
  });
  it.each([{ data: null, error: { code: "offline" } }, { data: null, error: null }])("does not misreport an unavailable profile as missing consent", async (result) => {
    mocks.profile.mockResolvedValue(result);
    await expect(getAiAccess()).rejects.toThrow("AI access could not be verified.");
  });
});
