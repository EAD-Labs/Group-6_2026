"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDemo } from "@/features/demo/demo-provider";
import type { AssistantSpec } from "@/features/demo/demo-state";
import { assistantHasEvidence, assistantHasPassport } from "@/features/learning/pathway";
import { staffroomChallenges } from "@/features/learning/staffroom-challenges";
import { appendPassportVersion, captureTestVersion, exportPassportVersions, passportHasUnversionedChanges, passportSnapshotFields, savedPassport } from "@/features/learning/assistant-versions";
import { preparedStaffroomReview } from "@/features/learning/staffroom-prepared";
import { AppShell } from "./app-shell";
import { HydrationGate } from "./ui/hydration-gate";
import { Icon } from "./ui/icon";

const starters: Pick<AssistantSpec, "name" | "purpose" | "persona" | "task" | "context" | "format" | "boundaries" | "reviewChecks">[] = [
  {
    name: "Misconception Detective", purpose: "Investigate possible reasoning behind fictional learner answers.",
    persona: "Support a teacher analysing practice responses without diagnosing any learner.",
    task: "For each fictional response identify observable evidence, up to two hypotheses, a diagnostic question and a teaching move.",
    context: "Require grade, objective, exact task, checked expected answer and two to five fictional responses. Ask when a required input is absent.",
    format: "Table: response ID, observed evidence, possible explanations, diagnostic question, teacher move, follow-up check.",
    boundaries: "No real learner records, labels of ability, automatic grading or predictions. Do not invent sources or policies.",
    reviewChecks: "Teacher verifies the expected answer and checks whether each hypothesis follows from the response evidence.",
  },
  {
    name: "Lesson Rehearsal Partner", purpose: "Help a teacher rehearse questions with an explicitly fictional learner.",
    persona: "Act as a synthetic learner for practice, then a reflective debrief partner.",
    task: "In REHEARSE mode give one short fictional response per teacher turn; after three turns, offer a DEBRIEF of teacher moves.",
    context: "Require concept, grade, teacher-selected misconception, objective and any verified notes. Ask for the misconception if absent.",
    format: "Label every response Synthetic teaching rehearsal; in debrief show teacher move, observed fictional response and improvement.",
    boundaries: "Do not claim to predict real children or invent distress, personal histories, stereotypes or diagnoses.",
    reviewChecks: "Teacher checks concept accuracy and revises a question that better elicits learner reasoning.",
  },
  {
    name: "Resource Rescue", purpose: "Adapt a lesson when materials, time, connectivity or grouping changes while preserving its objective.",
    persona: "Act as a practical planning partner to a teacher facing a changed classroom constraint.",
    task: "Restate the objective; offer two feasible alternatives with timings, learner actions, support and aligned assessment; explain trade-offs.",
    context: "Require original activity, objective, grade, time, class size, remaining materials and changed constraint.",
    format: "Objective; constraints; option A; option B; trade-offs; suggested choice; teacher checks.",
    boundaries: "Do not invent equipment, propose unsafe experiments or claim equivalence without preserving the learning goal.",
    reviewChecks: "Teacher verifies feasibility, accuracy, resources, inclusion and objective alignment before choosing.",
  },
];

const fields: { key: keyof AssistantSpec; label: string; help: string }[] = [
  { key: "name", label: "Assistant name", help: "Give a colleague a clear idea of the job." },
  { key: "purpose", label: "Purpose", help: "Name one recurring, low-risk teaching task." },
  { key: "persona", label: "Role and audience", help: "Who does it support, and for which learners?" },
  { key: "task", label: "Action", help: "What does it produce each time?" },
  { key: "context", label: "Required input", help: "What must the teacher supply before it can work?" },
  { key: "format", label: "Output format", help: "Describe structure, length and required parts." },
  { key: "boundaries", label: "Safety boundaries", help: "State what it must not infer or decide." },
  { key: "reviewChecks", label: "Teacher review checks", help: "What must be checked before classroom use?" },
];

