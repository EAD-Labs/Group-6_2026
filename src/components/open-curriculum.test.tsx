import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ModuleTwoPage from "@/app/learn/module-2/page";
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

  it.each([2, 3] as const)("opens a later Module %s chapter directly", (module) => {
    render(<ModuleLessonExperience module={module} slug={module === 2 ? "prompt-laboratory" : "repair-and-remix"} />);
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveTextContent(/locked/i);
    expect(screen.getByRole("heading", { name: "Record what you tried and learned" })).toBeInTheDocument();
  });

  it.each([1, 2, 3] as const)("opens Module %s quiz without prior lessons or evidence", (module) => {
    render(module === 1 ? <QuizExperience /> : <PathwayQuiz module={module} />);
    expect(screen.getByRole("button", { name: /Start/ })).toBeEnabled();
    expect(screen.queryByText(/Finish the lessons first|Finish all six lessons first/)).toBeNull();
  });
});
