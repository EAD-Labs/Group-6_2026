import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CraftPracticePage from "@/app/learn/module-2/practice/page";
import ModuleTwoPage from "@/app/learn/module-2/page";
import ModuleFourPage from "@/app/learn/module-4/page";
import { SourceStudio } from "./source-studio";
import ModuleThreePage from "@/app/learn/module-3/page";
import { useDemo } from "@/features/demo/demo-provider";
import { initialDemoState } from "@/features/demo/demo-state";
import { ModuleLessonExperience } from "./module-lesson-experience";
import { PathwayQuiz } from "./pathway-quiz";
import { QuizExperience } from "./quiz-experience";

vi.mock("@/features/demo/demo-provider", () => ({ useDemo: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("./app-shell", () => ({ AppShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("./ui/hydration-gate", () => ({ HydrationGate: ({ children }: { children: ReactNode }) => <>{children}</> }));

describe("participant access without prerequisites", () => {
  beforeEach(() => {
    vi.mocked(useDemo).mockReturnValue({ state: initialDemoState, isPresentationDemo: false } as ReturnType<typeof useDemo>);
  });

  it("opens both later module overviews with links to their final lessons", () => {
    const two = render(<ModuleTwoPage />);
    expect(two.container.querySelector('a[href="/learn/module-2/lessons/teaching-prompt-library"]')).not.toBeNull();
    two.unmount();
    const three = render(<ModuleThreePage />);
    expect(three.container.querySelector('a[href="/learn/module-3/lessons/repair-and-remix"]')).not.toBeNull();
  });

  it("opens CRAFT practice for a participant with no completed lessons", () => {
    render(<CraftPracticePage />);
    expect(screen.getByRole("heading", { level: 1, name: "CRAFT practice lab" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /What should this prompt help you do/ })).toBeEnabled();
    expect(screen.queryByText("Complete Module 1 first")).toBeNull();
  });

  it("opens the Module 4 overview and source studio with zero progress", () => {
    const overview = render(<ModuleFourPage />);
    expect(overview.container.querySelector('a[href="/learn/module-4/lessons/source-to-classroom-capstone"]')).not.toBeNull();
    overview.unmount();
    render(<SourceStudio />);
    expect(screen.getByRole("heading", { level: 1, name: "Source Studio" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check claim 1" })).toBeEnabled();
  });

  it.each([2, 3, 4] as const)("opens a later Module %s chapter directly", (module) => {
    render(<ModuleLessonExperience module={module} slug={module === 2 ? "prompt-laboratory" : module === 3 ? "repair-and-remix" : "source-to-classroom-capstone"} />);
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveTextContent(/locked/i);
    expect(screen.getByRole("heading", { name: "Record what you tried and learned" })).toBeInTheDocument();
  });

  it.each([1, 2, 3, 4] as const)("opens Module %s quiz without prior lessons or evidence", (module) => {
    render(module === 1 ? <QuizExperience /> : <PathwayQuiz module={module} />);
    expect(screen.getByRole("button", { name: /Start/ })).toBeEnabled();
    expect(screen.queryByText(/Finish the lessons first|Finish all six lessons first/)).toBeNull();
  });
});
