/** A small public-endpoint sample, not an end-to-end availability/SLO result. */
export const productionProbeOrigin = "https://promptshala.vercel.app";
const paths = ["/health", "/api/health"] as const;
type Endpoint = typeof paths[number];
type Failure = "http-error" | "invalid-health" | "body-too-large" | "timeout" | "network-error";
type ProbeFetch = (url: string, init: RequestInit) => Promise<Response>;

class ProbeFailure extends Error {
  readonly outcome: Failure;
  constructor(outcome: Failure) { super(outcome); this.outcome = outcome; }
}

export function validateProbeOrigin(value: string, allowLocal = false) {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Choose the canonical public origin or an explicitly enabled local container origin."); }
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error("Use an origin without credentials, path, query or fragment.");
  if (url.origin === productionProbeOrigin) return { origin: url.origin, environment: "production" } as const;
  const local = allowLocal && url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname)
    && Number(url.port) >= 1024 && Number(url.port) <= 65535;
  if (!local) throw new Error("Only the canonical public origin is allowed; local container checks require an explicit option.");
  return { origin: url.origin, environment: "test" } as const;
}

async function boundedJson(response: Response, signal: AbortSignal): Promise<unknown> {
  const limit = 4096;
  if (!response.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new ProbeFailure("invalid-health");
  if (Number(response.headers.get("content-length")) > limit) {
    void response.body?.cancel().catch(() => undefined);
    throw new ProbeFailure("body-too-large");
  }
  if (!response.body) throw new ProbeFailure("invalid-health");
  const reader = response.body.getReader();
  const abort = () => { void reader.cancel().catch(() => undefined); };
  signal.addEventListener("abort", abort, { once: true });
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (signal.aborted) throw new ProbeFailure("timeout");
      if (next.done) break;
      length += next.value.byteLength;
      if (length > limit) {
        void reader.cancel().catch(() => undefined);
        throw new ProbeFailure("body-too-large");
      }
      chunks.push(next.value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
    catch { throw new ProbeFailure("invalid-health"); }
  } finally { signal.removeEventListener("abort", abort); reader.releaseLock(); }
}

function isExpectedHealth(value: unknown, endpoint: Endpoint, environment: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const health = value as Record<string, unknown>;
  if (health.environment !== environment) return false;
  return endpoint === "/health" ? health.service === "promptshala-web" && health.status === "ok"
    : ["configured", "fallback"].includes(String(health.aiEvaluator)) && ["configured", "not-configured"].includes(String(health.supabase));
}

export async function probeAvailability(origin = productionProbeOrigin, options: { allowLocal?: boolean; timeoutMs?: number; fetcher?: ProbeFetch } = {}) {
  const target = validateProbeOrigin(origin, options.allowLocal);
  const timeoutMs = options.timeoutMs ?? 5000;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 10_000) throw new Error("Use a probe timeout from 100 to 10000 milliseconds.");
  const fetcher: ProbeFetch = options.fetcher ?? fetch;
  const results: { endpoint: Endpoint; healthy: boolean; outcome: "ok" | Failure; status: number | null; durationMs: number }[] = [];
  for (const endpoint of paths) {
    const started = performance.now(), controller = new AbortController();
    let status: number | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new ProbeFailure("timeout")); }, timeoutMs);
    });
    let outcome: "ok" | Failure = "ok";
    try {
      await Promise.race([deadline, (async () => {
        const response = await fetcher(`${target.origin}${endpoint}`, {
          method: "GET", redirect: "error", cache: "no-store", signal: controller.signal,
          headers: { accept: "application/json" },
        });
        status = response.status;
        if (response.status !== 200) { void response.body?.cancel().catch(() => undefined); throw new ProbeFailure("http-error"); }
        if (!isExpectedHealth(await boundedJson(response, controller.signal), endpoint, target.environment)) throw new ProbeFailure("invalid-health");
      })()]);
    } catch (error) {
      outcome = controller.signal.aborted ? "timeout" : error instanceof ProbeFailure ? error.outcome : "network-error";
    } finally { clearTimeout(timer!); }
    results.push({ endpoint, healthy: outcome === "ok", outcome, status, durationMs: Math.max(0, Math.round(performance.now() - started)) });
  }
  return {
    schemaVersion: "availability-probe/1", sampledAt: new Date().toISOString(), origin: target.origin,
    healthy: results.every(result => result.healthy), timeoutMs, endpoints: results,
    interpretation: "Two public endpoint samples only. Configuration flags do not verify Auth, database writes, email, AI or learner journeys. Scheduled sampling is not a measured 99.5% availability result.",
  };
}
