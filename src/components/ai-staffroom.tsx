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
import { useGeminiKey } from "./gemini-key-provider";

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
  { key: "name", label: "Helper name", help: "Give it a name that describes its job." },
  { key: "purpose", label: "What will it help you with?", help: "Choose one teaching task you do often." },
  { key: "persona", label: "Who should it act as?", help: "For example, a lesson-planning partner for a Class 6 teacher." },
  { key: "task", label: "What should it do?", help: "Tell it what to make or help you practise." },
  { key: "context", label: "What will you tell it each time?", help: "For example, the topic, class level and time available." },
  { key: "format", label: "How should the answer look?", help: "For example, a short table or a 20-minute lesson outline." },
  { key: "boundaries", label: "What should it avoid?", help: "For example, guessing missing facts or using private student details." },
  { key: "reviewChecks", label: "What will you check?", help: "List what you will check before using its answer in class." },
];

const extendedFields: { key: keyof AssistantSpec; label: string; help: string }[] = [
  { key: "creatorCredit", label: "Creator / adapted from", help: "Credit the source of a remixed assistant." },
  { key: "optionalInputs", label: "Optional inputs", help: "Which details improve the result but are not essential?" },
  { key: "toolsPermitted", label: "Tools permitted", help: "State permitted tools or write none. This app does not grant outside tool access." },
  { key: "clarificationRule", label: "When to ask for clarification", help: "Which missing detail should stop a draft?" },
  { key: "stopRule", label: "When to hand back to teacher", help: "State the conflicts or safety limits that require teacher action." },
  { key: "sharingScope", label: "Sharing scope", help: "Who may reuse these instructions and notes?" },
];

