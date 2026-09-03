import Link from "next/link";

import {
  moduleOne,
  moduleOneLessons,
} from "@/features/learning/module-1-content";

export default function ModuleOnePage() {
  return (
    <main className="page-shell narrow-shell">
      <span className="eyebrow">Module {moduleOne.position}</span>
      <h1>{moduleOne.title}</h1>
      <p>{moduleOne.description}</p>
      <p className="form-note">Estimated time: {moduleOne.estimatedMinutes} minutes</p>

      <ol className="lesson-list">
        {moduleOneLessons.map((lesson) => (
          <li className="card" key={lesson.id}>
            <span className="step-number">Lesson {lesson.position}</span>
            <h2>{lesson.title}</h2>
            <p>Prototype lesson content is ready for implementation.</p>
          </li>
        ))}
      </ol>

      <div className="privacy-notice" role="note">
        <strong>Before you continue</strong>
        <p>
          Use fictional or general classroom examples. Do not enter names, marks,
          health information, contact details, or confidential school records.
        </p>
      </div>

      <Link className="button button-primary" href="/dashboard">
        Return to dashboard
      </Link>
    </main>
  );
}
