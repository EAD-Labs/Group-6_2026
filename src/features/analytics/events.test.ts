import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { requestedReleaseIds, validateEvents } from "./events";
import { baseAssessment } from "@/features/content-authoring/server-assessment-releases";
import { releaseContentVersion, type ResolvedAssessment } from "@/features/content-authoring/assessment-release";
const now = Date.parse("2026-10-06T10:00:00Z");
const base = { id: "10000000-0000-4000-8000-000000000001", sessionId: "20000000-0000-4000-8000-000000000001", kind: "page_view", path: "/dashboard", activeMs: 0, occurredAt: new Date(now).toISOString() };
const releaseId = "70000000-0000-4000-8000-000000000001";
const released: ResolvedAssessment = { ...baseAssessment(1), releaseId, contentVersion: releaseContentVersion(releaseId), questions: [{ ...baseAssessment(1).questions[0], correctOptionIds: ["a"] }] };
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
  it("uses the exact trusted released bank rather than a client correctness claim or current base answer", () => {
    const raw = { ...base, kind: "question_answer", module: 1, path: "/learn/module-1/quiz", attemptId: base.id, questionId: "m1-q1", selectedOptions: ["a"], contentVersion: released.contentVersion, correct: false, questions: baseAssessment(1).questions };
    const [event] = validateEvents([raw], now, [released]);
    expect(event.correct).toBe(true); expect(event.contentVersion).toBe(released.contentVersion);
    expect(event).not.toHaveProperty("questions");
    expect(() => validateEvents([raw], now)).toThrow(/unavailable knowledge check/);
    expect(() => validateEvents([{ ...raw, module: 2, path: "/learn/module-2/quiz" }], now, [released])).toThrow(/unavailable knowledge check/);
    expect(() => validateEvents([{ ...raw, selectedOptions: ["unknown"] }], now, [released])).toThrow(/answer selection/);
  });
  it("keeps inline lesson checks on their actual base version after quiz releases change", () => {
    const raw = { ...base, kind: "question_answer", module: 1, attemptId: base.id, path: "/learn/module-1/lessons/meet-generative-ai", questionId: "m1-q1", selectedOptions: ["a"] };
    expect(validateEvents([raw], now, [released])[0]).toMatchObject({ correct: false, contentVersion: baseAssessment(1).contentVersion });
    expect(() => validateEvents([{ ...raw, contentVersion: released.contentVersion }], now, [released])).toThrow(/unavailable knowledge check/);
  });
  it("pins queued views and submissions to their original supplied release", () => {
    const raw = { ...base, module: 1, attemptId: base.id, path: "/learn/module-1/quiz", contentVersion: released.contentVersion };
    expect(validateEvents([{ ...raw, kind: "question_view", questionId: "m1-q1" }, { ...raw, kind: "quiz_submit" }], now, [released]).map(event => event.contentVersion)).toEqual([released.contentVersion, released.contentVersion]);
    expect(validateEvents([{ ...raw, contentVersion: undefined, kind: "quiz_submit" }], now, [released])[0].contentVersion).toBe(baseAssessment(1).contentVersion);
    expect(() => validateEvents([{ ...raw, contentVersion: "unrecognised-version", kind: "quiz_submit" }], now, [released])).toThrow(/unavailable knowledge check/);
  });
  it("extracts only bounded, unique immutable quiz release IDs for trusted lookup", () => {
    const raw = { ...base, module: 1, path: "/learn/module-1/quiz", kind: "question_view", contentVersion: released.contentVersion };
    expect(requestedReleaseIds([raw, raw, { ...base, contentVersion: released.contentVersion }])).toEqual([releaseId]);
    expect(requestedReleaseIds([{ ...raw, path: "/learn/module-1/lessons/meet-generative-ai" }])).toEqual([]);
    expect(() => requestedReleaseIds([{ ...raw, contentVersion: "assessment:invalid" }])).toThrow(/version/);
    expect(() => requestedReleaseIds(Array.from({ length: 51 }, () => raw))).toThrow(/1–50/);
  });
  it.each([
    { path: "/dashboard?email=private" }, { path: "https://example.com" }, { activeMs: -1 },
    { occurredAt: "2025-01-01" }, { kind: "private" }, { kind: "click", target: "private field contents" },
    { kind: "question_answer", module: 1, attemptId: base.id, path: "/learn/module-1/quiz", questionId: "unknown", selectedOptions: ["a"] },
  ])("rejects unsafe, malformed or stale observations: %j", invalid => expect(() => validateEvents([{ ...base, ...invalid }], now)).toThrow());
});
