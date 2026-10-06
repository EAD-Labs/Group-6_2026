"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { moduleOneLessons, moduleOneQuizQuestions } from "@/features/learning/catalog";
import { moduleTwoLessons, moduleTwoQuizQuestions } from "@/features/learning/module-two-content";
import { moduleThreeLessons, moduleThreeQuizQuestions } from "@/features/learning/module-three-content";
import { moduleFourLessons, moduleFourQuizQuestions } from "@/features/learning/module-four-content";
import { csvCell } from "@/features/platform/reporting";
import { duration, type LearningDetail, type RosterPerson } from "@/features/analytics/report-types";

const lessons = [moduleOneLessons.map(l => ({ id: l.slug, title: l.title })), moduleTwoLessons, moduleThreeLessons, moduleFourLessons];
const banks = [moduleOneQuizQuestions, moduleTwoQuizQuestions, moduleThreeQuizQuestions, moduleFourQuizQuestions];
const date = (value: string | null) => value ? new Date(value).toLocaleString("en-GB") : "No activity yet";
type Roster = { total: number; page: number; people: RosterPerson[] };
function exportRows(filename: string, rows: unknown[][]) {
  const url = URL.createObjectURL(new Blob([rows.map(row => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function read<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { cache: "no-store", signal }); const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "The report could not be loaded.");
  return payload;
}
export function AdminLearningAnalytics() {
  const [search, setSearch] = useState(""), [query, setQuery] = useState(""), [page, setPage] = useState(0), [version, setVersion] = useState(0);
  const [roster, setRoster] = useState<Roster | null>(null), [selected, setSelected] = useState<string | null>(null), [detail, setDetail] = useState<LearningDetail | null>(null);
  const [eventsPage, setEventsPage] = useState(0), [error, setError] = useState(""), [loading, setLoading] = useState(true);
  const refresh = useCallback(() => setVersion(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    read<Roster>(`/api/admin/analytics?search=${encodeURIComponent(query)}&page=${page}`, controller.signal)
      .then(data => { setRoster(data); setError(""); setLoading(false); })
      .catch(error => { if (error.name !== "AbortError") { setError(error.message); setLoading(false); } });
    return () => controller.abort();
  }, [query, page, version]);
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    read<LearningDetail>(`/api/admin/analytics?participant=${selected}&eventsPage=${eventsPage}`, controller.signal)
      .then(data => { setDetail(data); setError(""); setLoading(false); })
      .catch(error => { if (error.name !== "AbortError") { setError(error.message); setLoading(false); } });
    return () => controller.abort();
  }, [selected, eventsPage, version]);
  const searchPeople = (event: FormEvent) => { event.preventDefault(); setQuery(search); setPage(0); setLoading(true); refresh(); };
  const open = (id: string) => { setDetail(null); setSelected(id); setEventsPage(0); setLoading(true); };
  return <section className="learning-analytics" aria-busy={loading}>
    <div className="section-heading"><div><h2>All users & learning activity</h2><p>See every account, including users outside a cohort. Activity covers the last 90 days, beginning with this pilot release.</p></div><button className="button button-secondary" disabled={loading} onClick={() => { setLoading(true); refresh(); }}>Refresh reports</button></div>
    {error ? <p className="platform-message error" role="alert">{error}</p> : null}
    <form className="analytics-search" onSubmit={searchPeople}><label>Find a user<input value={search} maxLength={100} placeholder="Name or email" onChange={event => setSearch(event.target.value)} /></label><button className="button button-primary" disabled={loading}>Search</button></form>
    {roster ? <article className="platform-panel"><div className="section-heading"><h3>{roster.total} registered user{roster.total === 1 ? "" : "s"}</h3><button className="button button-secondary" onClick={() => exportRows("PromptShala-users-page.csv", [["Name", "Email", "Role", "Completed lessons", "Module scores", "Active time (seconds)", "Last activity"], ...roster.people.map(person => [person.name, person.email, person.role, person.completedLessons, person.modules.map(m => `M${m.module}: ${m.bestScore ?? 0}%`).join("; "), person.activeMs / 1000, person.lastActivityAt])])}>Export this page</button></div>
    <div className="table-scroll"><table className="platform-table"><caption>Participant progress and scores</caption><thead><tr><th>User</th><th>Lessons</th><th>Best quiz scores</th><th>Active time</th><th>Last activity</th><th>Details</th></tr></thead><tbody>{roster.people.map(person => <tr key={person.id}><th scope="row">{person.name}<br /><small>{person.email} · {person.role}</small></th><td>{person.completedLessons}/29</td><td>{[1,2,3,4].map(module => <span className="analytics-score" key={module}>M{module}: {person.modules.find(m => m.module === module)?.bestScore ?? "—"}{person.modules.some(m => m.module === module) ? "%" : ""}</span>)}</td><td>{duration(person.activeMs)}</td><td>{date(person.lastActivityAt)}</td><td><button className="button button-secondary button-small" aria-label={`View activity for ${person.name}`} onClick={() => open(person.id)}>View activity</button></td></tr>)}</tbody></table></div>
    {!roster.people.length ? <p>No users match this search.</p> : null}<div className="platform-actions"><button className="button button-secondary" disabled={!page || loading} onClick={() => { setPage(page - 1); setLoading(true); }}>Previous users</button><span>Page {page + 1} of {Math.max(1, Math.ceil(roster.total / 25))}</span><button className="button button-secondary" disabled={(page + 1) * 25 >= roster.total || loading} onClick={() => { setPage(page + 1); setLoading(true); }}>Next users</button></div></article> : null}
    {loading ? <p role="status">Loading learning report…</p> : null}
    {detail && selected === detail.person.id ? <article className="platform-panel analytics-detail"><div className="section-heading"><div><span className="eyebrow">Individual learning report</span><h3>{detail.person.name}</h3><p>{detail.person.email} · Joined {date(detail.person.createdAt)}<br />Last sign in: {date(detail.person.lastSignInAt)}</p></div><button className="button button-secondary" onClick={() => { setSelected(null); setDetail(null); }}>Close report</button></div>
      <h4>Module and chapter progress</h4><div className="analytics-modules">{lessons.map((moduleLessons, i) => { const progress = detail.modules.find(m => m.module === i + 1); const completed = detail.completedLessons?.[String(i + 1)] ?? []; return <div key={i}><strong>Module {i + 1} · {progress?.status?.replaceAll("_", " ") ?? "Available"}</strong><p>Best score: {progress?.bestScore === undefined || progress?.bestScore === null ? "No attempt" : `${progress.bestScore}%`}</p><ul>{moduleLessons.map(lesson => <li key={lesson.id}><span aria-label={completed.includes(lesson.id) ? "Completed" : "Not completed"}>{completed.includes(lesson.id) ? "✓" : "○"}</span> {lesson.title}</li>)}</ul></div>; })}</div>
      <h4>Page time & clicks</h4><p>Active time counts visible use, pausing after 60 seconds without interaction. It is an estimate of activity, and does not measure attention.</p><div className="table-scroll"><table className="platform-table"><caption>Page activity for {detail.person.name}</caption><thead><tr><th>Page</th><th>Visits</th><th>Active time</th><th>Clicks</th><th>Last seen</th></tr></thead><tbody>{detail.pages.map(row => <tr key={row.path}><th scope="row">{row.path}</th><td>{row.visits}</td><td>{duration(row.activeMs)}</td><td>{row.clicks}</td><td>{date(row.lastSeenAt)}</td></tr>)}</tbody></table></div>{!detail.pages.length ? <p>No page activity recorded yet.</p> : null}
      <h4>Question retries & time to correct</h4><p>A check records the selected answer when a user leaves a question or submits. Wrong checks may include edits before submission. Active time adds those question visits up to the first correct check; elapsed time also includes breaks. These observations are separate from submitted quiz scores.</p><button className="button button-secondary" onClick={() => exportRows("PromptShala-question-progress.csv", [["Module", "Question", "Version", "Wrong checks before correct", "Checks", "Active milliseconds to correct", "Elapsed milliseconds to correct", "First correct"], ...detail.questions.map(q => [q.module, q.questionId, q.contentVersion, q.wrongChecks, q.checks, q.activeToCorrectMs, q.elapsedToCorrectMs, q.firstCorrectAt])])}>Export question report</button>
      <div className="table-scroll"><table className="platform-table"><caption>Question progress for {detail.person.name}</caption><thead><tr><th>Question</th><th>Wrong before correct</th><th>Checks</th><th>Active time</th><th>Elapsed to correct</th><th>First correct</th></tr></thead><tbody>{detail.questions.map(q => <tr key={`${q.questionId}:${q.contentVersion}`}><th scope="row">M{q.module} · {q.questionId}<br /><small>{banks[q.module - 1]?.find(question => question.id === q.questionId)?.prompt ?? "Earlier course question"}</small><br /><small>Version: {q.contentVersion}</small></th><td>{q.wrongChecks}</td><td>{q.checks}</td><td>{duration(q.activeToCorrectMs)}{!q.firstCorrectAt ? " so far" : " to correct"}</td><td>{q.elapsedToCorrectMs === null ? "Not yet correct" : duration(q.elapsedToCorrectMs)}</td><td>{q.firstCorrectAt ? date(q.firstCorrectAt) : "Not yet correct"}</td></tr>)}</tbody></table></div>{!detail.questions.length ? <p>No question activity recorded yet.</p> : null}
      <h4>Submitted quiz attempts</h4><div className="table-scroll"><table className="platform-table"><caption>Server-graded quiz history</caption><thead><tr><th>Module</th><th>Attempt</th><th>Score</th><th>Result</th><th>Submitted</th></tr></thead><tbody>{detail.attempts.map(attempt => <tr key={attempt.id}><td>{attempt.module}</td><td>{attempt.number}</td><td>{attempt.score}%</td><td>{attempt.passed ? "Passed" : "Retry"}</td><td>{date(attempt.submittedAt)}</td></tr>)}</tbody></table></div>{!detail.attempts.length ? <p>No submitted quizzes yet.</p> : null}
      <h4>Clickstream & answer timeline</h4><p>Newest events first. Click targets use control identifiers and page paths. Field contents, passwords and private drafts are excluded.</p><div className="table-scroll"><table className="platform-table"><caption>Learning activity timeline</caption><thead><tr><th>When</th><th>Event</th><th>Page / control</th><th>Question / answer</th><th>Active time</th></tr></thead><tbody>{detail.events.map(event => <tr key={event.id}><td>{date(event.occurred_at)}</td><td>{event.kind.replaceAll("_", " ")}</td><td>{event.path}{event.target ? <><br /><small>{event.target}</small></> : null}</td><td>{event.question_id ?? "—"}{event.selected_options ? <><br />{event.selected_options.join(", ").toUpperCase()} · {event.correct ? "Correct" : "Wrong"}</> : null}</td><td>{event.active_ms ? duration(event.active_ms) : "—"}</td></tr>)}</tbody></table></div><div className="platform-actions"><button className="button button-secondary" disabled={!eventsPage || loading} onClick={() => { setEventsPage(eventsPage - 1); setLoading(true); }}>Newer events</button><span>{detail.eventsTotal} events · Page {eventsPage + 1}</span><button className="button button-secondary" disabled={(eventsPage + 1) * 50 >= detail.eventsTotal || loading} onClick={() => { setEventsPage(eventsPage + 1); setLoading(true); }}>Older events</button></div>
    </article> : null}
  </section>;
}
