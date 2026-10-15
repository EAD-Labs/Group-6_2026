// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { probeAvailability, productionProbeOrigin, validateProbeOrigin } from "./availability";

const headers = { "content-type": "application/json" };
function healthy(url: string) {
  return Response.json(url.endsWith("/api/health") ? { environment: "production", aiEvaluator: "fallback", supabase: "configured" }
    : { environment: "production", service: "promptshala-web", status: "ok" });
}
afterEach(() => vi.useRealTimers());

describe("safe public endpoint availability samples", () => {
  it.each([
    "https://elsewhere.example", "http://promptshala.vercel.app", "https://127.0.0.1", "http://169.254.169.254",
    "https://user:private@promptshala.vercel.app", `${productionProbeOrigin}?token=private`, `${productionProbeOrigin}#private`,
    `${productionProbeOrigin}/api/account`, "not-a-url", "http://localhost:3000",
  ])("rejects a changed/credentialed/private target before any request: %s", async origin => {
    const fetcher = vi.fn();
    await expect(probeAvailability(origin, { fetcher })).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("allows a loopback container only with an explicit option and test environment", async () => {
    expect(validateProbeOrigin("http://127.0.0.1:3000", true)).toEqual({ origin: "http://127.0.0.1:3000", environment: "test" });
    expect(() => validateProbeOrigin("http://localhost:22", true)).toThrow();
    expect(() => validateProbeOrigin("http://192.168.1.1:3000", true)).toThrow();
    const result = await probeAvailability("http://127.0.0.1:3000", { allowLocal: true, fetcher: async url => Response.json({ ...(await healthy(url).json()), environment: "test" }) });
    expect(result.healthy).toBe(true);
  });

  it("records bounded safe status samples without credentials or provider/database claims", async () => {
    const fetcher = vi.fn(async (url: string) => healthy(url));
    const result = await probeAvailability(productionProbeOrigin, { fetcher });
    expect(result.healthy).toBe(true);
    expect(result.endpoints.map(row => [row.endpoint, row.outcome, row.status])).toEqual([["/health", "ok", 200], ["/api/health", "ok", 200]]);
    expect(result.interpretation).toContain("not a measured 99.5%");
    for (const [, request] of fetcher.mock.calls as unknown as [string, RequestInit][]) {
      expect(request).toMatchObject({ method: "GET", redirect: "error", cache: "no-store", headers: { accept: "application/json" } });
      expect(request).not.toHaveProperty("body");
      expect(request).not.toHaveProperty("credentials");
    }
  });

  it("fails unhealthy HTTP responses without reading or logging the private error body", async () => {
    const result = await probeAvailability(productionProbeOrigin, { fetcher: async url => url.endsWith("/api/health") ? healthy(url) : new Response("private token=secret", { status: 503 }) });
    expect(result.healthy).toBe(false);
    expect(result.endpoints[0]).toMatchObject({ outcome: "http-error", status: 503 });
    expect(JSON.stringify(result)).not.toContain("private");
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  it("cannot pass when configuration health has the wrong contract or non-200 status", async () => {
    for (const response of [Response.json({ environment: "production", aiEvaluator: "unexpected", supabase: "configured" }), new Response("{}", { status: 202, headers })]) {
      const result = await probeAvailability(productionProbeOrigin, { fetcher: async url => url.endsWith("/api/health") ? response : healthy(url) });
      expect(result.healthy).toBe(false);
      expect(result.endpoints[0].healthy).toBe(true);
      expect(result.endpoints[1].healthy).toBe(false);
    }
  });

  it.each([
    new Response("not json", { headers }),
    Response.json({ status: "ok", service: "different-service", environment: "production" }),
    Response.json({ status: "ok", service: "promptshala-web", environment: "staging" }),
    new Response("<html>login</html>", { headers: { "content-type": "text/html" } }),
  ])("treats a malformed, protected or wrong-environment endpoint as unhealthy", async response => {
    const result = await probeAvailability(productionProbeOrigin, { fetcher: async url => url.endsWith("/api/health") ? healthy(url) : response });
    expect(result.endpoints[0].outcome).toBe("invalid-health");
    expect(result.healthy).toBe(false);
  });

  it("caps declared and actual body bytes", async () => {
    for (const response of [new Response("{}", { headers: { ...headers, "content-length": "10000000" } }), new Response("x".repeat(4097), { headers })]) {
      const result = await probeAvailability(productionProbeOrigin, { fetcher: async url => url.endsWith("/api/health") ? healthy(url) : response });
      expect(result.endpoints[0].outcome).toBe("body-too-large");
    }
  });

  it("bounds a stalled connection even when a transport ignores cancellation", async () => {
    vi.useFakeTimers();
    const report = probeAvailability(productionProbeOrigin, { timeoutMs: 100, fetcher: () => new Promise(() => undefined) });
    await vi.advanceTimersByTimeAsync(201);
    expect((await report).endpoints.map(row => row.outcome)).toEqual(["timeout", "timeout"]);
  });

  it("also bounds a stalled response body", async () => {
    vi.useFakeTimers();
    const report = probeAvailability(productionProbeOrigin, { timeoutMs: 100, fetcher: async url => url.endsWith("/api/health") ? healthy(url) : new Response(new ReadableStream({ start() { /* Deliberately stalls until cancelled. */ } }), { headers }) });
    await vi.advanceTimersByTimeAsync(101);
    const result = await report;
    expect(result.endpoints[0].outcome).toBe("timeout");
    expect(result.endpoints[1].outcome).toBe("ok");
  });

  it("discards sensitive exception details and rejects unbounded timeout settings", async () => {
    const result = await probeAvailability(productionProbeOrigin, { fetcher: async () => { throw new Error("Authorization: Bearer private-secret"); } });
    expect(result.endpoints.every(row => row.outcome === "network-error")).toBe(true);
    expect(JSON.stringify(result)).not.toMatch(/Authorization|private-secret/);
    const fetcher = vi.fn();
    for (const timeoutMs of [0, 99, 10_001, NaN, Infinity, 5.5]) await expect(probeAvailability(productionProbeOrigin, { timeoutMs, fetcher })).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
