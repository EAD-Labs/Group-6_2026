import { NextResponse } from "next/server";

import {
  defaultCraftEvaluationModel,
  hasGeminiEnvironment,
  hasPublicSupabaseEnvironment,
} from "@/lib/env";

export function GET() {
  return NextResponse.json({
    aiEvaluator: hasGeminiEnvironment() ? "configured" : "fallback",
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
    model: process.env.GEMINI_CRAFT_MODEL ?? defaultCraftEvaluationModel,
    supabase: hasPublicSupabaseEnvironment() ? "configured" : "not-configured",
  });
}
