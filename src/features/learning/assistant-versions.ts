import type { AssistantPassportSnapshot, AssistantSpec } from "@/features/demo/demo-state";

export const passportSnapshotFields = ["name", "purpose", "persona", "task", "context", "format", "boundaries", "reviewChecks", "creatorCredit", "optionalInputs", "toolsPermitted", "clarificationRule", "stopRule", "sharingScope"] as const;

export function snapshotPassport(assistant: AssistantSpec): AssistantPassportSnapshot {
  return Object.fromEntries(passportSnapshotFields.map(field => [field, assistant[field] ?? ""])) as AssistantPassportSnapshot;
}

export function savedPassport(assistant: AssistantSpec) {
  return assistant.versions?.find(item => item.version === (assistant.version ?? 1))?.snapshot;
}

export function passportHasUnversionedChanges(assistant: AssistantSpec) {
  const saved = savedPassport(assistant);
  return Boolean(saved && passportSnapshotFields.some(field => (saved[field] ?? "") !== (assistant[field] ?? "")));
}

/** Freeze the current instructions before its first run. Never reconstruct legacy history. */
export function captureTestVersion(assistant: AssistantSpec, at: string): AssistantSpec {
  const version = assistant.version ?? 1;
  if (assistant.versions?.some(item => item.version === version) || assistant.tests.some(test => (test.version ?? 1) === version)) return assistant;
  const entry = { version, at, note: "Instructions retained when this version was first tested.", snapshot: snapshotPassport(assistant) };
  const versions = assistant.versions ?? [];
  return { ...assistant, versions: [...versions.filter(item => item.version !== version), entry] };
}

export function appendPassportVersion(assistant: AssistantSpec, at: string): AssistantSpec {
  const version = Math.max(assistant.version ?? 1, ...(assistant.versions ?? []).map(item => item.version)) + 1;
  return { ...assistant, version, versions: [...(assistant.versions ?? []), { version, at, note: assistant.revision.trim(), snapshot: snapshotPassport(assistant) }] };
}

export function exportPassportVersions(assistant: AssistantSpec) {
  const numbers = [...new Set([assistant.version ?? 1, ...(assistant.versions ?? []).map(item => item.version), ...assistant.tests.map(test => test.version ?? 1)])].sort((a, b) => a - b);
  return numbers.map(version => {
    const entry = assistant.versions?.find(item => item.version === version);
    return `### Version ${version}\n${entry?.note ?? "No version note recorded."}\n${entry?.snapshot ? passportSnapshotFields.map(field => `${field}: ${entry.snapshot![field] ?? ""}`).join("\n") : "Historical instruction snapshot unavailable. The current draft must not be treated as this version's instructions."}`;
  }).join("\n\n");
}
