import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "unknown",
    service: "promptshala-web",
    status: "ok",
  });
}
