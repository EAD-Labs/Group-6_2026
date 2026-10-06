import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { validateEvents } from "./events";
const now = Date.parse("2026-10-06T10:00:00Z");
const base = { id: "10000000-0000-4000-8000-000000000001", sessionId: "20000000-0000-4000-8000-000000000001", kind: "page_view", path: "/dashboard", activeMs: 0, occurredAt: new Date(now).toISOString() };
describe("learning activity validation", () => {
  it("projects safe fields and excludes private payloads", () => {
    const [event] = validateEvents([{ ...base, password: "private", participantId: "other", privateDraft: "private" }], now);
    expect(event).toEqual(base);
  });
  it("grades answers on the server regardless of client correctness claims", () => {
    const [event] = validateEvents([{ ...base, path: "/learn/module-1/quiz", kind: "question_answer", module: 1, questionId: "m1-q1", selectedOptions: ["a"], correct: true, activeMs: 1200, attemptId: base.id }], now);
    expect(event.correct).toBe(false); expect(event.contentVersion).toBeTruthy();
  });
  it("accepts a lesson check only on its own chapter page", () => {
    const event = { ...base, kind: "question_answer", module: 1, questionId: "m1-q1", selectedOptions: ["b"], attemptId: base.id, path: "/learn/module-1/lessons/meet-generative-ai" };
    expect(validateEvents([event], now)[0].correct).toBe(true);
    expect(() => validateEvents([{ ...event, path: "/learn/module-1/lessons/review-before-use" }], now)).toThrow();
  });
  it.each([
    { path: "/dashboard?email=private" }, { path: "https://example.com" }, { activeMs: -1 },
    { occurredAt: "2025-01-01" }, { kind: "private" }, { kind: "click", target: "private field contents" },
    { kind: "question_answer", module: 1, attemptId: base.id, path: "/learn/module-1/quiz", questionId: "unknown", selectedOptions: ["a"] },
  ])("rejects unsafe, malformed or stale observations: %j", invalid => expect(() => validateEvents([{ ...base, ...invalid }], now)).toThrow());
});