function newAssistant(starter?: typeof starters[number]): AssistantSpec {
  return {
    id: crypto.randomUUID(), version: 1, versions: [], name: starter?.name ?? "My teaching helper", purpose: starter?.purpose ?? "",
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
  const { requestHeaders } = useGeminiKey();
  const [step, setStep] = useState(0);
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
      Object.assign(assistant, { ...starter, id: assistant.id, name: `${starter.name} — copy`, version: 1, versions: [], tests: [], weakness: "", revision: "", improvementApproach: "repair", deletedAt: undefined, updatedAt: new Date().toISOString(), creatorCredit: `Adapted from ${starter.name} v${starter.version ?? 1}` });
    }
    updateState((current) => ({ ...current, assistants: [...current.assistants, assistant] }));
    setActiveId(assistant.id);
    setStep(0);
    setTestCaseId(staffroomChallenges[0].id); setTestExpected(staffroomChallenges[0].expected);
    setTestInput(staffroomChallenges[0].input); setTestOutput(""); setTestReview(""); setTestVerdict(""); setTestMessage("");
  }

  function edit(patch: Partial<AssistantSpec>) {
    if (!selected) return;
    updateState((current) => ({ ...current, assistants: current.assistants.map((assistant) =>
      assistant.id === selected.id ? { ...assistant, ...patch, updatedAt: new Date().toISOString() } : assistant,
    ) }));
  }

  function selectChallenge(id: string) {
    const challenge = staffroomChallenges.find((item) => item.id === id) ?? staffroomChallenges[0];
    const original = (selected?.version ?? 1) > 1 ? selected?.tests.find((test) => test.caseId === challenge.id && (test.version ?? 1) === 1) : undefined;
    setTestCaseId(challenge.id);
    setTestInput(original?.input ?? challenge.input);
    setTestExpected(original?.expected || challenge.expected);
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
    if (!assistantHasPassport(runAssistant)) { setTestMessage("Finish your helper’s instructions in step 1 before asking AI to try it."); return; }
    const frozen = captureTestVersion(runAssistant, new Date().toISOString());
    const conditions = { assistantId: selected.id, version: selected.version ?? 1, input: testInput.trim(), sourcePack: (selected.sourcePack ?? "").trim(), classContextCard: (selected.classContextCard ?? "").trim() };
    const controller = new AbortController();
    requestController.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30_000);
    setTesting(true); setTestMessage("");
    try {
      const response = await fetch("/api/assistant/test", {
        signal: controller.signal, method: "POST", headers: { "Content-Type": "application/json", ...requestHeaders() },
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
    setTestMessage("Sample answer loaded. Read and review this teacher-written example. It was not generated by your helper.");
  }

  function saveTest() {
    if (!selected || testInput.trim().length < 3 || testOutput.trim().length < 3 || testReview.trim().length < 3 || !testVerdict) return;
    if (evidenceMode === "live" && (!liveRun || liveRun.assistantId !== selected.id || liveRun.input !== testInput.trim())) { setTestMessage("Run this input again before saving its live response."); return; }
    if (evidenceMode !== "prepared" && !assistantHasPassport({ ...selected, ...savedPassport(selected) })) { setTestMessage("Finish your helper’s instructions in step 1 before saving an AI response. You can still review a sample answer."); return; }
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

  const stepNames = ["Set up", "Try an example", "Improve", "Use in class"];
  const basicFields = fields.filter((field) => ["name", "purpose", "task", "context"].includes(field.key));
  const answerFields = fields.filter((field) => !["name", "purpose", "task", "context"].includes(field.key));
  function instructionField(field: typeof fields[number]) {
    return <label key={field.key}><strong id={`helper-${field.key}-label`}>{field.label}</strong><small id={`helper-${field.key}-help`}>{field.help}</small>{field.key === "name" ? <input aria-labelledby={`helper-${field.key}-label`} aria-describedby={`helper-${field.key}-help`} maxLength={100} onChange={(event) => edit({ [field.key]: event.target.value })} value={String(selected?.[field.key] ?? "")} /> : <textarea aria-labelledby={`helper-${field.key}-label`} aria-describedby={`helper-${field.key}-help`} maxLength={2000} onChange={(event) => edit({ [field.key]: event.target.value })} rows={3} value={String(selected?.[field.key] ?? "")} />}</label>;
  }
  const starterCards = <div className="staffroom-template-grid">{starters.map((starter, index) => <article key={starter.name}><span className="workbench-icon"><Icon name={index === 0 ? "target" : index === 1 ? "user" : "refresh"} /></span><h3>{index === 0 ? "Understand a learner’s answer" : index === 1 ? "Practise your teaching questions" : "Adapt a lesson when plans change"}</h3><p>{index === 0 ? "Explore why a fictional learner may have made a mistake, and choose a useful next question." : index === 1 ? "Rehearse a short classroom conversation before trying it in your lesson." : "Find another way to teach the same idea with less time or fewer materials."}</p><button className="text-link" disabled={testing} onClick={() => add(starter)} type="button">Use this starting point <Icon name="arrow-right" /></button></article>)}</div>;

  return <HydrationGate><AppShell active="learn" contentClassName="learning-reading-scale workbench-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/learn/module-3">Create a teaching helper</Link><Icon name="chevron-right" /><span>AI Staffroom</span></nav>
    <header className="page-heading workbench-heading"><div><span className="eyebrow">Your teaching helpers</span><h1>A little help with everyday teaching.</h1><p>Choose a teaching task, give AI clear instructions, and try an example. Save those instructions to use again.</p></div><span className="workbench-label"><Icon name="book" />AI Staffroom</span></header>
    <div className="workbench-explainer"><Icon name="info" /><p><strong>What is a teaching helper?</strong> A set of instructions you save for a task you repeat. For example: “Help me adapt this lesson for a class with no projector.”</p></div>
    {selected ? <details className="workbench-starter-picker"><summary>Choose another starting point</summary>{starterCards}<button className="button button-secondary button-small" disabled={testing} onClick={() => add()} type="button">Write my own instructions</button></details> : <section className="staffroom-starters"><div className="section-heading"><div><span className="eyebrow">Start here</span><h2>What would you like help with?</h2><p>Pick a starting point. You can change every instruction.</p></div></div>{starterCards}<div className="workbench-secondary-start"><span>Have another task in mind?</span><button className="text-link" disabled={testing} onClick={() => add()} type="button">Write my own instructions <Icon name="arrow-right" /></button></div></section>}
    {deletedId ? <div className="staffroom-message feedback-box supportive" role="status"><p>Helper removed.</p><button className="text-link" type="button" onClick={() => { updateState((current) => ({ ...current, assistants: current.assistants.map((assistant) => assistant.id === deletedId ? { ...assistant, deletedAt: undefined, updatedAt: new Date().toISOString() } : assistant) })); setActiveId(deletedId); setDeletedId(null); }}>Undo removal</button></div> : null}
    {selected ? <>
      <nav className="workbench-stepper" aria-label="Teaching helper steps">{stepNames.map((name, index) => <button key={name} type="button" aria-label={`${index + 1} ${name}`} aria-pressed={step === index} disabled={testing} onClick={() => setStep(index)}><span>{index + 1}</span>{name}</button>)}</nav>
      <div className="staffroom-layout"><aside className="staffroom-library"><span className="eyebrow">Saved automatically</span><h2>Your helpers</h2><ul>{visible.map((assistant) => <li key={assistant.id}><button aria-current={selected.id === assistant.id ? "true" : undefined} className={selected.id === assistant.id ? "active" : ""} disabled={testing} onClick={() => { setActiveId(assistant.id); setStep(0); setTestInput(""); setTestOutput(""); setTestReview(""); setTestVerdict(""); setTestMessage(""); }} type="button"><strong>{assistant.name}</strong><small>{assistantHasEvidence(assistant) ? "Course practice complete" : `${assistant.tests.length} saved reviews`}</small></button></li>)}</ul></aside>
      <article className="staffroom-editor workbench-current-panel" aria-label={`${stepNames[step]} your teaching helper`}>
        <div className="workbench-panel-heading"><div><span className="eyebrow">Step {step + 1} of 4</span><h2>{step === 0 ? "Tell your helper what to do." : step === 1 ? "See how it answers." : step === 2 ? "Make the instructions better." : "Try it in another teaching situation."}</h2></div><span className="status-pill available">{ready ? "Practice complete" : "Draft saved"}</span></div>
        <fieldset className="staffroom-workspace-fields" disabled={testing}><legend className="visually-hidden">Teaching helper instructions and practice</legend>
        {step === 0 ? <section id="assistant-passport">
          <p className="staffroom-intro">These instructions stay the same each time. You will add the topic and classroom details when you use your helper.</p>
          <div className="staffroom-fields">{basicFields.map(instructionField)}</div>
          <details className="staffroom-extra" open={!assistantHasPassport(selected)}><summary>How it should answer and what you will check</summary><div className="staffroom-fields">{answerFields.map(instructionField)}</div></details>
          <details className="staffroom-extra"><summary>Credits, sharing and other options</summary><div className="staffroom-fields">{extendedFields.map((field) => <label key={field.key}><strong>{field.label}</strong><small>{field.help}</small><textarea maxLength={2500} onChange={(event) => edit({ [field.key]: event.target.value })} rows={3} value={String(selected[field.key] ?? "")} /></label>)}</div></details>
          {unsavedInstructionChanges ? <p className="feedback-box supportive" role="status">Your instructions have changed since version {selected.version ?? 1}. The examples still use the saved version. Save your next version in the Improve step after completing the first six reviews.</p> : null}
          <div className="workbench-next"><p>Your changes save automatically.</p><button type="button" className="button button-primary" onClick={() => setStep(1)}>Next: try an example <Icon name="arrow-right" /></button></div>
        </section> : null}
        {step === 1 ? <section id="assistant-tests" className="workbench-practice-panel">
          <p>Choose a situation below. Read a ready example, or ask AI to try your saved instructions. Then check the answer.</p>
          <div className="workbench-safety"><Icon name="shield" /><p>Use made-up or general classroom details. Keep student names, marks and private records out of your examples.</p></div>
          <details className="staffroom-extra"><summary>Add classroom details and trusted notes</summary><p>These details belong to this classroom task. They travel with an AI response so you can compare it fairly later.</p><label><strong>Classroom details for these examples</strong><small>Include subject, class level, goal, time, materials and support learners may need.</small><textarea maxLength={2500} onChange={(event) => edit({ classContextCard: event.target.value })} placeholder={"Class 5 maths · 40 learners in pairs\nGoal: explain whether 1/2 or 1/3 is greater\nTime: 15 minutes · paper and pencils\nSupport: draw equal-sized wholes before comparing"} rows={5} value={selected.classContextCard ?? ""} /></label><label><strong>Trusted notes for the helper</strong><small>Paste a short note you are allowed to use. Give each note a name and date so you can check the answer against it.</small><textarea maxLength={2500} onChange={(event) => edit({ sourcePack: event.target.value })} placeholder={"Note A (practice text, 10 October 2026): When the whole is the same size, splitting it into fewer equal parts makes each part larger.\nUnknown: the next examination date has not been supplied."} rows={5} value={selected.sourcePack ?? ""} /></label></details>
          <div className="staffroom-case-grid">{staffroomChallenges.map((challenge) => {
            const done = selected.tests.some((test) => test.caseId === challenge.id && test.verdict);
            return <button aria-pressed={testCaseId === challenge.id} className={testCaseId === challenge.id ? "active" : ""} key={challenge.id} onClick={() => selectChallenge(challenge.id)} type="button"><strong>{challenge.id} · {challenge.label}</strong><small>{done ? "Review saved" : "Try this example"}</small></button>;
          })}</div>
          <p className="workbench-small"><strong>{coveredCases} of 6 situations reviewed.</strong> Each one checks a different part of your helper’s instructions.</p>
          <label><strong>Where will the answer come from?</strong><select value={evidenceMode} onChange={event => { setEvidenceMode(event.target.value as typeof evidenceMode); setTestOutput(""); setTestReview(""); setTestVerdict(""); }}><option value="external">Ask AI here, or paste an answer from another tool</option><option value="prepared">Read a ready example · no AI needed</option>{evidenceMode === "live" ? <option value="live">AI response from PromptShala</option> : null}</select></label>
          <label><strong>What you want the helper to handle</strong><textarea maxLength={2500} onChange={(event) => { setTestInput(event.target.value); setTestOutput(""); setTestReview(""); setTestVerdict(""); if (evidenceMode === "live") setEvidenceMode("external"); }} placeholder="Choose a situation above to fill this in, or write your own example." rows={5} value={testInput} /></label>
          <details className="staffroom-extra"><summary>What a useful answer should do</summary><label><strong>Expected answer</strong><textarea maxLength={1200} onChange={(event) => setTestExpected(event.target.value)} rows={3} value={testExpected} /></label></details>
          <div className="platform-actions"><button className="button button-primary button-small" aria-busy={testing} disabled={testing || evidenceMode === "prepared" || testInput.trim().length < 3 || !assistantHasPassport({ ...selected, ...savedPassport(selected) })} onClick={runTest} type="button">{testing ? "Trying your example…" : "Ask AI to try it"}</button><button className="button button-secondary button-small" type="button" onClick={loadPrepared}>Read sample answer for {testCaseId}</button></div>
          {!assistantHasPassport({ ...selected, ...savedPassport(selected) }) ? <p className="draft-note">Complete the instructions in Set up to ask AI. You can read a sample answer now.</p> : null}
          {testMessage ? <p role="status" className="staffroom-message">{testMessage}</p> : null}
          <label><strong>{evidenceMode === "prepared" ? "Sample answer to review" : "Answer to review"}</strong><small>{evidenceMode === "prepared" ? "This is a teacher-written example. It shows what to check; it does not measure your helper’s performance." : "Ask AI above, or paste the answer you received from a school-approved AI tool."}</small><textarea readOnly={evidenceMode === "live"} maxLength={6000} onChange={(event) => setTestOutput(event.target.value)} rows={7} value={testOutput} /></label>
          <label><strong>What did you notice?</strong><small>What was useful? What was missing or wrong? Compare the answer with what you expected.</small><textarea maxLength={2500} onChange={(event) => setTestReview(event.target.value)} placeholder="The answer asked for the missing class level instead of guessing. That was the right next step." rows={3} value={testReview} /></label>
          <label><strong>How well did it work?</strong><select onChange={(event) => setTestVerdict(event.target.value as typeof testVerdict)} value={testVerdict}><option value="">Choose after reviewing</option><option value="pass">Worked as expected</option><option value="partial">Partly worked</option><option value="fail">Needs a change</option></select></label>
          <p className="draft-note" id="test-save-help">Add an answer, your review and a rating to save this example.</p><button aria-describedby="test-save-help" className="button button-primary button-small" disabled={!testVerdict || [testInput, testExpected, testOutput, testReview].some((value) => value.trim().length < 3)} onClick={saveTest} type="button">Save my review <Icon name="check" /></button>
          {selected.tests.length ? <details className="staffroom-extra staffroom-test-log"><summary>Your saved reviews ({selected.tests.length})</summary>{selected.tests.map((test, index) => <details key={test.id}><summary>{test.caseId || "Custom"} · version {test.version ?? 1} · {test.verdict === "pass" ? "Worked as expected" : test.verdict === "partial" ? "Partly worked" : "Needs a change"} · review {index + 1}</summary><p><strong>Answer source:</strong> {evidenceLabel(test.evidenceMode)}</p><p><strong>Classroom details:</strong> {test.classContextCard === undefined ? "Earlier details were not recorded. Copy this helper to start a new set of examples before comparing." : test.classContextCard || "Practice classroom details are included in the example."}</p><p><strong>Trusted notes:</strong> {test.sourcePack === undefined ? "Earlier notes were not recorded." : test.sourcePack || "Practice notes are included in the example."}</p><p><strong>Expected:</strong> {test.expected || "Not recorded"}</p><p><strong>Your example:</strong> {test.input}</p><p><strong>Answer:</strong> {test.output}</p><p><strong>Your review:</strong> {test.review}</p></details>)}</details> : null}
          <div className="workbench-next"><p>Review all six situations for the course exercise.</p><button type="button" className="button button-secondary" onClick={() => setStep(2)}>Next: improve the instructions <Icon name="arrow-right" /></button></div>
        </section> : null}
        {step === 2 ? <section id="assistant-repair" className="workbench-practice-panel">
          <p>Use what you noticed to make one clear improvement. Saving a new version keeps the original instructions and reviews for comparison.</p>
          <label><strong>What are you improving?</strong><select value={selected.improvementApproach ?? "repair"} onChange={event => edit({ improvementApproach: event.target.value as "repair" | "strengthen" })}><option value="repair">Something that did not work</option><option value="strengthen">A limitation, even though the first six examples worked</option></select></label>
          <label><strong>{selected.improvementApproach === "strengthen" ? "What could be clearer?" : "What needs to change?"}</strong><small>Point to a specific answer from your saved reviews. Keep the original ratings honest.</small><textarea maxLength={2000} onChange={(event) => edit({ weakness: event.target.value })} placeholder="In T3, the answer guessed a date that was not in the note." rows={3} value={selected.weakness} /></label>
          <label><strong>What instruction did you change, and why?</strong><small>Change the helper’s instructions in Set up, then describe that change here.</small><textarea maxLength={2000} onChange={(event) => edit({ revision: event.target.value })} placeholder="I added: ‘If the notes do not include a date, ask for an approved calendar.’ This should prevent guesses." rows={3} value={selected.revision} /></label>
          <button className="text-link" type="button" onClick={() => setStep(0)}>Edit my helper’s instructions <Icon name="arrow-right" /></button>
          <div className="workbench-guidance"><strong>A fair comparison, in three steps</strong><ol><li>Save reviews for all six original situations.</li><li>Change an instruction and save the next version below.</li><li>Repeat three different situations with the same input and classroom notes. Include the issue you improved and two that already worked.</li></ol><p>If you are using ready examples, compare their version 1 and version 2 answers. Keep sample reviews separate from actual AI responses.</p></div>
          <button className="button button-primary button-small" aria-describedby="staffroom-version-help" disabled={!baselineReady || selected.revision.trim().length < 3} onClick={saveNewVersion} type="button">Save version {(selected.version ?? 1) + 1}</button>{testMessage.startsWith("Version ") ? <p className="staffroom-message" role="status">{testMessage}</p> : null}<p id="staffroom-version-help" className="draft-note">{!baselineReady ? "First, save all six reviews for version 1 in Try an example." : selected.revision.trim().length < 3 ? "Describe your instruction change before saving." : "Ready to save your next instruction version."}</p>
          {[...new Set([selected.version ?? 1, ...(selected.versions ?? []).map(item => item.version), ...selected.tests.map(test => test.version ?? 1)])].sort((a, b) => a - b).map(number => { const version = selected.versions?.find(item => item.version === number); return <details className="staffroom-extra" key={number}><summary>View version {number} instructions</summary><p>{version?.note ?? "No version note recorded."}</p>{version?.snapshot ? <dl>{passportSnapshotFields.map(field => <div key={field}><dt><strong>{field.replace(/([A-Z])/g, " $1")}</strong></dt><dd>{version.snapshot?.[field] || "Not supplied"}</dd></div>)}</dl> : <p>This version’s earlier instructions were not recorded. The current draft cannot stand in for them.</p>}</details>; })}
          <div className="workbench-next"><button className="button button-secondary" type="button" onClick={() => setStep(1)}>Return to examples</button><button className="button button-secondary" type="button" onClick={() => setStep(3)}>Next: use in class <Icon name="arrow-right" /></button></div>
        </section> : null}
        {step === 3 ? <section id="assistant-transfer" className="workbench-practice-panel">
          <p>Before a real lesson, practise how you will use the helper. Check every answer yourself and record what a colleague would need to know.</p>
          <details className="staffroom-extra" open><summary>1. Practise a short teaching conversation</summary><p>Use the Lesson Rehearsal Partner. Choose a misunderstanding, ask three teaching questions and record three made-up learner answers. The practice does not predict a real child.</p><label><strong>Your practice conversation and what you learned</strong><small>Mark each made-up learner answer as “Practice learner”.</small><textarea maxLength={2500} onChange={(event) => edit({ rehearsalTranscript: event.target.value })} placeholder={"Misunderstanding: …\nQuestion 1: …\nPractice learner: …\nQuestion 2: …\nPractice learner: …\nQuestion 3: …\nPractice learner: …\nWhat I learned: …"} rows={8} value={selected.rehearsalTranscript ?? ""} /></label><label><strong>Your improved teaching question</strong><textarea maxLength={1000} onChange={(event) => edit({ revisedQuestion: event.target.value })} rows={2} value={selected.revisedQuestion ?? ""} /></label></details>
          <details className="staffroom-extra"><summary>2. Pass useful notes between your helpers</summary><p>Try a planning helper, the Misconception Detective, then Resource Rescue. Write what each one needs from the previous step, and where you need to step in.</p><label><strong>Two shared notes and your decision</strong><textarea maxLength={2500} onChange={(event) => edit({ handoffNotes: event.target.value })} placeholder={"Planning helper to Detective: goal, trusted notes, classroom limits…\nDetective to Resource Rescue: possible misunderstanding, open questions…\nMy check or decision: …"} rows={5} value={selected.handoffNotes ?? ""} /></label></details>
          <details className="staffroom-extra"><summary>3. Try another topic or class</summary><p>Ask a colleague to try your instructions, or try a new practice situation yourself. Record what needed changing and how long you spent checking it.</p><label><strong>What happened in the new situation?</strong><textarea maxLength={2500} onChange={(event) => edit({ reuseDiary: event.target.value })} placeholder={"New topic and class: …\nWho tried it: …\nHelp or correction needed: …\nTime spent checking: …\nA limitation to remember: …"} rows={5} value={selected.reuseDiary ?? ""} /></label></details>
          <div className="staffroom-completion"><strong>{ready ? "Your teaching-helper course practice is complete." : "Your work is saved. Complete the classroom notes, six reviews, improvement comparisons and practice records to finish this course exercise."}</strong><Link className="button button-primary button-small" href="/learn/module-3">Return to learning <Icon name="arrow-right" /></Link></div>
        </section> : null}
        </fieldset>
        {testing ? <div className="staffroom-message" role="status"><p>Trying your example. Your instructions and input are held while the answer is prepared.</p><button type="button" className="button button-secondary" onClick={() => requestController.current?.abort()}>Stop this request</button></div> : null}
        <details className="workbench-helper-actions"><summary>Download, copy or remove this helper</summary><div className="staffroom-actions"><button className="button button-secondary button-small" disabled={testing} onClick={() => exportAssistant(selected)} type="button"><Icon name="document" />Download instructions and reviews</button><button className="button button-secondary button-small" disabled={testing} onClick={() => add(selected)} type="button">Make a copy</button><button className="text-link" disabled={testing} onClick={() => { setDeletedId(selected.id); edit({ deletedAt: new Date().toISOString() }); }} type="button">Remove helper</button></div></details>
      </article></div>
    </> : <div className="workbench-entry-note"><Icon name="check" /><p>No setup needed to read the practice examples. Your helper will save as you work.</p></div>}
  </AppShell></HydrationGate>;
}
