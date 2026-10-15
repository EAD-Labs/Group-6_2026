import { describe, expect, it } from "vitest";
import { authoringLessons, reviseLessonVersion, safeLearningUrl, validateLessonDraft, type LessonVersion } from "./lesson-package";

export const validLessonDraft = () => ({ module: 1, lessonSlug: authoringLessons[0][0].id, title: "Check a generated worksheet", body: "Use a fictional classroom example and check each answer against your original reading.", cohortId: "", package: { schemaVersion: 1, learningGoal: "Check every generated answer against the source.", rightsConfirmed: true, media: [{ kind: "reading", title: "A teacher-owned source", url: "https://example.org/teacher-reading", accessibilityNote: "An accessible text version is linked on the page." }], activity: { title: "Spot the missing context", instructions: "Use a fictional worksheet, find a questionable claim and improve the instructions before using it with a class.", reflection: "What would you check before sharing this with a learner?" } } });

describe("safe versioned lesson authoring", () => {
  it("keeps all 29 existing lesson identities and trims validated authoring input", () => {
    expect(authoringLessons.flat()).toHaveLength(29);
    expect(validateLessonDraft({ ...validLessonDraft(), title: "  A useful clarification  " }).title).toBe("A useful clarification");
  });
  it.each(["javascript:alert(1)", "data:text/html,hello", "http://example.org", "https://teacher:secret@example.org", "https://example.org/a\nlink", "https://localhost/"])("rejects unsafe resource URL %s", url => {
    expect(safeLearningUrl(url)).toBeNull();
    const draft = validLessonDraft(); draft.package.media[0].url = url;
    expect(() => validateLessonDraft(draft)).toThrow(/HTTPS/);
  });
  it("requires rights confirmation, accessible alternatives and a usable activity", () => {
    const draft = validLessonDraft();
    expect(() => validateLessonDraft({ ...draft, package: { ...draft.package, rightsConfirmed: false } })).toThrow(/permission/);
    expect(() => validateLessonDraft({ ...draft, package: { ...draft.package, media: [{ ...draft.package.media[0], accessibilityNote: "" }] } })).toThrow(/Accessible/);
    expect(() => validateLessonDraft({ ...draft, package: { ...draft.package, activity: { ...draft.package.activity, instructions: "" } } })).toThrow(/instructions/);
    expect(() => validateLessonDraft({ ...draft, lessonSlug: "unrecognised-course-lesson" })).toThrow(/course/);
  });
  it("keeps revisions independent of the saved package and supports old text-only versions", () => {
    const draft = validateLessonDraft(validLessonDraft());
    const saved: LessonVersion = { id: "saved", module_number: 1, lesson_slug: draft.lessonSlug, title: draft.title, body: draft.body, cohort_id: null, package: draft.package, version: 1, status: "published" };
    const next = reviseLessonVersion(saved); next.package.media[0].title = "A new resource"; next.package.activity.title = "New activity";
    expect(draft.package.media[0].title).toBe("A teacher-owned source");
    expect(draft.package.activity.title).toBe("Spot the missing context");
    expect(reviseLessonVersion({ ...saved, package: {} }).package.media).toEqual([]);
  });
});