const extendedFields: { key: keyof AssistantSpec; label: string; help: string }[] = [
  { key: "creatorCredit", label: "Creator / adapted from", help: "Credit the source of a remixed assistant." },
  { key: "optionalInputs", label: "Optional inputs", help: "Which details improve the result but are not essential?" },
  { key: "toolsPermitted", label: "Tools permitted", help: "State permitted tools or write none. This app does not grant outside tool access." },
  { key: "clarificationRule", label: "When to ask for clarification", help: "Which missing detail should stop a draft?" },
  { key: "stopRule", label: "When to hand back to teacher", help: "State the conflicts or safety limits that require teacher action." },
  { key: "sharingScope", label: "Sharing scope", help: "Who may reuse this Passport and source pack?" },
];

function newAssistant(starter?: typeof starters[number]): AssistantSpec {
  return {
    id: crypto.randomUUID(), version: 1, versions: [], name: starter?.name ?? "Untitled assistant", purpose: starter?.purpose ?? "",
    persona: starter?.persona ?? "", task: starter?.task ?? "", context: starter?.context ?? "",
    format: starter?.format ?? "", boundaries: starter?.boundaries ?? "", reviewChecks: starter?.reviewChecks ?? "",
    creatorCredit: starter ? "PromptShala curriculum starter; adapt before sharing" : "",
    clarificationRule: "Ask for missing required inputs instead of inventing them.",
    stopRule: "Stop on source conflicts or private learner data and ask the teacher to decide.",
    toolsPermitted: "None", sharingScope: "Private draft until teacher review",
    optionalInputs: "", sourcePack: "", classContextCard: "", handoffNotes: "", reuseDiary: "",
    rehearsalTranscript: "", revisedQuestion: "",
    weakness: "", revision: "", tests: [], updatedAt: new Date().toISOString(),
  };
}

const evidenceLabel = (mode?: string) => mode === "prepared" ? "Prepared example review — no AI run" : mode === "live" ? "Live response in PromptShala" : mode === "external" ? "Response from an approved external tool" : "Legacy record — evidence source not recorded";

export function assistantExportText(assistant: AssistantSpec) {
  return [
    `# ${assistant.name} · v${assistant.version ?? 1}`, "", `Creator / adapted from: ${assistant.creatorCredit ?? ""}`, `Purpose: ${assistant.purpose}`, `Role: ${assistant.persona}`,
    `Task: ${assistant.task}`, `Required context: ${assistant.context}`, `Output format: ${assistant.format}`,
    `Optional inputs: ${assistant.optionalInputs ?? ""}`, `Classroom context card: ${assistant.classContextCard ?? ""}`,
    `Approved source pack: ${assistant.sourcePack ?? ""}`,
    `Tools permitted: ${assistant.toolsPermitted ?? "None"}`, `Clarification rule: ${assistant.clarificationRule ?? ""}`,
    `Stop / hand back: ${assistant.stopRule ?? ""}`, `Boundaries: ${assistant.boundaries}`,
    `Teacher review: ${assistant.reviewChecks}`, `Sharing scope: ${assistant.sharingScope ?? ""}`,
    "", `Improvement approach: ${assistant.improvementApproach === "strengthen" ? "Strengthen an all-pass baseline" : "Repair an observed issue"}`, "", "Weakness or boundary to strengthen", assistant.weakness || "Not recorded", "", "Revision", assistant.revision || "Not recorded",
    "", "## Saved instruction versions", exportPassportVersions(assistant), "", "Test evidence (fictional/general inputs only)",
    ...assistant.tests.map((test, index) => `\n## Test ${index + 1} · ${test.caseId ?? "custom"} · v${test.version ?? 1} · ${test.verdict ?? "not rated"}\nEvidence: ${evidenceLabel(test.evidenceMode)}\nClassroom context for this run: ${test.classContextCard === undefined ? "Not recorded — historical conditions unavailable" : test.classContextCard || "None supplied (prepared case context is in the input)"}\nSource pack for this run: ${test.sourcePack === undefined ? "Not recorded — historical conditions unavailable" : test.sourcePack || "None supplied (prepared case sources are in the input)"}\nExpected: ${test.expected ?? ""}\nInput: ${test.input}\nOutput: ${test.output}\nTeacher review: ${test.review}`),
    "", "## Synthetic rehearsal", assistant.rehearsalTranscript || "Not recorded", "", "Revised teacher question", assistant.revisedQuestion || "Not recorded",
    "", "## Workflow handoffs", assistant.handoffNotes || "Not recorded", "", "## Reuse diary", assistant.reuseDiary || "Not recorded",
    "", "Before classroom use, verify facts, suitability, accessibility and privacy.",
  ].join("\n");
  }

