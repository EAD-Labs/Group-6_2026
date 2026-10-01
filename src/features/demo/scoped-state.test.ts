import { describe, expect, it } from "vitest";
import { initialDemoState } from "./demo-state";
import { mergeParticipantStates, readScopedState, writeScopedState } from "./scoped-state";

describe("account-scoped offline state", () => {
  it("never falls back to another participant or demo data", () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    writeScopedState(storage, "participant:alice", { state: { ...initialDemoState, displayName: "Alice" }, baseline: initialDemoState, revision: 1, pending: true });
    expect(readScopedState(storage, "participant:bob")).toBeNull();
    expect(readScopedState(storage, "demo")).toBeNull();
    expect(readScopedState(storage, "participant:alice")?.state.displayName).toBe("Alice");
  });
  it("merges offline edits with progress saved on another device", () => {
    const base = initialDemoState;
    const local = { ...base, displayName: "Revised locally", completedLessonSlugs: ["meet-generative-ai"] };
    const remote = { ...base, institution: "Remote school", completedLessonSlugs: ["review-before-use"] };
    const { state: result } = mergeParticipantStates(base, local, remote);
    expect(result.displayName).toBe("Revised locally");
    expect(result.institution).toBe("Remote school");
    expect(result.completedLessonSlugs).toEqual(["review-before-use", "meet-generative-ai"]);
  });
  it("reports inaccessible storage without losing in-memory work", () => {
    expect(readScopedState({ getItem: () => { throw new Error("blocked"); } }, "demo")).toBeNull();
    expect(writeScopedState({ setItem: () => { throw new Error("full"); } }, "demo", { state: initialDemoState, baseline: initialDemoState, revision: 0, pending: false })).toBe(false);
  });
});

describe("concurrent assistant evidence", () => {
  const assistant = { id: "00000000-0000-4000-8000-000000000999", name: "Teacher assistant", purpose: "Original purpose", persona: "Teacher", task: "Draft questions", context: "Class 6", format: "Table", boundaries: "No personal data", reviewChecks: "Check facts", weakness: "", revision: "", tests: [], versions: [], updatedAt: "2026-10-01" };
  const base = { ...initialDemoState, assistants: [assistant] };
  const test = (id: string) => ({ id, version: 1, input: id, output: "Observed response", review: "Reviewed response", createdAt: "2026-10-01" });
  it("retains two independently added tests and unrelated remote Passport edits", () => {
    const local = { ...base, assistants: [{ ...assistant, weakness: "Local analysis", tests: [test("local-case")] }] };
    const remote = { ...base, assistants: [{ ...assistant, purpose: "Remote revised purpose", tests: [test("remote-case")] }] };
    const { state, conflicts } = mergeParticipantStates(base, local, remote);
    expect(state.assistants[0]).toMatchObject({ purpose: "Remote revised purpose", weakness: "Local analysis" });
    expect(state.assistants[0].tests.map(value => value.id)).toEqual(["remote-case", "local-case"]);
    expect(conflicts).toEqual([]);
  });
  it("requires an explicit choice for edits to the same field and persists both choices", () => {
    const merged = mergeParticipantStates(base, { ...base, assistants: [{ ...assistant, purpose: "Local edit" }] }, { ...base, assistants: [{ ...assistant, purpose: "Remote edit" }] });
    expect(merged.conflicts).toEqual([expect.objectContaining({ field: "purpose", localValue: "Local edit", remoteValue: "Remote edit" })]);
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    writeScopedState(storage, "participant:alice", { state: merged.state, baseline: base, revision: 2, pending: true, conflicts: merged.conflicts });
    expect(readScopedState(storage, "participant:alice")?.conflicts).toEqual(merged.conflicts);
  });
  it("preserves independently captured versions and rebases the local tests", () => {
    const entry = (name: string) => ({ version: 2, at: "2026-10-01", note: "Revised", snapshot: { name, purpose: "Draft", persona: "Teacher", task: "Questions", context: "Class", format: "Table", boundaries: "Safe", reviewChecks: "Verify" } });
    const merged = mergeParticipantStates(base,
      { ...base, assistants: [{ ...assistant, version: 2, versions: [entry("Local")], tests: [{ ...test("local-case"), version: 2 }] }] },
      { ...base, assistants: [{ ...assistant, version: 2, versions: [entry("Remote")], tests: [{ ...test("remote-case"), version: 2 }] }] });
    expect(merged.state.assistants[0].versions?.map(value => value.snapshot?.name)).toEqual(["Remote", "Local"]);
    expect(merged.state.assistants[0].tests.map(value => [value.id, value.version])).toEqual([["remote-case", 2], ["local-case", 3]]);
  });
  it("does not resurrect an unchanged assistant removed on another device", () => {
    expect(mergeParticipantStates(base, base, { ...base, assistants: [] }).state.assistants).toEqual([]);
  });
});
