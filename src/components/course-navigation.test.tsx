import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDemo } from "@/features/demo/demo-provider";
import { initialDemoState } from "@/features/demo/demo-state";
import { moduleOneLessons } from "@/features/learning/catalog";
import { moduleTwoLessons } from "@/features/learning/module-two-content";
import { moduleThreeLessons } from "@/features/learning/module-three-content";
import { CourseNavigation } from "./course-navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/learn/module-1" }));
vi.mock("@/features/demo/demo-provider", () => ({ useDemo: vi.fn() }));

function renderNavigation(isPresentationDemo: boolean) {
  vi.mocked(useDemo).mockReturnValue({ state: initialDemoState, isPresentationDemo } as ReturnType<typeof useDemo>);
  return render(<CourseNavigation mobileOpen={false} onClose={() => {}} />).container;
}

describe("open course access", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([false, true])("links every lesson and quiz with no progress (demo=%s)", (isDemo) => {
    const container = renderNavigation(isDemo);
    const lessons = [moduleOneLessons.map((lesson) => lesson.slug), moduleTwoLessons.map((lesson) => lesson.id), moduleThreeLessons.map((lesson) => lesson.id)];
    lessons.forEach((ids, index) => {
      ids.forEach((id) => expect(container.querySelector(`a[href="/learn/module-${index + 1}/lessons/${id}"]`)).not.toBeNull());
      expect(container.querySelector(`a[href="/learn/module-${index + 1}/quiz"]`)).not.toBeNull();
    });
    expect(container.querySelector('a[href="/learn/module-2/practice"]')).not.toBeNull();
    expect(container.querySelector('a[href="/learn/module-3/staffroom"]')).not.toBeNull();
    expect(container.querySelectorAll(".course-navigation-locked")).toHaveLength(0);
  });
});
