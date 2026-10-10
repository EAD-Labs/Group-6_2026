import { useEffect, useState, type ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDemo } from "@/features/demo/demo-provider";
import { initialDemoState, type DemoState } from "@/features/demo/demo-state";
import { assistantHasRepairEvidence } from "@/features/learning/pathway";
import { AiStaffroom, assistantExportText } from "./ai-staffroom";

vi.mock("@/features/demo/demo-provider", () => ({ useDemo: vi.fn() }));
vi.mock("./app-shell", () => ({ AppShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("./ui/hydration-gate", () => ({ HydrationGate: ({ children }: { children: ReactNode }) => <>{children}</> }));

let saved: DemoState;
function usePracticeState() {
  const [state, updateState] = useState(structuredClone(initialDemoState));
  useEffect(() => { saved = state; }, [state]);
  return { state, updateState, storageScope: "demo" } as ReturnType<typeof useDemo>;
}
beforeEach(() => { vi.mocked(useDemo).mockImplementation(usePracticeState); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("Staffroom evidence integrity", () => {
  it("finishes the six-case prepared review and three comparisons without inventing live runs", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<AiStaffroom />);
    fireEvent.click(screen.getByRole("button", { name: "Write my own instructions" }));
    fireEvent.click(screen.getByRole("button", { name: "2 Try an example" }));
    fireEvent.change(screen.getByLabelText("Where will the answer come from?"), { target: { value: "prepared" } });
    function review(caseId: string, verdict: string) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${caseId} ·`) }));
      fireEvent.click(screen.getByRole("button", { name: `Read sample answer for ${caseId}` }));
      fireEvent.change(screen.getByLabelText(/^What did you notice\?/), { target: { value: "I compared the supplied response with the expected evidence boundary." } });
      fireEvent.change(screen.getByLabelText("How well did it work?"), { target: { value: verdict } });
      fireEvent.click(screen.getByRole("button", { name: "Save my review" }));
    }
    ["T1", "T2", "T3", "T4", "T5", "T6"].forEach(id => review(id, id === "T3" ? "fail" : "pass"));
    expect(saved.assistants[0].tests).toHaveLength(6);
    fireEvent.click(screen.getByRole("button", { name: "3 Improve" }));
    fireEvent.change(screen.getByLabelText(/^What needs to change\?/), { target: { value: "The prepared T3 response invents a date absent from Source A." } });
    fireEvent.change(screen.getByLabelText(/^What instruction did you change, and why\?/), { target: { value: "Use only the supplied facts and request an approved calendar for dates." } });
    fireEvent.click(screen.getByRole("button", { name: "Save version 2" }));
    fireEvent.click(screen.getByRole("button", { name: "2 Try an example" }));
    ["T3", "T1", "T2"].forEach(id => review(id, "pass"));
    expect(saved.assistants[0].tests).toHaveLength(9);
    expect(saved.assistants[0].tests.every(test => test.evidenceMode === "prepared")).toBe(true);
    expect(assistantHasRepairEvidence(saved.assistants[0])).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("holds the current input during a live request and preserves it after cancellation", async () => {
    vi.stubGlobal("fetch", vi.fn((_url, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    })));
    render(<AiStaffroom />);
    fireEvent.click(screen.getAllByRole("button", { name: "Use this starting point" })[0]);
  fireEvent.click(screen.getByRole("button", { name: "2 Try an example" }));
    fireEvent.click(screen.getByRole("button", { name: /^T2 ·/ }));
    const input = screen.getByLabelText("What you want the helper to handle");
    const value = (input as HTMLTextAreaElement).value;
    fireEvent.click(screen.getByRole("button", { name: "Ask AI to try it" }));
    expect(input).toBeDisabled();
    expect(screen.getByRole("button", { name: /^T1 ·/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Stop this request" }));
    await waitFor(() => expect(input).toBeEnabled());
    expect(input).toHaveValue(value);
    expect(saved.assistants[0].tests).toHaveLength(0);
    expect(saved.assistants[0].versions).toHaveLength(0);
    expect(screen.getByText(/Test stopped. Your input is preserved/)).toBeVisible();
  });
});

it("does not freeze an incomplete Passport or a failed first request", async () => {
  const fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ error: "Provider unavailable" }), { status: 503 })).mockResolvedValueOnce(new Response(JSON.stringify({ output: "A usable fictional draft for teacher review." })));
  vi.stubGlobal("fetch", fetch);
  render(<AiStaffroom />);
  fireEvent.click(screen.getByRole("button", { name: "Write my own instructions" }));
    fireEvent.click(screen.getByRole("button", { name: "2 Try an example" }));
  fireEvent.click(screen.getByRole("button", { name: /^T1 ·/ }));
  expect(screen.getByRole("button", { name: "Ask AI to try it" })).toBeDisabled();
  expect(saved.assistants[0].versions).toHaveLength(0);
  fireEvent.click(screen.getByText("Choose another starting point", { selector: "summary" }));
  fireEvent.click(screen.getAllByRole("button", { name: "Use this starting point" })[0]);
  fireEvent.click(screen.getByRole("button", { name: "2 Try an example" }));
  fireEvent.click(screen.getByRole("button", { name: /^T1 ·/ }));
  fireEvent.click(screen.getByRole("button", { name: "Ask AI to try it" }));
  await screen.findByText("Provider unavailable");
  expect(saved.assistants[1].versions).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "1 Set up" }));
  fireEvent.change(screen.getByLabelText("What should it do?"), { target: { value: "Revised task after the failed first request" } });
  fireEvent.click(screen.getByRole("button", { name: "2 Try an example" }));
  fireEvent.click(screen.getByRole("button", { name: "Ask AI to try it" }));
  await screen.findByText("Draft returned. Review it before saving the test.");
  expect(JSON.parse(fetch.mock.calls[1][1].body).task).toBe("Revised task after the failed first request");
  expect(saved.assistants[1].versions?.[0].snapshot?.task).toBe("Revised task after the failed first request");
});

it("retains the live run's original source and classroom context after subsequent edits", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ output: "Original output under the supplied context and source." }))));
  render(<AiStaffroom />);
  fireEvent.click(screen.getAllByRole("button", { name: "Use this starting point" })[0]);
  fireEvent.click(screen.getByRole("button", { name: "2 Try an example" }));
  fireEvent.change(screen.getByLabelText(/^Trusted notes for the helper/), { target: { value: "Original source A for the live run" } });
  fireEvent.change(screen.getByLabelText(/^Classroom details for these examples/), { target: { value: "Original classroom context for the live run" } });
  fireEvent.click(screen.getByRole("button", { name: /^T1 ·/ }));
  fireEvent.click(screen.getByRole("button", { name: "Ask AI to try it" }));
  await screen.findByText("Draft returned. Review it before saving the test.");
  fireEvent.change(screen.getByLabelText(/^Trusted notes for the helper/), { target: { value: "New source after the run" } });
  fireEvent.change(screen.getByLabelText(/^What did you notice\?/), { target: { value: "I reviewed the actual response against the original run conditions." } });
  fireEvent.change(screen.getByLabelText("How well did it work?"), { target: { value: "pass" } });
  fireEvent.click(screen.getByRole("button", { name: "Save my review" }));
  expect(saved.assistants[0].tests[0]).toMatchObject({ sourcePack: "Original source A for the live run", classContextCard: "Original classroom context for the live run", evidenceMode: "live" });
  expect(assistantExportText(saved.assistants[0])).toContain("Source pack for this run: Original source A for the live run");
});
