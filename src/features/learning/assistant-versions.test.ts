import { describe, expect, it } from "vitest";
import type { AssistantSpec } from "@/features/demo/demo-state";
import { appendPassportVersion, captureTestVersion, exportPassportVersions, passportHasUnversionedChanges, savedPassport } from "./assistant-versions";

const draft: AssistantSpec = {
  id: "assistant", version: 1, versions: [], name: "Exit ticket helper", purpose: "Draft reviewable exit questions",
  persona: "Teacher planning partner", task: "Draft three questions", context: "Require objective and class",
  format: "Separate questions and answers", boundaries: "Do not invent sources", reviewChecks: "Check every answer",
  weakness: "The source boundary needs a stopping rule", revision: "Ask for a source when it is missing",
  tests: [], updatedAt: "2026-10-01T00:00:00Z",
};

describe("retained assistant instruction versions", () => {
  it("keeps version 1 unchanged when the teacher edits and saves version 2", () => {
    const first = captureTestVersion(draft, "2026-10-01T00:00:00Z");
    const edited = { ...first, boundaries: "Use only supplied text and stop when evidence is missing" };
    expect(passportHasUnversionedChanges(edited)).toBe(true);
    expect(savedPassport(edited)?.boundaries).toBe("Do not invent sources");
    const second = appendPassportVersion(edited, "2026-10-01T01:00:00Z");
    expect(second.version).toBe(2);
    expect(second.versions?.[0].snapshot?.boundaries).toBe("Do not invent sources");
    expect(second.versions?.[1].snapshot?.boundaries).toBe(edited.boundaries);
    expect(passportHasUnversionedChanges(second)).toBe(false);
    expect(exportPassportVersions(second)).toContain("### Version 1");
    expect(exportPassportVersions(second)).toContain("### Version 2");
    expect(exportPassportVersions(second)).toContain("boundaries: Do not invent sources");
  });

  it("does not reconstruct missing legacy instructions from the current draft", () => {
    const legacy: AssistantSpec = { ...draft, tests: [{ id: "old", version: 1, input: "Old input", output: "Old output", review: "Reviewed", createdAt: "2026-09-01" }] };
    expect(captureTestVersion(legacy, "2026-10-01")).toBe(legacy);
    const legacyNote: AssistantSpec = { ...draft, versions: [{ version: 1, at: "2026-09-01", note: "Old version without a snapshot" }] };
    expect(captureTestVersion(legacyNote, "2026-10-01")).toBe(legacyNote);
    expect(exportPassportVersions(legacy)).toContain("Historical instruction snapshot unavailable");
    const next = appendPassportVersion(legacy, "2026-10-01");
    expect(next.versions).toHaveLength(1);
    expect(next.versions?.[0].version).toBe(2);
    expect(exportPassportVersions(next)).toContain("### Version 1\nNo version note recorded.\nHistorical instruction snapshot unavailable");
  });
});
