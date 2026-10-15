export type LoadFixture = {
  targetUrl: string;
  supabaseUrl: string;
  publishableKey: string;
  syntheticOnly: true;
  users: Array<{ email: string; password: string }>;
};

const productionDatabase = "atqbligrqsderauzfrqi";
export function validateLoadFixture(value: unknown): LoadFixture {
  if (!value || typeof value !== "object") throw new Error("A private isolated-target fixture is required.");
  const raw = value as Record<string, unknown>;
  if (raw.syntheticOnly !== true || typeof raw.targetUrl !== "string" || typeof raw.supabaseUrl !== "string" || typeof raw.publishableKey !== "string") throw new Error("Declare the isolated target and synthetic-only accounts.");
  const target = new URL(raw.targetUrl), database = new URL(raw.supabaseUrl);
  const local = ["127.0.0.1", "localhost", "[::1]"];
  for (const url of [target, database]) {
    if (url.username || url.password || url.search || url.hash || !["", "/"].includes(url.pathname)) throw new Error("Use an origin without credentials or paths.");
    if (url.protocol !== "https:" && !(url.protocol === "http:" && local.includes(url.hostname))) throw new Error("Use HTTPS, or a local-only target.");
  }
  if (target.hostname === "promptshala.vercel.app" || database.hostname.includes(productionDatabase)) throw new Error("Production load testing is prohibited.");
  // A publishable browser credential cannot bypass owner RLS. Reject secret and
  // legacy service-role keys even if the caller labels one as publishable.
  if (!raw.publishableKey.startsWith("sb_publishable_") || raw.publishableKey.length < 20) throw new Error("Use an isolated project's publishable key, never a service credential.");
  if (!Array.isArray(raw.users) || raw.users.length !== 25) throw new Error("Provide exactly 25 distinct synthetic learner accounts.");
  const users = raw.users.map(value => {
    if (!value || typeof value !== "object") throw new Error("Invalid synthetic account.");
    const user = value as Record<string, unknown>;
    if (typeof user.email !== "string" || !/^load-[a-z0-9-]+@example\.test$/i.test(user.email) || typeof user.password !== "string" || user.password.length < 12) throw new Error("Use load-* @example.test accounts with strong private passwords.");
    return { email: user.email.toLowerCase(), password: user.password };
  });
  if (new Set(users.map(user => user.email)).size !== 25) throw new Error("Each virtual learner needs its own account.");
  return { targetUrl: target.origin, supabaseUrl: database.origin, publishableKey: raw.publishableKey, syntheticOnly: true, users };
}

export function requireIsolatedHealth(value: unknown) {
  const health = value as { environment?: unknown; supabase?: unknown } | null;
  if (!health || !["staging", "test"].includes(String(health.environment)) || health.supabase !== "configured") throw new Error("The application must identify itself as staging/test with its isolated database configured.");
}

export function timingSummary(samples: Array<{ durationMs: number; status: number }>) {
  const values = samples.map(item => item.durationMs).sort((a, b) => a - b);
  const percentile = (fraction: number) => values.length ? Math.round(values[Math.max(0, Math.ceil(values.length * fraction) - 1)]) : null;
  return { requests: samples.length, errors: samples.filter(item => item.status < 200 || item.status >= 400).length, p50Ms: percentile(0.5), p95Ms: percentile(0.95), maxMs: values.length ? Math.round(values[values.length - 1]) : null };
}
