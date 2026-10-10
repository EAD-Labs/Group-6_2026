import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDemo } from "@/features/demo/demo-provider";
import { createRuleBasedCraftEvaluation } from "@/features/learning/craft-ai";
import { craftScenarios } from "@/features/learning/craft";
import { CraftPractice } from "./craft-practice";

vi.mock("@/features/demo/demo-provider", () => ({ useDemo: vi.fn() }));
const updateState = vi.fn();
const draftKey = "promptshala:draft:v1:participant:alice:craft";
const prompt = "Explain how mitochondria work.";
const task = "Explain a difficult concept";
const scoreButton = () => screen.getByRole("button", { name: "Check my prompt" });

beforeEach(() => {
  localStorage.clear(); updateState.mockClear();
  vi.mocked(useDemo).mockReturnValue({ storageScope: "participant:alice", participantId: "alice", updateState } as unknown as ReturnType<typeof useDemo>);
  localStorage.setItem(draftKey, JSON.stringify({ task, prompt, attempts: [] }));
});
afterEach(() => { vi.unstubAllGlobals(); });

describe("CRAFT request recovery", () => {
  it.each([
    [403, "consent_required", "Review and accept the safe-use notice.", "Review safe-use notice and finish setup", "/onboarding/safe-use"],
    [401, "sign_in_required", "Sign in again.", "Sign in again", "/sign-in"],
  ])("shows the recovery action for HTTP %s without inventing a score", async (status, code, error, label, href) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status, json: async () => ({ code, error }) }));
    render(<CraftPractice />); fireEvent.click(scoreButton());
    expect(await screen.findByRole("alert")).toHaveTextContent(error);
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
    expect(screen.getByRole("textbox", { name: /Your instructions for AI/ })).toHaveValue(prompt);
    expect(JSON.parse(localStorage.getItem(draftKey)!).attempts).toEqual([]);
    expect(updateState).not.toHaveBeenCalled();
    expect(scoreButton()).toBeEnabled();
  });

  it.each([400, 429, 503])("preserves the server explanation for HTTP %s and allows retry", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status, json: async () => ({ error: "Please wait a minute before checking another prompt." }) }));
    render(<CraftPractice />); fireEvent.click(scoreButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("Please wait a minute");
    expect(updateState).not.toHaveBeenCalled(); expect(scoreButton()).toBeEnabled();
  });

  it("keeps the draft on network failure and records only the successful retry", async () => {
    const evaluation = createRuleBasedCraftEvaluation(prompt, craftScenarios[0]);
    const request = vi.fn().mockRejectedValueOnce(new TypeError("Network unavailable")).mockResolvedValueOnce({ ok: true, json: async () => ({ evaluation, fallbackReason: "Guided demo uses the transparent CRAFT checklist." }) });
    vi.stubGlobal("fetch", request);
    render(<CraftPractice />); fireEvent.click(scoreButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("Check your connection");
    expect(updateState).not.toHaveBeenCalled();
    fireEvent.click(scoreButton());
    await waitFor(() => expect(updateState).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText(/Guided demo uses/)).toBeVisible();
    expect(JSON.parse(localStorage.getItem(draftKey)!).attempts).toHaveLength(1);
    expect(request).toHaveBeenLastCalledWith("/api/craft/evaluate", expect.objectContaining({ body: JSON.stringify({ prompt, task }) }));
  });

  it("preserves an older over-limit draft and blocks scoring until it is shortened", () => {
    const longPrompt = "x".repeat(2501);
    localStorage.setItem(draftKey, JSON.stringify({ task, prompt: longPrompt, attempts: [] }));
    const request = vi.fn(); vi.stubGlobal("fetch", request);
    render(<CraftPractice />);
    const editor = screen.getByRole("textbox", { name: /Your instructions for AI/ });
    expect(editor).toHaveValue(longPrompt); expect(editor).toHaveAttribute("maxlength", "2500");
    expect(scoreButton()).toBeDisabled();
    fireEvent.change(editor, { target: { value: "x".repeat(2500) } }); expect(scoreButton()).toBeEnabled();
    fireEvent.change(editor, { target: { value: " x " } }); expect(scoreButton()).toBeDisabled();
    expect(request).not.toHaveBeenCalled();
  });
  it("shows a failed account save without discarding the feedback", async () => {
    const evaluation = createRuleBasedCraftEvaluation(prompt, craftScenarios[0]);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ evaluation, saved: false, saveError: "This prompt was not saved to your account." }) }));
    render(<CraftPractice />); fireEvent.click(scoreButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("not saved to your account");
    expect(screen.getByRole("heading", { name: evaluation.headline })).toBeVisible();
    expect(screen.queryByText("Prompt and feedback saved to your account.")).not.toBeInTheDocument();
  });
  it("retrieves and reuses an account's saved prompt", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ attempts: [{ id: "saved-one", task_text: "Make a revision activity", prompt_text: "Write five revision questions for Class 6.", score_percent: 80, created_at: "2026-10-10T08:00:00Z" }] }) }));
    render(<CraftPractice />); fireEvent.click(screen.getByRole("button", { name: "View saved prompts" }));
    fireEvent.click(await screen.findByRole("button", { name: "Use this prompt again" }));
    expect(screen.getByRole("textbox", { name: /Your instructions for AI/ })).toHaveValue("Write five revision questions for Class 6.");
    expect(screen.getByRole("textbox", { name: /What should this prompt help you do/ })).toHaveValue("Make a revision activity");
  });
});
