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

describe("course demo access", () => {
  beforeEach(() => vi.clearAllMocks());

  it("links every implemented lesson and quiz in a demo with no completed work", () => {
    const container = renderNavigation(true);
    const lessons = [moduleOneLessons.map((lesson) => lesson.slug), moduleTwoLessons.map((lesson) => lesson.id), moduleThreeLessons.map((lesson) => lesson.id)];
    lessons.forEach((ids, index) => {
      ids.forEach((id) => expect(container.querySelector(`a[href="/learn/module-${index + 1}/lessons/${id}"]`)).not.toBeNull());
      expect(container.querySelector(`a[href="/learn/module-${index + 1}/quiz"]`)).not.toBeNull();
    });
    expect(container.querySelectorAll(".course-navigation-locked")).toHaveLength(0);
  });

  it("keeps participant prerequisites when no lessons have been completed", () => {
    const container = renderNavigation(false);
    expect(container.querySelector(`a[href="/learn/module-1/lessons/${moduleOneLessons[0].slug}"]`)).not.toBeNull();
    expect(container.querySelector(`a[href="/learn/module-1/lessons/${moduleOneLessons[1].slug}"]`)).toBeNull();
    expect(container.querySelector('a[href="/learn/module-2/lessons/' + moduleTwoLessons[0].id + '"]')).toBeNull();
    expect(container.querySelector('a[href="/learn/module-3/lessons/' + moduleThreeLessons[0].id + '"]')).toBeNull();
    expect(container.querySelector('a[href="/learn/module-1/quiz"]')).toBeNull();
  });
});
