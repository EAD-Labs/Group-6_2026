/** Node 24: node scripts/probe-availability.ts <report.json> [--local-origin http://127.0.0.1:3000] */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { probeAvailability, productionProbeOrigin } from "../src/features/operations/availability.ts";

try {
  const args = process.argv.slice(2);
  const reportPath = args[0];
  const local = args.length === 3 && args[1] === "--local-origin";
  if (!reportPath?.endsWith(".json") || (!local && args.length !== 1)) throw new Error("Invalid arguments");
  const report = await probeAvailability(local ? args[2] : productionProbeOrigin, { allowLocal: local });
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  console.info(JSON.stringify({ reportSaved: true, healthy: report.healthy, sampleCount: report.endpoints.length }));
  if (!report.healthy) process.exitCode = 1;
} catch {
  // Raw errors/arguments may contain URLs or local paths; never print them.
  console.error(JSON.stringify({ reportSaved: false, healthy: false, outcome: "invalid-input-or-report-write" }));
  process.exitCode = 1;
}
