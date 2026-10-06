export type ModuleSummary = { module: number; status: string; bestScore: number | null };
export type PersonSummary = { id: string; name: string; email: string; role: string; createdAt: string; lastSignInAt: string | null };
export type RosterPerson = PersonSummary & { completedLessons: number; modules: ModuleSummary[]; lastActivityAt: string | null; activeMs: number };
export type ActivityRow = { id: string; kind: string; path: string; target: string | null; module_number: number | null; question_id: string | null; selected_options: string[] | null; correct: boolean | null; active_ms: number; occurred_at: string; attempt_id: string | null; content_version: string | null };
export type LearningDetail = {
  person: PersonSummary; completedLessons: Record<string, string[]> | null; modules: ModuleSummary[];
  pages: { path: string; visits: number; activeMs: number; clicks: number; lastSeenAt: string }[];
  questions: { module: number; questionId: string; contentVersion: string; firstViewedAt: string | null; firstCorrectAt: string | null; wrongChecks: number; checks: number; activeToCorrectMs: number; elapsedToCorrectMs: number | null }[];
  attempts: { id: string; module: number; number: number; score: number; passed: boolean; submittedAt: string; contentVersion: string | null }[];
  events: ActivityRow[]; eventsTotal: number; eventsPage: number;
};
export function duration(ms: number) {
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds}s` : seconds < 3600 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;
}
