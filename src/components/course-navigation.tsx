"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDemo } from "@/features/demo/demo-provider";
import { learningModules, moduleOneLessons } from "@/features/learning/catalog";
import { moduleTwoLessons } from "@/features/learning/module-two-content";
import { moduleThreeLessons } from "@/features/learning/module-three-content";

import { Brand } from "./ui/brand";
import { Icon } from "./ui/icon";

type CourseNavigationProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function CourseNavigation({ mobileOpen, onClose }: CourseNavigationProps) {
  const pathname = usePathname();
  const { state } = useDemo();
  const currentModule = Number(pathname.match(/^\/learn\/module-(\d)/)?.[1] ?? 1);
  const modules = [
    { lessons: moduleOneLessons.map(({ slug, title }) => ({ id: slug, title })), completed: state.completedLessonSlugs },
    { lessons: moduleTwoLessons.map(({ id, title }) => ({ id, title })), completed: state.moduleTwoCompletedLessonIds },
    { lessons: moduleThreeLessons.map(({ id, title }) => ({ id, title })), completed: state.moduleThreeCompletedLessonIds },
  ];

  return (
    <aside className={`course-navigation${mobileOpen ? " mobile-open" : ""}`} id="course-navigation" aria-label="Course contents">
      <div className="course-navigation-brand"><Brand compact /><button className="course-navigation-close" type="button" onClick={onClose} aria-label="Close course contents"><Icon name="x" /></button></div>
      <div className="course-navigation-heading"><span className="eyebrow">Your learning route</span><h2>Course menu</h2></div>
      <nav aria-label="Modules and lessons" className="course-navigation-scroll">
        {learningModules.map((module, moduleIndex) => {
          const content = modules[moduleIndex];
          const modulePath = `/learn/${module.slug}`;
          return <details className="course-navigation-module" key={module.id} open={module.position === currentModule}>
            <summary><span className="course-navigation-number">{String(module.position).padStart(2, "0")}</span><span className="course-navigation-title"><strong>{module.title}</strong><small>{module.position === 4 ? "Coming soon" : `${content?.completed.length ?? 0}/${content?.lessons.length ?? 0} lessons`}</small></span><Icon name="chevron-right" /></summary>
            <div className="course-navigation-items">
              {module.position === 4 ? <p>Teacher-owned sources and grounded classroom materials are next on the roadmap.</p> : <>
                <Link aria-current={pathname === modulePath ? "page" : undefined} className="course-overview" href={modulePath as Route} onClick={onClose}>Module overview</Link>
                {content?.lessons.map((lesson, index) => {
                  const href = `${modulePath}/lessons/${lesson.id}`;
                  return <Link aria-current={pathname === href ? "page" : undefined} href={href as Route} key={lesson.id} onClick={onClose}><span>{String(index + 1).padStart(2, "0")}</span>{lesson.title}{content.completed.includes(lesson.id) ? <Icon name="check" /> : null}</Link>;
                })}
                {module.position === 2 ? <Link aria-current={pathname === `${modulePath}/practice` ? "page" : undefined} href={`${modulePath}/practice` as Route} onClick={onClose}><span>↳</span>CRAFT practice lab</Link> : null}
                {module.position === 3 ? <Link aria-current={pathname === `${modulePath}/staffroom` ? "page" : undefined} href={`${modulePath}/staffroom` as Route} onClick={onClose}><span>↳</span>AI Staffroom</Link> : null}
                {content ? <Link aria-current={pathname === `${modulePath}/quiz` ? "page" : undefined} href={`${modulePath}/quiz` as Route} onClick={onClose}><span>✓</span>Knowledge check</Link> : null}
              </>}
            </div>
          </details>;
        })}
      </nav>
      <p className="course-navigation-foot">Use fictional examples and review every draft before classroom use.</p>
    </aside>
  );
}
