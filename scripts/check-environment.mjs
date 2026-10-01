import { existsSync } from "node:fs";
for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);
const checks = [
  ["Supabase URL", Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)],
  ["Supabase publishable key", Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)],
  ["Trusted server data key", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)],
  ["Daily cleanup secret", Boolean(process.env.CRON_SECRET)],
  ["Recovery site URL", Boolean(process.env.NEXT_PUBLIC_SITE_URL)],
];
for (const [name, present] of checks) console.log(`${present ? "READY" : "MISSING"}  ${name}`);
console.log(`${process.env.GEMINI_API_KEY ? "CONFIGURED" : "OPTIONAL / FALLBACK"}  Gemini`);
console.log("Presence checks do not verify credentials, migrations or live connectivity. Values are never printed.");
if (process.argv.includes("--strict") && checks.some(([,present]) => !present)) process.exitCode = 1;
