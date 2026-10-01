import { initialDemoState, type AssistantSpec, type DemoState, type QuizAttempt } from "./demo-state";
import { sanitizeDemoState } from "./server-state";

export type AssistantMergeConflict = {
  id: string; assistantId: string; assistantName: string;
  field: keyof AssistantSpec | "presence";
  localValue: string | number | boolean | null; remoteValue: string | number | boolean | null;
};
export type CachedParticipantState = { state: DemoState; baseline: DemoState; revision: number; pending: boolean; conflicts?: AssistantMergeConflict[] };
export const participantStorageKey = (scope: string) => `promptshala:state:v2:${scope}`;

export function readScopedState(storage: Pick<Storage, "getItem">, scope: string): CachedParticipantState | null {
  try {
    const input = JSON.parse(storage.getItem(participantStorageKey(scope)) ?? "null");
    if (!input || !Number.isSafeInteger(input.revision) || input.revision < 0) return null;
    const state = sanitizeDemoState(input.state), baseline = sanitizeDemoState(input.baseline);
    const conflicts = Array.isArray(input.conflicts) ? input.conflicts.filter((value: unknown): value is AssistantMergeConflict => {
      if (!value || typeof value !== "object") return false;
      const entry = value as AssistantMergeConflict;
      const scalar = (item: unknown) => item === null || ["string", "number", "boolean"].includes(typeof item);
      return typeof entry.id === "string" && typeof entry.assistantId === "string" && typeof entry.assistantName === "string" &&
        ["presence", ...assistantFields, "deletedAt"].includes(entry.field) && scalar(entry.localValue) && scalar(entry.remoteValue);
    }) : [];
    return { state, baseline, revision: input.revision, pending: input.pending === true, conflicts };
  } catch { return null; }
}

export function writeScopedState(storage: Pick<Storage, "setItem">, scope: string, value: CachedParticipantState) {
  try { storage.setItem(participantStorageKey(scope), JSON.stringify(value)); return true; }
  catch { return false; }
}

const attemptKey = (attempt: QuizAttempt) => attempt.id ?? `${attempt.attemptedAt}:${JSON.stringify(attempt.answers)}`;
const equal = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const assistantFields = ["name", "purpose", "persona", "task", "context", "format", "boundaries", "reviewChecks", "creatorCredit", "optionalInputs", "toolsPermitted", "clarificationRule", "stopRule", "sharingScope", "sourcePack", "classContextCard", "handoffNotes", "reuseDiary", "rehearsalTranscript", "revisedQuestion", "weakness", "revision", "improvementApproach", "version"] as const;
const contentChanged = (value: AssistantSpec, before: AssistantSpec) => assistantFields.some(field => !equal(value[field], before[field])) || !equal(value.tests, before.tests) || !equal(value.versions, before.versions);

function mergeAssistant(before: AssistantSpec | undefined, local: AssistantSpec, remote: AssistantSpec, conflicts: AssistantMergeConflict[]): AssistantSpec {
  // Saved records are append-only. Preserve the server's record if an old ID is
  // edited locally; each new reviewed run has a separate ID.
  const tests = new Map([...(before?.tests ?? []), ...remote.tests].map(test => [test.id, test]));
  const versions = new Map([...(before?.versions ?? []), ...(remote.versions ?? [])].map(version => [version.version, version]));
  let nextVersion = Math.max(local.version ?? 1, remote.version ?? 1, ...versions.keys(), ...(local.versions ?? []).map(version => version.version));
  const remapped = new Map<number, number>();
  for (const version of local.versions ?? []) {
    const saved = versions.get(version.version);
    if (!saved) versions.set(version.version, version);
    else if (!before?.versions?.some(item => item.version === version.version) && !equal(saved.snapshot, version.snapshot)) {
      // Two devices may independently create v2. Keep both instruction histories
      // and rebase only this device's new tests onto its new version number.
      const number = ++nextVersion;
      remapped.set(version.version, number);
      versions.set(number, { ...version, version: number });
    }
  }
  for (const test of local.tests) if (!tests.has(test.id)) tests.set(test.id, { ...test, version: remapped.get(test.version ?? 1) ?? test.version });
  const rebased = { ...local, version: remapped.get(local.version ?? 1) ?? local.version };
  const result = { ...remote, tests: [...tests.values()], versions: [...versions.values()].sort((a, b) => a.version - b.version) };
  function conflict(field: AssistantMergeConflict["field"], localValue: AssistantMergeConflict["localValue"], remoteValue: AssistantMergeConflict["remoteValue"]) {
    conflicts.push({ id: `${local.id}:${field}`, assistantId: local.id, assistantName: local.name || remote.name, field, localValue, remoteValue });
  }
  for (const field of assistantFields) {
    const localChanged = !equal(rebased[field], before?.[field]);
    if (localChanged) {
      Object.assign(result, { [field]: rebased[field] });
      if (!equal(remote[field], before?.[field]) && !equal(rebased[field], remote[field])) conflict(field, rebased[field] ?? null, remote[field] ?? null);
    }
  }
  const localDeleted = Boolean(local.deletedAt), remoteDeleted = Boolean(remote.deletedAt);
  const localDeletionChanged = localDeleted !== Boolean(before?.deletedAt), remoteDeletionChanged = remoteDeleted !== Boolean(before?.deletedAt);
  if (localDeleted === remoteDeleted) result.deletedAt = local.deletedAt || remote.deletedAt;
  else if (before && ((localDeletionChanged && contentChanged(remote, before)) || (remoteDeletionChanged && contentChanged(local, before)))) {
    result.deletedAt = local.deletedAt;
    conflict("deletedAt", local.deletedAt ?? null, remote.deletedAt ?? null);
  } else result.deletedAt = localDeletionChanged ? local.deletedAt : remote.deletedAt;
  result.updatedAt = local.updatedAt > remote.updatedAt ? local.updatedAt : remote.updatedAt;
  return result;
}

