import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDemo } from "@/features/demo/demo-provider";
import { initialDemoState, type AssistantSpec } from "@/features/demo/demo-state";
import { moduleOneLessons, moduleOneQuizQuestions } from "@/features/learning/catalog";
import { ModuleQuiz } from "./module-quiz";
import { CraftPractice } from "./craft-practice";
import { createRuleBasedCraftEvaluation } from "@/features/learning/craft-ai";
import { createCraftScenario } from "@/features/learning/craft";
import { getLearningPlan } from "./learning-plan";
import { ModuleLessonExperience } from "./module-lesson-experience";
import { moduleTwoLessons, moduleTwoQuizQuestions } from "@/features/learning/module-two-content";
import { moduleThreeLessons, moduleThreeQuizQuestions } from "@/features/learning/module-three-content";
import { LessonExperience } from "./lesson-experience";

vi.mock("@/features/demo/demo-provider", () => ({ useDemo: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("./app-shell", () => ({ AppShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("./published-content", () => ({ PublishedContent: () => null }));
vi.mock("./ui/hydration-gate", () => ({ HydrationGate: ({ children }: { children: ReactNode }) => <>{children}</> }));
let context: ReturnType<typeof useDemo>;

beforeEach(() => {
  localStorage.clear();
  context = { state: structuredClone(initialDemoState), hydrated: true, storageScope: "participant:alice", syncStatus: "saved", syncError: null, retrySync: vi.fn(), recordQuizAttempt: vi.fn(), recordModuleQuizAttempt: vi.fn(), updateState: vi.fn(), completeModuleLesson: vi.fn() } as unknown as ReturnType<typeof useDemo>;
  vi.mocked(useDemo).mockImplementation(() => context);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("participant learning continuity", () => {
  it("restores an unfinished quiz for its owner without showing it to another account", () => {
    const first = render(<ModuleQuiz module={1} />);
    fireEvent.click(screen.getByRole("button", { name: "Start knowledge check" }));
    const label = moduleOneQuizQuestions[0].options[1].label;
    fireEvent.click(screen.getByRole("radio", { name: label }));
    first.unmount();
    const resumed = render(<ModuleQuiz module={1} />);
    expect(screen.getByRole("radio", { name: label })).toBeChecked();
    context = { ...context, storageScope: "participant:bob" };
    resumed.rerender(<ModuleQuiz module={1} />);
    expect(screen.getByRole("button", { name: "Start knowledge check" })).toBeVisible();
    expect(screen.queryByRole("radio", { name: label })).not.toBeInTheDocument();
  });

  it("cannot submit skipped questions and keeps quiz success separate from module completion", () => {
    render(<ModuleQuiz module={1} />);
    fireEvent.click(screen.getByRole("button", { name: "Start knowledge check" }));
    fireEvent.click(screen.getByRole("button", { name: `Question ${moduleOneQuizQuestions.length}, not answered` }));
    expect(screen.getByRole("button", { name: "Submit answers" })).toBeDisabled();
    moduleOneQuizQuestions.forEach((question, index) => {
      fireEvent.click(screen.getByRole("button", { name: `Question ${index + 1}, not answered` }));
      question.options.filter((option) => question.correctOptionIds.includes(option.id)).forEach((option) => fireEvent.click(screen.getByRole(question.kind === "single" ? "radio" : "checkbox", { name: option.label })));
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit answers" }));
    expect(context.recordQuizAttempt).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: "Knowledge check passed." })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Still to complete in this module" })).toBeVisible();
    expect(screen.queryByText(/Module complete/)).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("promptshala:draft:v1:participant:alice:quiz-1")!).started).toBe(false);
  });

  it("retains the CRAFT input on provider failure and compares the actual revisions", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (_url, options) => {
      const { prompt, task, suggestionId } = JSON.parse(options.body);
      return { ok: true, json: async () => ({ evaluation: createRuleBasedCraftEvaluation(prompt, createCraftScenario(task, suggestionId)), fallbackReason: "Live AI is unavailable, so PromptShala used its transparent CRAFT checklist." }) };
    }));
    const first = render(<CraftPractice />);
    const original = "Act as a teacher. Create three questions for class 7 evaporation, in a numbered list.";
    fireEvent.change(screen.getByRole("textbox", { name: /Prompt to analyse/ }), { target: { value: original } });
    fireEvent.click(screen.getByRole("button", { name: /Score my CRAFT prompt/ }));
    await waitFor(() => expect(context.updateState).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("textbox", { name: /Prompt to analyse/ })).toHaveValue(original);
    const revised = `${original} Include an answer key and check the science against approved notes.`;
    fireEvent.change(screen.getByRole("textbox", { name: /Prompt to analyse/ }), { target: { value: revised } });
    fireEvent.click(screen.getByRole("button", { name: /Score my CRAFT prompt/ }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Your two latest attempts" })).toBeVisible());
    expect(screen.getByText(original)).toBeVisible();
    expect(screen.getByText(revised, { selector: "pre" })).toBeVisible();
    first.unmount();
    render(<CraftPractice />);
    expect(screen.getByRole("textbox", { name: /Prompt to analyse/ })).toHaveValue(revised);
  });

  it("requires Module 2 understanding checks even when a reflection is already saved", () => {
    const lesson = moduleTwoLessons[0];
    context = { ...context, state: { ...context.state, lessonEvidence: { [lesson.id]: "I revised the classroom prompt to include an objective and a check." } } };
    render(<ModuleLessonExperience module={2} slug={lesson.id} />);
    expect(screen.getByRole("button", { name: "Complete lesson" })).toBeDisabled();
    const questions = moduleTwoQuizQuestions.filter(q => q.lessonSlug === lesson.id);
    questions.forEach((question, i) => {
      fireEvent.click(screen.getByRole("button", { name: `Lesson question ${i + 1}` }));
      question.options.filter(o => question.correctOptionIds.includes(o.id)).forEach(o => fireEvent.click(screen.getByRole(question.kind === "single" ? "radio" : "checkbox", { name: o.label })));
      fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
      if (i < questions.length - 1) expect(screen.getByRole("button", { name: "Complete lesson" })).toBeDisabled();
    });
    expect(screen.getByRole("button", { name: "Complete lesson" })).toBeEnabled();
  });

  it("projects completion requirements from practice evidence rather than a passing quiz alone", () => {
    const state = { ...initialDemoState, moduleTwoQuizAttempts: [{ answers: {}, attemptedAt: "2026-09-30T00:00:00Z", correctAnswers: 5, passed: true, scorePercent: 100 }] };
    const second = getLearningPlan(state)[1];
    expect(second.passed).toBe(false);
    expect(second.requirements.filter((requirement) => !requirement.complete)).toHaveLength(5);
    expect(second.next.href).toBe(`/learn/module-2/lessons/${moduleTwoLessons[0].id}`);
  });

  it("uses a native, mutually exclusive radio group for the Module 1 concept check", () => {
    render(<LessonExperience lesson={moduleOneLessons[0]} />);
    const generation = screen.getByRole("radio", { name: moduleOneQuizQuestions[0].options[1].label });
    const search = screen.getByRole("radio", { name: moduleOneQuizQuestions[0].options[0].label });
    fireEvent.click(generation);
    expect(generation).toBeChecked();
    fireEvent.click(search);
    expect(search).toBeChecked();
    expect(generation).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Complete and continue" })).toBeDisabled();
  });

  it("allows the labelled prepared review to satisfy the first assistant activity", () => {
    const lesson = moduleThreeLessons.find(item => item.id === "build-assistant")!;
    context = { ...context, state: { ...context.state,
      lessonEvidence: { [lesson.id]: "I reviewed the prepared source-gap example; no live assistant test was run." },
      assistants: [{ id: "practice", tests: [{ id: "prepared", evidenceMode: "prepared", caseId: "T3", input: "Date missing from source", expected: "Ask for source", output: "Invented date", review: "The date is absent", verdict: "fail", createdAt: "2026-10-01" }] } as AssistantSpec],
    } };
    render(<ModuleLessonExperience module={3} slug={lesson.id} />);
    moduleThreeQuizQuestions.filter(q => q.lessonSlug === lesson.id).forEach((question, i) => {
      fireEvent.click(screen.getByRole("button", { name: `Lesson question ${i + 1}` }));
      question.options.filter(o => question.correctOptionIds.includes(o.id)).forEach(o => fireEvent.click(screen.getByRole(question.kind === "single" ? "radio" : "checkbox", { name: o.label })));
      fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    });
    expect(screen.getByRole("button", { name: "Complete lesson" })).toBeEnabled();
    expect(screen.queryByText(/Complete the linked AI Staffroom activity first/)).not.toBeInTheDocument();
  });
});
