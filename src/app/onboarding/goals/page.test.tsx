import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GoalsPage from "./page";
import { initialDemoState, type DemoState } from "@/features/demo/demo-state";

const push = vi.fn();
const saveGoals = vi.fn();
let state: DemoState = initialDemoState;
const updateState = vi.fn((updater: (current: DemoState) => DemoState) => { state = updater(state); });

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/features/demo/demo-provider", () => ({ useDemo: () => ({ state, hydrated: true, storageScope: "participant:teacher", updateState, saveGoals }) }));
vi.mock("@/components/onboarding-shell", () => ({ OnboardingShell: ({ children }: { children: ReactNode }) => <div>{children}</div> }));

beforeEach(() => { state = { ...initialDemoState }; vi.clearAllMocks(); });

describe("AI experience onboarding", () => {
  it("retains answers when going back and only completes onboarding on Start learning", () => {
    const first = render(<GoalsPage />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Gemini" }));
    fireEvent.click(screen.getByRole("radio", { name: "Every week" }));
    fireEvent.change(screen.getByRole("textbox", { name: /What do you use AI for today/ }), { target: { value: "Finding lesson ideas" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Explain a topic simply" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(state).toMatchObject({ aiToolsUsed: ["Gemini"], aiUseFrequency: "Every week", currentAiUse: "Finding lesson ideas", goals: ["Explain difficult concepts"], onboardingCompleted: false });
    expect(saveGoals).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/onboarding/profile");
    first.unmount();
    render(<GoalsPage />);
    expect(screen.getByRole("checkbox", { name: "Gemini" })).toBeChecked();
    expect(screen.getByRole("textbox", { name: /What do you use AI for today/ })).toHaveValue("Finding lesson ideas");
    fireEvent.click(screen.getByRole("button", { name: "Start learning" }));
    expect(saveGoals).toHaveBeenCalledWith(expect.objectContaining({ aiToolsUsed: ["Gemini"], currentAiUse: "Finding lesson ideas", goals: ["Explain difficult concepts"] }));
    expect(push).toHaveBeenLastCalledWith("/dashboard");
  });

  it("lets a teacher continue without answering optional AI questions", () => {
    render(<GoalsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Start learning" }));
    expect(saveGoals).toHaveBeenCalledWith(expect.objectContaining({ aiToolsUsed: [], aiUseFrequency: "Prefer not to say", currentAiUse: "", goals: [] }));
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