export function resolveAssistantConflict(state: DemoState, conflict: AssistantMergeConflict, choice: "local" | "remote"): DemoState {
  const value = choice === "local" ? conflict.localValue : conflict.remoteValue;
  if (conflict.field === "presence") return value ? state : { ...state, assistants: state.assistants.filter(item => item.id !== conflict.assistantId) };
  return { ...state, assistants: state.assistants.map(assistant => assistant.id !== conflict.assistantId ? assistant : { ...assistant, [conflict.field]: value ?? undefined }) };
}

// Three-way merge preserves remote fields unless this device changed them. Completed
// activities and immutable attempts accumulate; assistant tombstones remain explicit.
export function mergeParticipantStates(baseline: DemoState, local: DemoState, remote: DemoState): { state: DemoState; conflicts: AssistantMergeConflict[] } {
  const result = { ...remote };
  const conflicts: AssistantMergeConflict[] = [];
  for (const key of Object.keys(initialDemoState) as Array<keyof DemoState>) {
    if (JSON.stringify(local[key]) !== JSON.stringify(baseline[key])) {
      Object.assign(result, { [key]: local[key] });
    }
  }
  for (const key of ["completedLessonSlugs", "moduleTwoCompletedLessonIds", "moduleThreeCompletedLessonIds", "moduleFourCompletedLessonIds"] as const) {
    result[key] = [...new Set([...remote[key], ...local[key]])];
  }
  for (const key of ["quizAttempts", "moduleTwoQuizAttempts", "moduleThreeQuizAttempts", "moduleFourQuizAttempts"] as const) {
    const attempts = new Map(local[key].map((attempt) => [attemptKey(attempt), attempt]));
    remote[key].forEach((attempt) => attempts.set(attemptKey(attempt), attempt));
    result[key] = [...attempts.values()];
  }
  result.assistants = [];
  const ids = new Set([...remote.assistants, ...local.assistants, ...baseline.assistants].map(item => item.id));
  for (const id of ids) {
    const before = baseline.assistants.find(item => item.id === id), mine = local.assistants.find(item => item.id === id), theirs = remote.assistants.find(item => item.id === id);
    if (mine && theirs) result.assistants.push(mergeAssistant(before, mine, theirs, conflicts));
    else if (mine || theirs) {
      const remaining = (mine ?? theirs)!;
      if (!before) result.assistants.push(remaining);
      else if (contentChanged(remaining, before) || remaining.deletedAt !== before.deletedAt) {
        result.assistants.push(remaining);
        conflicts.push({ id: `${id}:presence`, assistantId: id, assistantName: remaining.name, field: "presence", localValue: Boolean(mine), remoteValue: Boolean(theirs) });
      }
      // An unchanged copy must not resurrect an intentional deletion.
    }
  }
  result.lessonEvidence = { ...remote.lessonEvidence, ...Object.fromEntries(Object.entries(local.lessonEvidence)
    .filter(([id, value]) => value !== baseline.lessonEvidence[id])) };
  result.craftPracticeCount = Math.max(local.craftPracticeCount, remote.craftPracticeCount);
  return { state: result, conflicts };
}