function exportAssistant(assistant: AssistantSpec) {
  const text = assistantExportText(assistant);
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${assistant.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "assistant"}.md`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AiStaffroom() {
  const { storageScope } = useDemo();
  return <AiStaffroomWorkspace key={storageScope} />;
}
function AiStaffroomWorkspace() {
  const { state, updateState } = useDemo();
  const [deletedId, setDeletedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testReview, setTestReview] = useState("");
  const [testCaseId, setTestCaseId] = useState<string>(staffroomChallenges[0].id);
  const [testExpected, setTestExpected] = useState<string>(staffroomChallenges[0].expected);
  const [testVerdict, setTestVerdict] = useState<"pass" | "partial" | "fail" | "">("");
  const [testing, setTesting] = useState(false);
  const [liveRun, setLiveRun] = useState<{ assistantId: string; version: number; input: string; sourcePack: string; classContextCard: string } | null>(null);
  const [evidenceMode, setEvidenceMode] = useState<"live" | "external" | "prepared">("external");
  const requestController = useRef<AbortController | null>(null);
  useEffect(() => () => requestController.current?.abort(), []);
  const [testMessage, setTestMessage] = useState("");
  const visible = state.assistants.filter((assistant) => !assistant.deletedAt);
  const selected = visible.find((assistant) => assistant.id === activeId) ?? visible[0];
  const ready = selected ? assistantHasEvidence(selected) : false;
  const unsavedInstructionChanges = Boolean(selected && passportHasUnversionedChanges(selected));
  const baselineReady = Boolean(selected && staffroomChallenges.every(challenge => selected.tests.some(test => test.caseId === challenge.id && (test.version ?? 1) === 1 && test.verdict && [test.input, test.expected ?? "", test.output, test.review].every(value => value.trim().length >= 3))));
  const coveredCases = selected ? staffroomChallenges.filter((challenge) => selected.tests.some((test) => test.caseId === challenge.id && test.verdict)).length : 0;

  function add(starter?: typeof starters[number] | AssistantSpec) {
    const assistant = newAssistant(starter);
    if (starter && "id" in starter) {
      Object.assign(assistant, { ...starter, id: assistant.id, name: `${starter.name} — remix`, version: 1, versions: [], tests: [], weakness: "", revision: "", improvementApproach: "repair", deletedAt: undefined, updatedAt: new Date().toISOString(), creatorCredit: `Adapted from ${starter.name} v${starter.version ?? 1}` });
    }
    updateState((current) => ({ ...current, assistants: [...current.assistants, assistant] }));
    setActiveId(assistant.id);
    setTestInput(""); setTestOutput(""); setTestReview(""); setTestVerdict(""); setTestMessage("");
  }

  function edit(patch: Partial<AssistantSpec>) {
    if (!selected) return;
    updateState((current) => ({ ...current, assistants: current.assistants.map((assistant) =>
      assistant.id === selected.id ? { ...assistant, ...patch, updatedAt: new Date().toISOString() } : assistant,
    ) }));
  }

  function selectChallenge(id: string) {
    const challenge = staffroomChallenges.find((item) => item.id === id) ?? staffroomChallenges[0];
    setTestCaseId(challenge.id);
    setTestInput(challenge.input);
    setTestExpected(challenge.expected);
    setTestOutput(""); setTestReview(""); setTestVerdict(""); setTestMessage("");
  }

  function saveNewVersion() {
    if (!selected || selected.revision.trim().length < 3 || !baselineReady) return;
    const next = appendPassportVersion(selected, new Date().toISOString());
    edit({ version: next.version, versions: next.versions });
    setTestOutput(""); setTestReview(""); setTestVerdict("");
    if (evidenceMode === "live") setEvidenceMode("external");
    setTestMessage(`Version ${next.version} instructions saved. Repeat a case to review this version.`);
  }

  async function runTest() {
    if (!selected || testing || testInput.trim().length < 3) return;
    const runPassport = savedPassport(selected);
    const runAssistant = { ...selected, ...runPassport };
    if (!assistantHasPassport(runAssistant)) { setTestMessage("Complete the Passport fields before running a live test. Your draft remains editable."); return; }
    const frozen = captureTestVersion(runAssistant, new Date().toISOString());
    const conditions = { assistantId: selected.id, version: selected.version ?? 1, input: testInput.trim(), sourcePack: (selected.sourcePack ?? "").trim(), classContextCard: (selected.classContextCard ?? "").trim() };
    const controller = new AbortController();
    requestController.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30_000);
    setTesting(true); setTestMessage("");
    try {
      const response = await fetch("/api/assistant/test", {
        signal: controller.signal, method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...runAssistant, input: conditions.input, sourcePack: conditions.sourcePack, classContextCard: conditions.classContextCard }),
      });
      const payload = await response.json() as { output?: string; error?: string };
      if (!response.ok || !payload.output) throw new Error(payload.error ?? "Live test unavailable.");
      if (controller.signal.aborted) return;
      if (frozen !== runAssistant) edit({ versions: frozen.versions });
      setLiveRun(conditions); setEvidenceMode("live");
      setTestOutput(payload.output);
      setTestMessage("Draft returned. Review it before saving the test.");
    } catch (error) {
      setTestMessage(controller.signal.aborted ? "Test stopped. Your input is preserved; retry or choose a prepared example review." : error instanceof Error ? error.message : "Live test unavailable.");
    } finally { clearTimeout(timeout); requestController.current = null; setTesting(false); }
  }

  function loadPrepared() {
    if (!selected) return;
    const sample = preparedStaffroomReview(testCaseId, selected.version ?? 1);
    setTestInput(sample.input); setTestExpected(sample.expected); setTestOutput(sample.output);
    setEvidenceMode("prepared"); setTestReview(""); setTestVerdict("");
    setTestMessage("Original prepared example loaded. Review the supplied response; this is not an AI run of your Passport.");
  }

  function saveTest() {
    if (!selected || testInput.trim().length < 3 || testOutput.trim().length < 3 || testReview.trim().length < 3 || !testVerdict) return;
    if (evidenceMode === "live" && (!liveRun || liveRun.assistantId !== selected.id || liveRun.input !== testInput.trim())) { setTestMessage("Run this input again before saving its live response."); return; }
    if (evidenceMode !== "prepared" && !assistantHasPassport({ ...selected, ...savedPassport(selected) })) { setTestMessage("Complete the Passport before saving an actual test. Prepared examples remain available."); return; }
    const frozen = evidenceMode === "prepared" && !assistantHasPassport(selected) ? selected : captureTestVersion(selected, new Date().toISOString());
    const conditions = evidenceMode === "prepared" ? { sourcePack: "", classContextCard: "" } : evidenceMode === "live" ? liveRun! : { sourcePack: (selected.sourcePack ?? "").trim(), classContextCard: (selected.classContextCard ?? "").trim() };
    edit({ versions: frozen.versions, tests: [...selected.tests, {
      id: crypto.randomUUID(), evidenceMode, sourcePack: conditions.sourcePack, classContextCard: conditions.classContextCard, caseId: testCaseId, expected: testExpected.trim(), verdict: testVerdict,
      version: evidenceMode === "live" ? liveRun!.version : selected.version ?? 1, input: testInput.trim(), output: testOutput.trim(),
      review: testReview.trim(), createdAt: new Date().toISOString(),
    }] });
    setTestInput(""); setTestOutput(""); setTestReview(""); setTestVerdict("");
    setTestMessage("Reviewed test saved.");
  }

  return <HydrationGate><AppShell active="learn" contentClassName="learning-reading-scale">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/learn/module-3">Module 3</Link><Icon name="chevron-right" /><span>AI Staffroom</span></nav>
    <header className="page-heading"><div><span className="eyebrow">Module 3 · Build, test, repair</span><h1>AI Staffroom</h1><p>Make a reusable teaching assistant you can inspect, test and safely share.</p></div></header>
    <div className="privacy-card wide"><Icon name="shield" /><div><strong>Use fictional or general examples only.</strong><p>Do not enter student names, marks, records or confidential material. Review every AI draft before classroom use.</p></div></div>
    <section className="staffroom-starters"><div className="section-heading"><div><span className="eyebrow">Adopt and remix</span><h2>Start from a teaching job</h2></div><button className="button button-secondary button-small" disabled={testing} onClick={() => add()} type="button">Blank Passport</button></div><div className="staffroom-template-grid">{starters.map((starter) => <article key={starter.name}><span className="eyebrow">Starter template</span><h3>{starter.name}</h3><p>{starter.purpose}</p><button className="text-link" disabled={testing} onClick={() => add(starter)} type="button">Adopt and edit <Icon name="arrow-right" /></button></article>)}</div></section>
    {deletedId ? <div className="staffroom-message feedback-box supportive" role="status"><p>Assistant removed from this workspace.</p><button className="text-link" type="button" onClick={() => { updateState((current) => ({ ...current, assistants: current.assistants.map((assistant) => assistant.id === deletedId ? { ...assistant, deletedAt: undefined, updatedAt: new Date().toISOString() } : assistant) })); setActiveId(deletedId); setDeletedId(null); }}>Undo removal</button></div> : null}
    <nav className="lesson-section-jump" aria-label="Staffroom sections"><a href="#assistant-passport">1. Define the job</a><a href="#assistant-tests">2. Test the boundaries</a><a href="#assistant-repair">3. Repair and retest</a><a href="#assistant-transfer">4. Rehearse and transfer</a></nav>
    <div className="staffroom-layout"><aside className="staffroom-library"><span className="eyebrow">Your assistants</span><h2>Saved Passports</h2>{visible.length ? <ul>{visible.map((assistant) => <li key={assistant.id}><button aria-current={selected?.id === assistant.id ? "true" : undefined} className={selected?.id === assistant.id ? "active" : ""} disabled={testing} onClick={() => { setActiveId(assistant.id); setTestInput(""); setTestOutput(""); setTestReview(""); setTestVerdict(""); setTestMessage(""); }} type="button"><strong>{assistant.name}</strong><small>{assistant.tests.length} test{assistant.tests.length === 1 ? "" : "s"} · {assistantHasEvidence(assistant) ? "Evidence ready" : "In progress"}</small></button></li>)}</ul> : <p>No assistant yet. Choose a starter above.</p>}</aside>
      {selected ? <article id="assistant-passport" className="staffroom-editor"><div className="section-heading"><div><span className="eyebrow">Agent Passport</span><h2>{selected.name}</h2></div><span className={ready ? "status-pill passed" : "status-pill available"}>{ready ? "Evidence ready" : "Draft saved"}</span></div>
        <p className="staffroom-intro">Version {selected.version ?? 1}. A clear Passport separates reusable instructions from each new classroom input. Draft changes save with your participant progress. A saved instruction version stays unchanged after its first test.</p>{unsavedInstructionChanges ? <p className="feedback-box supportive" role="status">Your current Passport differs from saved version {selected.version ?? 1}. Tests use that saved version until you save the next version below. Finish the six initial cases before moving on.</p> : null}
        <fieldset className="staffroom-workspace-fields" disabled={testing}><legend className="visually-hidden">Assistant specification and reviewed evidence</legend><div className="staffroom-fields">{fields.map((field) => <label key={field.key}><strong>{field.label}</strong><small>{field.help}</small>{field.key === "name" ? <input maxLength={100} onChange={(event) => edit({ [field.key]: event.target.value })} value={String(selected[field.key])} /> : <textarea maxLength={2000} onChange={(event) => edit({ [field.key]: event.target.value })} rows={3} value={String(selected[field.key])} />}</label>)}</div>
        <details className="staffroom-extra"><summary>Passport source, tool and sharing details</summary><div className="staffroom-fields">{extendedFields.map((field) => <label key={field.key}><strong>{field.label}</strong><small>{field.help}</small><textarea maxLength={2500} onChange={(event) => edit({ [field.key]: event.target.value })} rows={3} value={String(selected[field.key] ?? "")} /></label>)}</div></details>
        <section className="staffroom-repair"><span className="eyebrow">Classroom context and knowledge pack</span><h2>Set the conditions for this run</h2><p>Keep the reusable Passport above separate from the classroom facts supplied for each test. Use fictional or general details and name what is unknown.</p><label><strong>Class context for challenge tests</strong><small>Include subject and grade, objective, prior knowledge, language, class size, time, materials, supports and any constraints.</small><textarea maxLength={2500} onChange={(event) => edit({ classContextCard: event.target.value })} placeholder={"Subject and grade: …\nObjective: …\nPrior knowledge: …\nLanguage and class size: …\nTime and materials: …\nSupports and constraints: …\nUnknowns: …"} rows={7} value={selected.classContextCard ?? ""} /></label><label><strong>Approved source pack</strong><small>Paste short, non-sensitive notes with a label and date. Test what the pack answers, what it omits and where two notes conflict.</small><textarea maxLength={2500} onChange={(event) => edit({ sourcePack: event.target.value })} placeholder={"Source A (fictional, dated): …\nSource B (fictional, dated): …"} rows={5} value={selected.sourcePack ?? ""} /></label></section>
        <div className="staffroom-actions"><button className="button button-secondary button-small" onClick={() => add(selected)} type="button"><Icon name="document" />Duplicate / remix</button><button className="button button-secondary button-small" onClick={() => exportAssistant(selected)} type="button"><Icon name="document" />Export Markdown package</button><button className="text-link" onClick={() => { setDeletedId(selected.id); edit({ deletedAt: new Date().toISOString() }); }} type="button">Delete assistant</button></div>
        <section id="assistant-tests" className="staffroom-test">
          <span className="eyebrow">Six situations to test</span>
          <h2>See where the instructions hold up.</h2><p>Record responses for saved instruction version {selected.version ?? 1}. Live tests use its retained instructions; use the same version in any external tool.</p>
          <p>Test normal use, missing context, absent evidence, conflicts, quoted instructions and transfer. Record what you expected, what happened and your verdict. Unrun cases stay unrun.</p>
          <div className="staffroom-case-grid">{staffroomChallenges.map((challenge) => {
            const done = selected.tests.some((test) => test.caseId === challenge.id && test.verdict);
            return <button aria-pressed={testCaseId === challenge.id} className={testCaseId === challenge.id ? "active" : ""} key={challenge.id} onClick={() => selectChallenge(challenge.id)} type="button"><strong>{challenge.id} · {challenge.label}</strong><small>{done ? "Recorded" : "Not run"}</small></button>;
          })}</div>
          <p><strong>{coveredCases}/6 cases recorded.</strong> The cards provide fictional examples; adapt them to your assistant&apos;s purpose while keeping the expected behavior. The saved context card and source pack travel with a live test.</p>
          <label><strong>Evidence source</strong><select value={evidenceMode} onChange={event => { setEvidenceMode(event.target.value as typeof evidenceMode); setTestOutput(""); setTestReview(""); setTestVerdict(""); }}><option value="external">Output from an approved external tool</option><option value="prepared">Prepared example review · no AI run</option>{evidenceMode === "live" ? <option value="live">Live response from PromptShala</option> : null}</select></label><p className="draft-note">Without AI access, inspect our original prepared response excerpts. They illustrate these six cases for a teaching assistant; they do not test your own Passport. Your log and export keep this distinction.</p>{evidenceMode === "prepared" ? <button className="button button-secondary button-small" type="button" onClick={loadPrepared}>Load prepared response for {testCaseId}</button> : null}
          <label><strong>Expected behavior</strong><textarea maxLength={1200} onChange={(event) => setTestExpected(event.target.value)} rows={2} value={testExpected} /></label>
          <label><strong>Classroom input</strong><textarea maxLength={2500} onChange={(event) => { setTestInput(event.target.value); setTestOutput(""); setTestReview(""); setTestVerdict(""); if (evidenceMode === "live") setEvidenceMode("external"); }} rows={4} value={testInput} /></label>
          <button className="button button-secondary button-small" aria-busy={testing} disabled={testing || evidenceMode === "prepared" || testInput.trim().length < 3 || !assistantHasPassport({ ...selected, ...savedPassport(selected) })} onClick={runTest} type="button">{testing ? "Running test…" : "Run live test"}</button>
          {testMessage ? <p role="status" className="staffroom-message">{testMessage}</p> : null}
          <label><strong>{evidenceMode === "prepared" ? "Prepared response to inspect" : "Actual output"}</strong><small>{evidenceMode === "prepared" ? "Inspect this teacher-written example. A passing review here is evidence of the exercise, not measured AI behaviour." : "Paste an actual result from an approved tool, or run a live test. Choose prepared example review if no generation service is available."}</small><textarea readOnly={evidenceMode === "live"} maxLength={6000} onChange={(event) => setTestOutput(event.target.value)} rows={7} value={testOutput} /></label>
          <label><strong>Teacher review and diagnosis</strong><small>Compare actual and expected behavior; name whether the issue comes from instructions, input, sources or tools.</small><textarea maxLength={2500} onChange={(event) => setTestReview(event.target.value)} rows={3} value={testReview} /></label>
          <label><strong>Verdict</strong><select onChange={(event) => setTestVerdict(event.target.value as typeof testVerdict)} value={testVerdict}><option value="">Choose after review</option><option value="pass">Pass</option><option value="partial">Partial</option><option value="fail">Fail</option></select></label>
          <p className="draft-note" id="test-save-help">To save a test, record its input, expected behavior, actual or labelled prepared response, your review and a verdict. Choose a case card to load an example.</p><button aria-describedby="test-save-help" className="button button-primary button-small" disabled={!testVerdict || [testInput, testExpected, testOutput, testReview].some((value) => value.trim().length < 3)} onClick={saveTest} type="button">Save reviewed test <Icon name="check" /></button>
          {selected.tests.length ? <div className="staffroom-test-log"><h3>Test evidence by version</h3>{selected.tests.map((test, index) => <details key={test.id}><summary>{test.caseId || "Custom"} · v{test.version ?? 1} · {test.verdict || "Unrated"} · Test {index + 1}</summary><p><strong>Evidence:</strong> {evidenceLabel(test.evidenceMode)}</p><p><strong>Run context:</strong> {test.classContextCard === undefined ? "Historical conditions unavailable. Remix this assistant to start a fresh baseline before comparing." : test.classContextCard || "Prepared case context is included in the input."}</p><p><strong>Run sources:</strong> {test.sourcePack === undefined ? "Historical source pack unavailable." : test.sourcePack || "Prepared case sources are included in the input."}</p><p><strong>Expected:</strong> {test.expected || "Not recorded"}</p><p><strong>Input:</strong> {test.input}</p><p><strong>Reviewed response:</strong> {test.output}</p><p><strong>Teacher review:</strong> {test.review}</p></details>)}</div> : null}
        </section>
        <section id="assistant-repair" className="staffroom-repair"><span className="eyebrow">Repair loop</span><h2>Repair a failure or strengthen the next version</h2><label><strong>Improvement route</strong><select value={selected.improvementApproach ?? "repair"} onChange={event => edit({ improvementApproach: event.target.value as "repair" | "strengthen" })}><option value="repair">Repair an observed partial result or failure</option><option value="strengthen">All six initial cases passed · strengthen a boundary</option></select></label><label><strong>{selected.improvementApproach === "strengthen" ? "Boundary to strengthen" : "Observed weakness"}</strong><small>{selected.improvementApproach === "strengthen" ? "Keep the passing verdicts. Name a real remaining limitation or ambiguity to address; do not invent a failure." : "Point to the exact issue in a live, external or clearly labelled prepared response."}</small><textarea maxLength={2000} onChange={(event) => edit({ weakness: event.target.value })} rows={3} value={selected.weakness} /></label><label><strong>Revised instruction</strong><small>Write the instruction you changed and why it should address the weakness.</small><textarea maxLength={2000} onChange={(event) => edit({ revision: event.target.value })} rows={3} value={selected.revision} /></label><p>{selected.improvementApproach === "strengthen" ? "After all six version 1 cases pass, make one justified instruction improvement. Save version 2 and repeat three distinct original cases with exactly the same inputs, source packs and classroom context, including the boundary you strengthened." : "Record all six cases under version 1. Update the Passport, save version 2, then repeat the same failing input and two previously passing inputs, keeping their source packs and classroom context unchanged. If fewer than two initially passed, first refine and review two baseline cases honestly."} For prepared practice, inspect the version 2 response for the same cases and explain the comparison. Keep prepared and actual response comparisons separate.</p><button className="button button-secondary button-small" aria-describedby="staffroom-version-help" disabled={!baselineReady || selected.revision.trim().length < 3} onClick={saveNewVersion} type="button">Save version {(selected.version ?? 1) + 1}</button><p id="staffroom-version-help" className="draft-note">{!baselineReady ? "Record all six initial cases under version 1 before starting version 2." : selected.revision.trim().length < 3 ? "Describe the instruction change before saving the next version." : "Your initial cases are recorded. Save the next version after changing the Passport instructions."}</p>{[...new Set([selected.version ?? 1, ...(selected.versions ?? []).map(item => item.version), ...selected.tests.map(test => test.version ?? 1)])].sort((a, b) => a - b).map(number => { const version = selected.versions?.find(item => item.version === number); return <details className="staffroom-extra" key={number}><summary>Version {number} instructions</summary><p>{version?.note ?? "No version note recorded."}</p>{version?.snapshot ? <dl>{passportSnapshotFields.map(field => <div key={field}><dt><strong>{field.replace(/([A-Z])/g, " $1")}</strong></dt><dd>{version.snapshot?.[field] || "Not supplied"}</dd></div>)}</dl> : <p>Historical instruction snapshot unavailable. The current draft is not evidence of this version’s instructions.</p>}</details>; })}</section>
        <section id="assistant-transfer" className="staffroom-repair"><span className="eyebrow">Classroom rehearsal</span><h2>Practise three teacher turns</h2><p>Use the Lesson Rehearsal Partner with a teacher-selected misconception. Record three teacher questions and three explicitly synthetic responses, then debrief. A simulation does not predict any real child.</p><label><strong>Three-turn synthetic transcript and debrief</strong><small>Label each simulated learner response as synthetic practice data.</small><textarea maxLength={2500} onChange={(event) => edit({ rehearsalTranscript: event.target.value })} placeholder={"Misconception: …\nTurn 1 teacher: …\nSynthetic learner: …\nTurn 2 teacher: …\nSynthetic learner: …\nTurn 3 teacher: …\nSynthetic learner: …\nDebrief: …"} rows={8} value={selected.rehearsalTranscript ?? ""} /></label><label><strong>Revised teacher question</strong><small>Change one question to reveal reasoning more clearly; rerun if possible.</small><textarea maxLength={1000} onChange={(event) => edit({ revisedQuestion: event.target.value })} rows={2} value={selected.revisedQuestion ?? ""} /></label></section>
        <section className="staffroom-repair"><span className="eyebrow">Staffroom Relay</span><h2>Write the handoff and stop point</h2><p>Manually pass a concise note from Planner → Misconception Detective → Resource Rescue. Include approved objective, source labels, classroom constraints, unresolved issues and one human intervention. This is a teacher-led workflow.</p><label><strong>Two handoff notes and teacher intervention</strong><textarea maxLength={2500} onChange={(event) => edit({ handoffNotes: event.target.value })} placeholder={"Planner → Detective: objective, sources, constraints…\nDetective → Resource Rescue: misconceptions, unresolved issues…\nTeacher stop/approval: …"} rows={5} value={selected.handoffNotes ?? ""} /></label></section>
        <section className="staffroom-repair"><span className="eyebrow">Reuse diary</span><h2>Transfer to another context</h2><p>Ask a colleague to try a different topic or grade, or use an unseen facilitator scenario and label it self-transfer. Record the new context, help needed, correction time and limitation before exporting.</p><label><strong>Reuse and handoff record</strong><textarea maxLength={2500} onChange={(event) => edit({ reuseDiary: event.target.value })} placeholder={"New context: …\nColleague reuse or self-transfer: …\nHelp or correction needed: …\nTime spent reviewing: …\nKnown limitation: …"} rows={5} value={selected.reuseDiary ?? ""} /></label></section>
        </fieldset>{testing ? <div className="staffroom-message" role="status"><p>Waiting for the response. The current assistant and input are held while this test runs.</p><button type="button" className="button button-secondary" onClick={() => requestController.current?.abort()}>Cancel live test</button></div> : null}<div className="staffroom-completion"><strong>{ready ? "Your required Staffroom evidence is complete." : `Complete the Passport, context card, source pack, six challenge cases (${coveredCases}/6 recorded), a versioned improvement with three comparisons, synthetic rehearsal, workflow handoff and reuse diary.`}</strong><Link className="button button-primary button-small" href="/learn/module-3">Return to pathway <Icon name="arrow-right" /></Link></div>
      </article> : <section className="staffroom-empty"><Icon name="book" /><h2>Start with one recurring teaching job.</h2><p>Choose a starter above or write your own brief. Your Passport will hold its instructions, tests and revisions.</p><button className="button button-primary" type="button" onClick={() => add()}>Create a blank Passport<Icon name="arrow-right" /></button></section>}</div>
  </AppShell></HydrationGate>;
}
