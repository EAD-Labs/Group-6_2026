import { useState, type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDemo } from "@/features/demo/demo-provider";
import { initialDemoState } from "@/features/demo/demo-state";
import { readyPortfolio } from "@/test/fixtures/source-portfolio";
import { SourceStudio } from "./source-studio";

vi.mock("@/features/demo/demo-provider", () => ({ useDemo: vi.fn() }));
vi.mock("./app-shell", () => ({ AppShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("./ui/hydration-gate", () => ({ HydrationGate: ({ children }: { children: ReactNode }) => <>{children}</> }));

function usePracticeState() {
  const [state, updateState] = useState({ ...initialDemoState, sourcePortfolio: readyPortfolio() });
  return { state, updateState } as ReturnType<typeof useDemo>;
}

describe("source studio review integrity", () => {
  beforeEach(() => { vi.mocked(useDemo).mockImplementation(usePracticeState); });

  it("invalidates teacher approval after a draft is edited", () => {
    render(<SourceStudio />);
    expect(screen.getByText("Your required portfolio evidence is recorded.")).toBeInTheDocument();
    const privacy = screen.getByRole("checkbox", { name: /package contains no identifiable/ });
    expect(privacy).toBeChecked();
    fireEvent.change(screen.getByLabelText("Your classroom artifact"), { target: { value: "An edited classroom draft needs a fresh review even when the earlier draft had passed every check." } });
    expect(privacy).not.toBeChecked();
    expect(screen.queryByText("Your required portfolio evidence is recorded.")).toBeNull();
    expect(screen.getByRole("button", { name: /Export draft portfolio/ })).toBeEnabled();
  });

  it("keeps the current portfolio until the learner explicitly starts another case", () => {
    render(<SourceStudio />);
    fireEvent.change(screen.getByLabelText("Practice pack"), { target: { value: "seed-enquiry" } });
    expect(screen.getByText("Your required portfolio evidence is recorded.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start selected case" }));
    expect(screen.getByRole("heading", { name: "Two pots, one careful conclusion" })).toBeInTheDocument();
    expect(screen.getByLabelText("Your classroom artifact")).toHaveValue("");
    expect(screen.getByLabelText("Your verdict", { selector: "#verdict-c1" })).toHaveValue("");
    expect(screen.queryByText("Your required portfolio evidence is recorded.")).toBeNull();
  });

  it("preserves a draft and its review while a format change is pending or cancelled", () => {
    render(<SourceStudio />);
    const original = readyPortfolio();
    const format = screen.getByLabelText("Artifact format");
    fireEvent.change(format, { target: { value: "slides" } });
    expect(screen.getByLabelText("Your classroom artifact")).toHaveValue(original.draft);
    expect(screen.getByLabelText("What did you change, and why?")).toHaveValue(original.revisionNote);
    expect(screen.getByRole("checkbox", { name: /package contains no identifiable/ })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Keep current draft" }));
    expect(format).toHaveValue(original.artifactType);
    expect(screen.getByLabelText("Your classroom artifact")).toHaveValue(original.draft);
    fireEvent.change(format, { target: { value: "slides" } });
    fireEvent.click(screen.getByRole("button", { name: "Change format and clear draft" }));
    expect(format).toHaveValue("slides");
    expect(screen.getByLabelText("Your classroom artifact")).toHaveValue("");
    expect(screen.getByLabelText("What did you change, and why?")).toHaveValue("");
    expect(screen.getByRole("checkbox", { name: /package contains no identifiable/ })).not.toBeChecked();
  });
});
