import { describe, expect, it } from "vitest";
import { buildSourceScaffold, exportTransformation, sourcePassages, transformationFormats, transformationReview, validateTransformation } from "./transformer";
describe("source-preserving transformation", () => {
  it("does not discard the beginning of a long unbroken source token", () => {
    const source = `BEGIN${"a".repeat(4000)}END`;
    const passages = sourcePassages(source);
    expect(passages.map((entry) => entry.text).join("")).toBe(source);
    expect(passages.every((entry) => entry.text.length <= 1800)).toBe(true);
  });
  it("retains all words and stable labels across paragraph boundaries", () => {
    const source = `${"evidence observation ".repeat(180)}\n\nA second source paragraph.`;
    const passages = sourcePassages(source);
    expect(passages.map((entry) => entry.text).join(" ").split(/\s+/)).toEqual(source.trim().split(/\s+/));
    expect(passages.map((entry) => entry.id)).toEqual(passages.map((_, index) => `S${index + 1}`));
  });
  it("requires permission and a privacy acknowledgement before preparing a scaffold", () => {
    const input = { title: "Teacher notes", audience: "Class 6", objective: "Explain changes using observation.", source: "A fictional teacher-owned source containing enough material for a useful classroom exercise without identifying any learner.", format: "summary", permission: "own", safe: true };
    expect(() => validateTransformation({ ...input, safe: false })).toThrow(/permission/);
    expect(buildSourceScaffold(validateTransformation(input))).toMatchObject({ source: "extractive" });
  });
  it.each(transformationFormats)("creates a reviewable $label scaffold and exports the actual review", ({ id }) => {
    const input = validateTransformation({ title: "Evaporation notes", audience: "Class 7", objective: "Explain evaporation using observation.", source: "Evaporation is the change from liquid water to water vapour. It can occur below boiling point. Moving air carries vapour away from the surface.", format: id, permission: "own", safe: true });
    const result = buildSourceScaffold(input);
    expect(result.draft).toContain("[S1]");
    expect(result.draft).toContain("Evaporation is the change");
    const output = exportTransformation(input, result.draft, [transformationReview[0]]);
    expect(output).toContain(input.source);
    expect(output).toContain("- [x] " + transformationReview[0]);
    expect(output).toContain("- [ ] " + transformationReview[1]);
  });
});
