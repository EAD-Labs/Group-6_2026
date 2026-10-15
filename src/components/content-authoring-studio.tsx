"use client";

import { useState } from "react";
import { authoringLessons, emptyLessonDraft, reviseLessonVersion, validateLessonDraft, type ContentScope, type LessonDraft, type LessonPackage, type LessonVersion } from "@/features/content-authoring/lesson-package";
import { LessonPackagePreview } from "./lesson-package-preview";
import "./content-authoring-studio.css";

export function ContentAuthoringStudio({ versions, scopes, administrator, busy, act }: { versions: LessonVersion[]; scopes: ContentScope[]; administrator: boolean; busy: boolean; act: (action: string, payload: Record<string, unknown>, message: string) => Promise<void> }) {
  const [draft, setDraft] = useState<LessonDraft>(emptyLessonDraft), [preview, setPreview] = useState(false), [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const updatePackage = (change: Partial<LessonPackage>) => setDraft(current => ({ ...current, package: { ...current.package, ...change } }));
  const audience = (id: string | null) => id ? scopes.find(scope => scope.id === id)?.title ?? "Assigned learning group" : "Everyone in the course";
  const history = versions.filter(version => filter === "all" || version.status === filter);
  return <section className="platform-columns content-authoring-studio">
    <div className="platform-panel">
      <span className="eyebrow">Content studio</span><h2>Build a useful lesson update</h2>
      <p>Set a clear goal, explain it simply, and give teachers something to try. Save a new version each time. An administrator reviews and publishes it.</p>
      {error ? <p className="platform-message error" role="alert">{error}</p> : null}
      <form className="platform-form" onInvalid={event => { (event.target as HTMLElement).closest("details")?.setAttribute("open", ""); }} onSubmit={event => { event.preventDefault(); setError(""); try { const valid = validateLessonDraft(draft as unknown as Record<string, unknown>); void act("save_lesson_package", valid as unknown as Record<string, unknown>, "New draft saved. Review the version before publishing."); } catch (cause) { setError(cause instanceof Error ? cause.message : "Check your lesson update."); } }}>
        <label>Module<select value={draft.module} onChange={event => { const moduleNumber = Number(event.target.value); setDraft({ ...draft, module: moduleNumber, lessonSlug: authoringLessons[moduleNumber - 1][0].id }); }}>{authoringLessons.map((_, index) => <option key={index} value={index + 1}>Module {index + 1}</option>)}</select></label>
        <label>Lesson<select value={draft.lessonSlug} onChange={event => setDraft({ ...draft, lessonSlug: event.target.value })}>{authoringLessons[draft.module - 1].map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</select></label>
        <label>Who should see this update?<select value={draft.cohortId} onChange={event => setDraft({ ...draft, cohortId: event.target.value })}><option value="">Everyone in the course</option>{scopes.filter(scope => scope.status !== "archived" || scope.id === draft.cohortId).map(scope => <option key={scope.id} value={scope.id}>{scope.title}</option>)}</select></label>
        <label>Update title<input value={draft.title} minLength={3} maxLength={180} required onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="A clearer way to check AI answers" /></label>
        <label>What will teachers learn?<textarea rows={2} value={draft.package.learningGoal} minLength={10} maxLength={500} required onChange={event => updatePackage({ learningGoal: event.target.value })} placeholder="By the end, you can…" /></label>
        <label>Teaching text<textarea rows={8} value={draft.body} minLength={30} maxLength={16000} required onChange={event => setDraft({ ...draft, body: event.target.value })} /></label>
        <small>Use plain text and blank lines between paragraphs. Include a concrete example.</small>
        <details><summary>Reading and video links ({draft.package.media.length} of 6)</summary><p>Link to material you are allowed to share. Explain where to find captions, a transcript, or an accessible alternative.</p>
          {draft.package.media.map((item, index) => <fieldset key={index}><legend>Link {index + 1}</legend>
            <label>Type<select value={item.kind} onChange={event => updatePackage({ media: draft.package.media.map((entry, position) => position === index ? { ...entry, kind: event.target.value as "reading" | "video" } : entry) })}><option value="reading">Reading</option><option value="video">Video</option></select></label>
            <label>Link title<input value={item.title} minLength={3} maxLength={160} required onChange={event => updatePackage({ media: draft.package.media.map((entry, position) => position === index ? { ...entry, title: event.target.value } : entry) })} /></label>
            <label>HTTPS web address<input type="url" value={item.url} maxLength={1500} required onChange={event => updatePackage({ media: draft.package.media.map((entry, position) => position === index ? { ...entry, url: event.target.value } : entry) })} placeholder="https://…" /></label>
            <label>Captions, transcript or accessible alternative<textarea rows={2} value={item.accessibilityNote} minLength={10} maxLength={500} required onChange={event => updatePackage({ media: draft.package.media.map((entry, position) => position === index ? { ...entry, accessibilityNote: event.target.value } : entry) })} /></label>
            <button type="button" className="button button-secondary" onClick={() => updatePackage({ media: draft.package.media.filter((_, position) => position !== index) })}>Remove link {index + 1}</button>
          </fieldset>)}
          <button type="button" className="button button-secondary" disabled={draft.package.media.length >= 6} onClick={() => updatePackage({ media: [...draft.package.media, { kind: "reading", title: "", url: "", accessibilityNote: "" }] })}>Add a reading or video</button>
        </details>
        <fieldset><legend>Give teachers something to try</legend>
          <label>Activity title<input value={draft.package.activity.title} minLength={3} maxLength={160} required onChange={event => updatePackage({ activity: { ...draft.package.activity, title: event.target.value } })} /></label>
          <label>Activity instructions<textarea rows={4} value={draft.package.activity.instructions} minLength={30} maxLength={4000} required onChange={event => updatePackage({ activity: { ...draft.package.activity, instructions: event.target.value } })} /></label>
          <label>Reflection question<textarea rows={2} value={draft.package.activity.reflection} minLength={10} maxLength={500} required onChange={event => updatePackage({ activity: { ...draft.package.activity, reflection: event.target.value } })} /></label>
        </fieldset>
        <label className="platform-check"><input type="checkbox" checked={draft.package.rightsConfirmed} required onChange={event => updatePackage({ rightsConfirmed: event.target.checked })} />I have permission to share this material and have checked its suitability for teachers.</label>
        <div className="platform-actions"><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : "Save new draft"}</button><button type="button" className="button button-secondary" onClick={() => setPreview(!preview)} aria-expanded={preview} aria-controls="lesson-draft-preview">{preview ? "Hide preview" : "Preview as a learner"}</button></div>
      </form>
      {preview ? <article className="content-preview" id="lesson-draft-preview"><span className="eyebrow">Unpublished preview · {audience(draft.cohortId)}</span><LessonPackagePreview title={draft.title} body={draft.body} lessonPackage={draft.package} /></article> : null}
    </div>
    <div><div className="section-heading"><div><h2>Version history</h2><p>Showing the most recent 100 versions you can access. The original course stays available. Publishing replaces the previous update for the same lesson and audience.</p></div></div>
      <label className="platform-form">Show versions<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All versions</option><option value="draft">Drafts</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
      {history.length ? history.map(version => <article className="platform-panel" key={version.id}>
        <span className="eyebrow">Module {version.module_number} · Version {version.version} · {version.status}</span><h3>{version.title}</h3>
        <p className="platform-fineprint">{authoringLessons[version.module_number - 1]?.find(lesson => lesson.id === version.lesson_slug)?.title ?? version.lesson_slug}<br />{audience(version.cohort_id)}</p>
        <details><summary>Preview this saved version</summary><LessonPackagePreview title={version.title} body={version.body} lessonPackage={version.package} /></details>
        <div className="platform-actions"><button className="button button-secondary" disabled={busy} onClick={() => { setDraft(reviseLessonVersion(version)); setPreview(true); setError(""); }}>Revise as a new draft</button>
          {administrator && version.status !== "published" ? <button className="button button-primary" disabled={busy} onClick={() => void act("publish_content", { id: version.id }, "Update published for its selected audience. The previous version for that audience is archived.")}>Publish version {version.version}</button> : null}
          {administrator && version.status !== "archived" ? <button className="button button-secondary" disabled={busy} onClick={() => void act("archive_content", { id: version.id }, "Version archived. Its saved text remains in the history.")}>{version.status === "published" ? "Unpublish" : "Archive draft"}</button> : null}
        </div>
      </article>) : <p className="platform-empty">{versions.length ? "No versions match this filter." : "Save a useful clarification or classroom example to begin."}</p>}
    </div>
  </section>;
}
