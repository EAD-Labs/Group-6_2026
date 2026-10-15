// @vitest-environment node
import { describe, expect, it } from "vitest";
import { requireIsolatedHealth, timingSummary, validateLoadFixture } from "./load-safety";
const fixture = () => ({ syntheticOnly: true, targetUrl: "https://promptshala-staging.example.test", supabaseUrl: "https://isolated-project.supabase.co", publishableKey: "sb_publishable_isolated_fixture_key", users: Array.from({ length: 25 }, (_, i) => ({ email: `load-learner-${i}@example.test`, password: "synthetic-private-password" })) });
describe("isolated 25-user workload safety", () => {
  it("accepts only 25 distinct synthetic accounts and a publishable credential", () => expect(validateLoadFixture(fixture()).users).toHaveLength(25));
  it.each([
    { targetUrl: "https://promptshala.vercel.app" }, { supabaseUrl: "https://atqbligrqsderauzfrqi.supabase.co" },
    { publishableKey: "sb_secret_never_use_this" }, { publishableKey: "eyJ.legacy-service-role" },
    { syntheticOnly: false }, { targetUrl: "http://public.example.test" }, { targetUrl: "https://user:password@example.test" },
    { targetUrl: "https://example.test?key=private" },
  ])("rejects unsafe configuration before issuing any request: %j", change => expect(() => validateLoadFixture({ ...fixture(), ...change })).toThrow());
  it("rejects duplicate, real or missing accounts", () => {
    const duplicate = fixture(); duplicate.users[1] = duplicate.users[0];
    expect(() => validateLoadFixture(duplicate)).toThrow(/own account/);
    const real = fixture(); real.users[0].email = "teacher@school.example";
    expect(() => validateLoadFixture(real)).toThrow(/load-/);
    expect(() => validateLoadFixture({ ...fixture(), users: [] })).toThrow(/25/);
  });
  it("fails closed for production, previews and unavailable database health", () => {
    expect(() => requireIsolatedHealth({ environment: "production", supabase: "configured" })).toThrow();
    expect(() => requireIsolatedHealth({ environment: "preview", supabase: "configured" })).toThrow();
    expect(() => requireIsolatedHealth({ environment: "staging", supabase: "not-configured" })).toThrow();
    expect(() => requireIsolatedHealth({ environment: "staging", supabase: "configured" })).not.toThrow();
  });
  it("reports actual latency samples and failure counts without inventing measurements", () => {
    expect(timingSummary([])).toEqual({ requests: 0, errors: 0, p50Ms: null, p95Ms: null, maxMs: null });
    expect(timingSummary(Array.from({ length: 20 }, (_, i) => ({ durationMs: (i + 1) * 10, status: i === 0 ? 503 : 200 })))).toEqual({ requests: 20, errors: 1, p50Ms: 100, p95Ms: 190, maxMs: 200 });
  });
});
