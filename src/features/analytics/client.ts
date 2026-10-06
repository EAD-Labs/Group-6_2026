"use client";

export type ActivityInput = {
  kind: "page_view" | "page_time" | "click" | "question_view" | "question_answer" | "quiz_submit";
  activeMs?: number; target?: string; module?: number; questionId?: string; selectedOptions?: string[]; attemptId?: string;
};
export function recordActivity(input: ActivityInput) {
  window.dispatchEvent(new CustomEvent("promptshala:activity", { detail: input }));
}

// Counts visible interaction time; background tabs and idle gaps are excluded.
export function createActiveClock() {
  let previous = performance.now(), lastInput = previous, total = 0;
  const sample = () => {
    const now = performance.now();
    if (document.visibilityState !== "hidden") total += Math.max(0, Math.min(now, lastInput + 60_000) - previous);
    previous = now;
  };
  const input = () => { sample(); lastInput = performance.now(); };
  const visibility = () => { previous = performance.now(); lastInput = previous; };
  const inputs = ["pointerdown", "keydown", "scroll"];
  inputs.forEach(type => document.addEventListener(type, input, { passive: true }));
  document.addEventListener("visibilitychange", visibility);
  return {
    read: () => { sample(); return Math.round(total); },
    take: () => { sample(); const value = Math.round(total); total = 0; return value; },
    stop: () => { inputs.forEach(type => document.removeEventListener(type, input)); document.removeEventListener("visibilitychange", visibility); },
  };
}
