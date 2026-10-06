import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ signUp: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
vi.mock("@/lib/env", () => ({ hasPublicSupabaseEnvironment: () => true }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { signUp: mocks.signUp } }) }));
import { signUp } from "./actions";
function form() { const value = new FormData(); Object.entries({ name: "Teacher", email: "TEACHER@example.com", password: "A long pilot password", confirmation: "A long pilot password", acknowledgement: "on", role: "admin" }).forEach(([key, entry]) => value.set(key, entry)); return value; }
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test"); });
describe("public signup action", () => {
  it("creates only participant metadata and routes an immediate session to onboarding", async () => {
    mocks.signUp.mockResolvedValue({ data: { session: { access_token: "test" } }, error: null });
    await expect(signUp(form())).rejects.toThrow("redirect:/onboarding/safe-use");
    expect(mocks.signUp).toHaveBeenCalledWith({ email: "teacher@example.com", password: "A long pilot password", options: { emailRedirectTo: "https://example.test/auth/callback?next=/onboarding/safe-use", data: { display_name: "Teacher" } } });
  });
  it("supports confirmation mode without claiming an authenticated session", async () => {
    mocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
    await expect(signUp(form())).rejects.toThrow("redirect:/sign-up?sent=1");
  });
  it("keeps failures explicit and prevents invalid submissions", async () => {
    mocks.signUp.mockResolvedValue({ data: {}, error: { status: 429 } });
    await expect(signUp(form())).rejects.toThrow("redirect:/sign-up?error=rate");
    mocks.signUp.mockClear(); const invalid = form(); invalid.set("confirmation", "different");
    await expect(signUp(invalid)).rejects.toThrow("redirect:/sign-up?error=confirmation"); expect(mocks.signUp).not.toHaveBeenCalled();
  });
});
