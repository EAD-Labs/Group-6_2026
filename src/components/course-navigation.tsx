"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDemo } from "@/features/demo/demo-provider";
import { learningModules, moduleOneLessons } from "@/features/learning/catalog";
import { moduleTwoLessons } from "@/features/learning/module-two-content";
import { moduleThreeLessons } from "@/features/learning/module-three-content";
import { getPathwayStatus } from "@/features/learning/pathway";
import { promptLibraryReady } from "@/features/learning/prompt-library";

import { Brand } from "./ui/brand";
import { Icon } from "./ui/icon";

type CourseNavigationProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function CourseNavigation({ mobileOpen, onClose }: CourseNavigationProps) {
  const pathname = usePathname();
  const { isPresentationDemo, state } = useDemo();
  const status = getPathwayStatus(state);
  const currentModule = Number(pathname.match(/^\/learn\/module-(\d)/)?.[1] ?? 1);
  const modules = [
    { lessons: moduleOneLessons.map(({ slug, title }) => ({ id: slug, title })), completed: state.completedLessonSlugs, unlocked: true, quizReady: status.oneLessons === moduleOneLessons.length },
    { lessons: moduleTwoLessons.map(({ id, title }) => ({ id, title })), completed: state.moduleTwoCompletedLessonIds, unlocked: isPresentationDemo || status.onePassed, quizReady: status.twoLessons === moduleTwoLessons.length && state.craftPracticeCount >= 2 && promptLibraryReady(state.promptLibrary) },
    { lessons: moduleThreeLessons.map(({ id, title }) => ({ id, title })), completed: state.moduleThreeCompletedLessonIds, unlocked: isPresentationDemo || status.twoPassed, quizReady: status.threeLessons === moduleThreeLessons.length && status.assistantReady },
  ];

  return (
    <aside className={`course-navigation${mobileOpen ? " mobile-open" : ""}`} id="course-navigation" aria-label="Course contents">
      <div className="course-navigation-brand"><Brand compact /><button className="course-navigation-close" type="button" onClick={onClose} aria-label="Close course contents"><Icon name="x" /></button></div>
      <div className="course-navigation-heading"><span className="eyebrow">Your learning route</span><h2>Course menu</h2></div>
      <nav aria-label="Modules and lessons" className="course-navigation-scroll">
        {learningModules.map((module, moduleIndex) => {
          const content = modules[moduleIndex];
          const modulePath = `/learn/${module.slug}`;
          const firstIncomplete = content ? content.lessons.findIndex((lesson) => !content.completed.includes(lesson.id)) : -1;
          const nextIndex = firstIncomplete < 0 ? content?.lessons.length ?? 0 : firstIncomplete;
          return <details className="course-navigation-module" key={module.id} open={module.position === currentModule}>
            <summary><span className="course-navigation-number">{String(module.position).padStart(2, "0")}</span><span className="course-navigation-title"><strong>{module.title}</strong><small>{module.position === 4 ? "Coming soon" : content?.unlocked ? `${content.completed.length}/${content.lessons.length} lessons` : "Complete the previous module"}</small></span><Icon name="chevron-right" /></summary>
            <div className="course-navigation-items">
              {module.position === 4 ? <p>Teacher-owned sources and grounded classroom materials are next on the roadmap.</p> : <>
                <Link aria-current={pathname === modulePath ? "page" : undefined} className="course-overview" href={modulePath as Route} onClick={onClose}>Module overview</Link>
                {content?.lessons.map((lesson, index) => {
                  const href = `${modulePath}/lessons/${lesson.id}`;
                  const available = content.unlocked && (isPresentationDemo || content.completed.includes(lesson.id) || index <= nextIndex);
                  return available ? <Link aria-current={pathname === href ? "page" : undefined} href={href as Route} key={lesson.id} onClick={onClose}><span>{String(index + 1).padStart(2, "0")}</span>{lesson.title}{content.completed.includes(lesson.id) ? <Icon name="check" /> : null}</Link> : <span className="course-navigation-locked" key={lesson.id}><span>{String(index + 1).padStart(2, "0")}</span>{lesson.title}<Icon name="lock" /></span>;
                })}
                {module.position === 2 ? content?.unlocked ? <Link aria-current={pathname === `${modulePath}/practice` ? "page" : undefined} href={`${modulePath}/practice` as Route} onClick={onClose}><span>↳</span>CRAFT practice lab</Link> : <span className="course-navigation-locked"><span>↳</span>CRAFT practice lab<Icon name="lock" /></span> : null}
                {module.position === 3 ? content?.unlocked ? <Link aria-current={pathname === `${modulePath}/staffroom` ? "page" : undefined} href={`${modulePath}/staffroom` as Route} onClick={onClose}><span>↳</span>AI Staffroom</Link> : <span className="course-navigation-locked"><span>↳</span>AI Staffroom<Icon name="lock" /></span> : null}
                {content?.unlocked && (isPresentationDemo || content.quizReady) ? <Link aria-current={pathname === `${modulePath}/quiz` ? "page" : undefined} href={`${modulePath}/quiz` as Route} onClick={onClose}><span>✓</span>Knowledge check</Link> : <span className="course-navigation-locked"><span>✓</span>Knowledge check<Icon name="lock" /></span>}
              </>}
            </div>
          </details>;
        })}
      </nav>
      <p className="course-navigation-foot">Use fictional examples and review every draft before classroom use.</p>
    </aside>
  );
}
