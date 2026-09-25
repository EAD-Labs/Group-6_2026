"use client";

import type { Route } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useDemo } from "@/features/demo/demo-provider";
import { getBestQuizScore } from "@/features/demo/demo-state";
import {
  getModuleOneProgress,
  learningModules,
  moduleOneLessons,
} from "@/features/learning/catalog";
import { getPathwayStatus } from "@/features/learning/pathway";

function getGreeting() {
  const currentHour = new Date().getHours();
  if (currentHour < 12) return "Good morning";
  if (currentHour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { isPresentationDemo, state } = useDemo();
  const pathway = getPathwayStatus(state);
  const moduleOnePassed = pathway.onePassed;
  const bestScore = getBestQuizScore(state.quizAttempts);
  const completedCount = pathway.oneLessons;
  const progress = getModuleOneProgress(completedCount, moduleOnePassed);
  const nextLesson = moduleOneLessons.find(
    (lesson) => !state.completedLessonSlugs.includes(lesson.slug),
  );
  const primaryHref = (moduleOnePassed
    ? "/learn/module-2"
    : nextLesson
      ? `/learn/module-1/lessons/${nextLesson.slug}`
      : "/learn/module-1/quiz") as Route;
  const hasStarted = completedCount > 0 || state.quizAttempts.length > 0;

  return (
    <HydrationGate>
      <AppShell active="home">
        <header className="page-heading dashboard-heading">
          <div>
            <span className="eyebrow">Your learning space</span>
            <h1>{getGreeting()}, {state.displayName}</h1>
            <p>Build confidence one classroom decision at a time.</p>
          </div>
          <div className="sync-pill"><Icon name="cloud" /><span>Local progress saved</span></div>
        </header>

        {!state.onboardingCompleted ? (
          <section className="empty-state-card">
            <span className="empty-state-icon"><Icon name="sparkles" /></span>
            <div><span className="overline">One quick step</span><h2>Personalise your learning path</h2><p>Tell us what you teach so PromptShala can use relevant examples.</p></div>
            <Link className="button button-primary" href="/onboarding/safe-use">Complete onboarding <Icon name="arrow-right" /></Link>
          </section>
        ) : (
          <section className="continue-card" aria-labelledby="continue-title">
            <div className="continue-card-main">
              <div className="module-label-row"><span className="module-badge">Module {pathway.twoPassed ? 3 : moduleOnePassed ? 2 : 1}</span><span><Icon name="clock" />{moduleOnePassed ? "Continue pathway" : nextLesson ? `${nextLesson.durationMinutes} min next` : "5 min quiz"}</span></div>
              <h2 id="continue-title">{pathway.threePassed ? "Module 3 complete" : pathway.twoPassed ? "Module 3 · Reusable Teacher Assistants" : moduleOnePassed ? "Module 2 · Classroom Prompt Writing" : learningModules[0].title}</h2>
              <p>{pathway.threePassed ? "Your assistant and learning evidence are saved." : pathway.twoPassed ? "Build and test an assistant in the AI Staffroom." : moduleOnePassed ? "Continue your CRAFT prompt-writing lessons and assessment." : nextLesson ? `${nextLesson.title}: ${nextLesson.summary}` : "All lessons complete. Take the five-question knowledge check."}</p>
              <Link className="button button-primary" href={(pathway.twoPassed ? "/learn/module-3" : primaryHref) as Route}>{pathway.twoPassed ? "Open Module 3" : moduleOnePassed ? "Open Module 2" : hasStarted ? "Resume learning" : "Start Module 1"}<Icon name="arrow-right" /></Link>
            </div>
            <div className="continue-progress"><ProgressRing value={pathway.coursePercent} /><span>{pathway.threePassed ? "3 modules passed" : moduleOnePassed ? "Module 1 passed" : `${completedCount} of ${moduleOneLessons.length} lessons`}</span></div>
          </section>
        )}

        <div className="dashboard-grid">
          <section className="dashboard-main-column" aria-labelledby="modules-title">
            <div className="section-heading"><div><span className="eyebrow">Four-module pathway</span><h2 id="modules-title">Course modules</h2></div><span className="section-meta">{isPresentationDemo ? "Presentation preview" : `${Number(pathway.onePassed) + Number(pathway.twoPassed) + Number(pathway.threePassed)} of 4 complete`}</span></div>
            <div className="module-grid">
              {learningModules.map((module) => {
                const isFirst = module.position === 1;
                const available = isFirst || (module.position === 2 && (isPresentationDemo || moduleOnePassed)) || (module.position === 3 && (isPresentationDemo || pathway.twoPassed));
                const passed = isFirst ? pathway.onePassed : module.position === 2 ? pathway.twoPassed : module.position === 3 ? pathway.threePassed : false;
                return (
                  <article className={`course-card ${available ? "available" : "locked"}`} id={`module-${module.position}`} key={module.id}>
                    <div className="course-card-top"><span className="course-icon">{available ? <Icon name={passed ? "check" : isFirst ? "brain" : "sparkles"} /> : <Icon name="lock" />}</span><span className={`status-pill ${passed ? "passed" : available ? "available" : "locked"}`}>{passed ? "Passed" : isFirst ? hasStarted ? "In progress" : "Available" : available ? "Newly unlocked" : "Locked"}</span></div>
                    <span className="course-number">Module {module.position}</span>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                    {isFirst ? <><div className="linear-progress" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div><div className="course-card-footer"><span>{progress}% complete</span><Link aria-label={`Open ${module.title}`} href="/learn/module-1"><Icon name="chevron-right" /></Link></div></> : available && module.position <= 3 ? <Link className="button button-secondary button-small course-preview-link" href={module.position === 2 ? "/learn/module-2" : "/learn/module-3"}>Open module <Icon name="arrow-right" /></Link> : <div className="locked-requirement">{module.position === 4 ? "Next module in development" : `Complete Module ${module.position - 1} to unlock`}</div>}
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="dashboard-aside">
            <section className="insight-card"><div className="section-heading compact"><div><span className="eyebrow">Course progress</span><h2>Keep it up</h2></div><ProgressRing value={pathway.coursePercent} /></div><p>You have completed {pathway.oneLessons + pathway.twoLessons + pathway.threeLessons} lessons and {Number(pathway.onePassed) + Number(pathway.twoPassed) + Number(pathway.threePassed)} modules.</p><Link className="text-link" href="/progress">View detailed progress <Icon name="arrow-right" /></Link></section>
            <section className="privacy-card"><Icon name="shield" /><div><strong>Privacy tip</strong><p>Use fictional or general classroom examples. Never enter identifiable student information.</p></div></section>
            <section className="activity-card"><div className="section-heading compact"><h2>Recent activity</h2><Link href="/progress">View all</Link></div>{hasStarted ? <ul>{state.quizAttempts.length ? <li><span className="activity-icon"><Icon name={moduleOnePassed ? "check" : "refresh"} /></span><div><strong>Module 1 knowledge check</strong><small>Best score: {bestScore}%</small></div></li> : null}{completedCount ? <li><span className="activity-icon"><Icon name="book" /></span><div><strong>{moduleOneLessons[completedCount - 1]?.title}</strong><small>Lesson completed</small></div></li> : null}</ul> : <div className="mini-empty"><Icon name="book" /><p>Your completed lessons and quiz attempts will appear here.</p></div>}</section>
          </aside>
        </div>
      </AppShell>
    </HydrationGate>
  );
}
