import { describe, expect, it } from "vitest";
import { moduleOneLessons } from "./catalog";
import { moduleTwoLessons } from "./module-two-content";
import { moduleThreeLessons } from "./module-three-content";
import { moduleFourLessons } from "./module-four-content";
import { assessmentBanks } from "@/features/demo/server-assessment";
describe("pilot question coverage", () => {
  it("has two or three valid, distinct questions per lesson in every module", () => {
    const lessons = [moduleOneLessons.map(l => l.slug), moduleTwoLessons.map(l => l.id), moduleThreeLessons.map(l => l.id), moduleFourLessons.map(l => l.id)];
    Object.values(assessmentBanks).forEach((questions, i) => {
      expect(new Set(questions.map(q => q.id)).size).toBe(questions.length);
      expect(new Set(questions.map(q => q.prompt)).size).toBe(questions.length);
      lessons[i].forEach(id => expect([2, 3]).toContain(questions.filter(q => q.lessonSlug === id).length));
      questions.forEach(q => { expect(lessons[i]).toContain(q.lessonSlug); expect(q.explanation.length).toBeGreaterThan(30); expect(q.correctOptionIds.length).toBeGreaterThan(0); q.correctOptionIds.forEach(id => expect(q.options.some(o => o.id === id)).toBe(true)); });
    });
    expect(Object.values(assessmentBanks).flat()).toHaveLength(75);
  });
});
