/** Run with Node 24: node scripts/isolated-load.ts <private fixture.json> <report.json> [iterations=3]
 * Only existing synthetic accounts in a separate staging/test target are used.
 * No account creation/deletion, AI calls, recovery emails or cleanup is performed.
 */
import { readFile, writeFile } from "node:fs/promises";
import { createServerClient } from "@supabase/ssr";
import { requireIsolatedHealth, timingSummary, validateLoadFixture } from "../src/features/operations/load-safety.ts";

const [fixturePath, reportPath, iterationArgument = "3"] = process.argv.slice(2);
const iterations = Number(iterationArgument);
if (!fixturePath || !reportPath || !Number.isSafeInteger(iterations) || iterations < 1 || iterations > 20) throw new Error("Provide a private fixture, output report and 1–20 iterations.");
const fixture = validateLoadFixture(JSON.parse(await readFile(fixturePath, "utf8")));
const healthResponse = await fetch(`${fixture.targetUrl}/api/health`, { redirect: "error", signal: AbortSignal.timeout(10_000) });
if (!healthResponse.ok) throw new Error("The isolated target is unavailable.");
requireIsolatedHealth(await healthResponse.json());

type Sample = { endpoint: string; status: number; durationMs: number };
const samples: Sample[] = [];
async function measure(endpoint: string, cookie: string, method = "GET", body?: unknown) {
  const start = performance.now();
  let status = 0;
  try {
    const response = await fetch(`${fixture.targetUrl}${endpoint}`, {
      method, redirect: "error", signal: AbortSignal.timeout(15_000),
      headers: { cookie, origin: fixture.targetUrl, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}), cache: "no-store",
    });
    status = response.status;
    // Include receipt of the complete response, rather than only first-byte time.
    const text = await response.text();
    if (!response.ok) throw new Error("Workload request failed");
    return response.headers.get("content-type")?.includes("application/json") ? JSON.parse(text) : text;
  } finally {
    samples.push({ endpoint: `${method} ${endpoint}`, status, durationMs: performance.now() - start });
  }
}

// Complete authentication for every distinct user before starting the concurrent
// measured workload. Auth setup is reported separately and is not an API p95.
const authenticationStart = performance.now();
const sessions = await Promise.all(fixture.users.map(async user => {
  const jar = new Map<string, string>();
  const client = createServerClient(fixture.supabaseUrl, fixture.publishableKey, { cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: values => { for (const item of values) jar.set(item.name, item.value); },
  } });
  const { data, error } = await client.auth.signInWithPassword(user);
  if (error || !data.user || !data.session) throw new Error("A synthetic learner could not authenticate; no workload was started.");
  return { participantId: data.user.id, cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; ") };
}));
if (new Set(sessions.map(session => session.participantId)).size !== 25) throw new Error("The fixture did not resolve to 25 distinct learners.");
const authenticationMs = Math.round(performance.now() - authenticationStart);
const startedAt = new Date().toISOString(), workloadStart = performance.now();
const journeys = await Promise.allSettled(sessions.map(async session => {
  for (let iteration = 0; iteration < iterations; iteration++) {
    const current = await measure("/api/participant-state", session.cookie);
    if (current.participantId !== session.participantId || !current.state || !Number.isSafeInteger(current.revision)) throw new Error("The application did not return the synthetic learner's owned state.");
    const saved = await measure("/api/participant-state", session.cookie, "PUT", { participantId: session.participantId, revision: current.revision, state: current.state });
    if (saved.saved !== true || saved.revision !== current.revision + 1) throw new Error("The measured save was not confirmed.");
    const restored = await measure("/api/participant-state", session.cookie);
    if (restored.revision !== saved.revision || restored.participantId !== session.participantId) throw new Error("Read-after-write verification failed.");
    await measure("/api/resources", session.cookie);
    await measure("/api/content?module=1&lesson=meet-generative-ai", session.cookie);
    await measure("/dashboard", session.cookie);
  }
}));
const endpointNames = [...new Set(samples.map(sample => sample.endpoint))];
const report = {
  schemaVersion: "isolated-load/1", startedAt, finishedAt: new Date().toISOString(),
  targetUrl: fixture.targetUrl, databaseHost: new URL(fixture.supabaseUrl).hostname,
  users: 25, iterations, authenticationMs, workloadMs: Math.round(performance.now() - workloadStart),
  completedJourneys: journeys.filter(result => result.status === "fulfilled").length,
  failedJourneys: journeys.filter(result => result.status === "rejected").length,
  overall: timingSummary(samples),
  endpoints: Object.fromEntries(endpointNames.map(endpoint => [endpoint, timingSummary(samples.filter(sample => sample.endpoint === endpoint))])),
  workload: "Concurrent authenticated reads, genuine revision-checked saves, read-after-write verification, private resource/content reads and dashboard HTML.",
  limits: "Synthetic staging-only HTTP workload. No live AI, browser rendering, 4G emulation, full-course completion or client acceptance. No identifiers, credentials, private text or provider bodies in this report.",
};
await writeFile(reportPath, JSON.stringify(report, null, 2), { mode: 0o600 });
console.info(JSON.stringify({ reportSaved: true, users: 25, completedJourneys: report.completedJourneys, failedJourneys: report.failedJourneys }));
if (report.failedJourneys) process.exitCode = 1;
