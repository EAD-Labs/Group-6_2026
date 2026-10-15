import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Aggregate planning report only. This endpoint never invokes cleanup. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const expected = Buffer.from(`Bearer ${secret ?? ""}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  const headers = { "Cache-Control": "private, no-store" };
  if (!secret || expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401, headers });
  }
  try {
    const { data, error } = await createAdminClient().rpc("retention_readiness_report");
    if (error || !data) throw new Error("Report unavailable");
    return NextResponse.json(data, { headers });
  } catch {
    return NextResponse.json({ error: "The report could not be prepared. Check service configuration." }, { status: 503, headers });
  }
}
