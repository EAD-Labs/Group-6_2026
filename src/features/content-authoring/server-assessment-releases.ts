import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { assessmentVersion } from "@/features/demo/server-assessment";
import { baseAssessmentBanks, resolveRelease, type AssessmentRelease, type ResolvedAssessment } from "./assessment-release";

export function baseAssessment(moduleNumber: number): ResolvedAssessment {
  const questions = baseAssessmentBanks[moduleNumber - 1];
  return { module: moduleNumber, title: `Module ${moduleNumber} knowledge check`, questions, passThresholdPercent: 70, contentVersion: `${assessmentVersion}:${createHash("sha256").update(JSON.stringify(questions)).digest("hex").slice(0, 16)}` };
}
export async function resolveCurrentAssessments(client: SupabaseClient): Promise<ResolvedAssessment[]> {
  const { data, error } = await client.from("assessment_releases").select("id,module_number,title,questions,pass_threshold,version,status").eq("status", "published");
  if (error) throw new Error("The current knowledge check releases could not be loaded.");
  return baseAssessmentBanks.map((_, index) => { const row = (data as AssessmentRelease[] ?? []).find(release => release.module_number === index + 1); return row ? resolveRelease(row) : baseAssessment(index + 1); });
}
