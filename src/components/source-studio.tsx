"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/features/demo/demo-provider";
import {
  artifactTypes, auditIsCorrect, buildPracticeDraft, buildSourcePrompt, emptySourcePortfolio,
  exportSourcePortfolio, sourceAuditCount, sourceCases, sourcePortfolioReady, sourceReviewChecks,
  verdicts, type ClaimAudit, type SourcePortfolio,
} from "@/features/learning/source-studio";
import { AppShell } from "./app-shell";
import { HydrationGate } from "./ui/hydration-gate";
import { Icon } from "./ui/icon";

export function SourceStudio() {
  const { state, updateState } = useDemo();
  const portfolio = state.sourcePortfolio;
  const current = sourceCases.find((item) => item.id === portfolio.caseId) ?? sourceCases[0];
  const [nextCase, setNextCase] = useState(current.id);
  const [step, setStep] = useState(0);
  const [activeClaim, setActiveClaim] = useState(0);
  const [checked, setChecked] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [pendingFormat, setPendingFormat] = useState<SourcePortfolio["artifactType"] | null>(null);
  const audits = sourceAuditCount(portfolio);
  const ready = sourcePortfolioReady(portfolio);
  const prompt = buildSourcePrompt(portfolio);
  const references = current.sources.flatMap((source) => source.lines.map((line, index) => ({ id: `${source.id}:${index + 1}`, line })));

  function edit(patch: Partial<SourcePortfolio>, resetReview = false) {
    updateState((before) => ({ ...before, sourcePortfolio: { ...before.sourcePortfolio, ...patch,
      ...(resetReview ? { reviewChecks: [] } : {}) } }));
    setMessage("");
  }
  function editAudit(id: string, patch: Partial<ClaimAudit>) {
    const audit = portfolio.audits[id] ?? { verdict: "", references: [], note: "" };
    edit({ audits: { ...portfolio.audits, [id]: { ...audit, ...patch } } }, true);
    setChecked((before) => before.filter((claim) => claim !== id));
  }
  function startCase() {
    const chosen = sourceCases.find((item) => item.id === nextCase)!;
    edit({ ...emptySourcePortfolio, caseId: chosen.id, objective: chosen.objective, audience: chosen.audience });
    setChecked([]); setActiveClaim(0);
  }
  async function copyPrompt() {
    try { await navigator.clipboard.writeText(prompt); setMessage("AI request copied. Add only material you are allowed to use in the other tool."); }
    catch { setMessage("Copy was unavailable. Select the prompt text below and copy it manually."); }
  }
  function download() {
    const blob = new Blob([exportSourcePortfolio(portfolio)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `promptshala-${current.id}-portfolio.md`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(ready ? "Portfolio exported with your review record. This is practice evidence, not a certificate." : "Draft exported. Incomplete evidence is clearly marked in the file.");
  }

  return <HydrationGate><AppShell active="learn" contentClassName="learning-reading-scale workbench-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/learn/module-4">Make teaching resources</Link><Icon name="chevron-right" /><span>Source Studio</span></nav>
    <header className="source-studio-heading page-heading"><div><span className="eyebrow">Source Studio · guided practice</span><h1>Turn trusted notes into a teaching resource.</h1><p>Try a short practice text, check the facts, and make something useful for your learners.</p></div><span className={`status-pill ${ready ? "passed" : "available"}`}>{ready ? "Practice complete" : `${audits}/3 facts checked`}</span></header>
    <nav className="workbench-stepper" aria-label="Resource practice steps">{["Choose a text", "Check the facts", "Make a resource", "Review & save"].map((name, index) => <button key={name} type="button" aria-label={`${index + 1} ${name}`} aria-pressed={step === index} onClick={() => setStep(index)}><span>{index + 1}</span>{name}</button>)}</nav>
    <div className="source-studio-intro"><Icon name="info" /><p>Start with our ready examples. You do not need an AI account for this practice. To use your own lesson notes later, open the teaching resource workspace.</p></div>

    {step === 0 ? <section className="source-panel source-brief workbench-current-panel" id="source-brief" aria-labelledby="source-brief-title">
      <div className="section-heading"><div><span className="eyebrow">Step 1 of 4</span><h2 id="source-brief-title">Choose something to teach.</h2></div><span className="section-meta">Three practice cases</span></div>
      <div className="source-case-picker"><label htmlFor="source-case"><span id="source-case-label">Practice text</span><select aria-labelledby="source-case-label" id="source-case" value={nextCase} onChange={(event) => setNextCase(event.target.value)}>{sourceCases.map((item) => <option key={item.id} value={item.id}>{item.subject} · {item.title}</option>)}</select></label><button type="button" className="button button-secondary button-small" disabled={nextCase === current.id} onClick={startCase}>Start with this text</button></div>
      <p className="source-helper">Starting another text replaces your current practice. Download your work first to keep a copy.</p>
      <div className="source-case-caption"><span>{current.audience} / {current.subject}</span><h3>{current.title}</h3><p>{current.hook}</p></div>
      <div className="source-brief-fields"><label>What should learners be able to do?<input maxLength={500} placeholder={current.objective} value={portfolio.objective} onChange={(event) => edit({ objective: event.target.value }, true)} /></label><label>Who is this for?<input maxLength={120} placeholder={current.audience} value={portfolio.audience} onChange={(event) => edit({ audience: event.target.value }, true)} /></label><label>A name for these notes<input maxLength={160} placeholder="For example: Water changes · practice notes A and B" value={portfolio.sourceLabel} onChange={(event) => edit({ sourceLabel: event.target.value }, true)} /></label><label htmlFor="source-permission"><span id="source-permission-label">Permission to use these notes</span><select id="source-permission" aria-labelledby="source-permission-label" value={portfolio.sourcePermission} onChange={(event) => edit({ sourcePermission: event.target.value as SourcePortfolio["sourcePermission"] }, true)}><option value="">Choose after reading</option><option value="original">I made the notes, or have permission from the creator</option><option value="licensed">The licence allows this use</option><option value="permission">I have permission for this activity</option></select></label></div>
      <label className="source-checkbox"><input type="checkbox" checked={portfolio.sourceSafe} onChange={(event) => edit({ sourceSafe: event.target.checked }, true)} /><span>I checked these notes contain no student names, private records or confidential details.</span></label>
      <div className="workbench-next"><p>You can edit the goal and class above.</p><button type="button" className="button button-primary" onClick={() => setStep(1)}>Next: check the facts <Icon name="arrow-right" /></button></div>
    </section> : null}

    {step === 1 ? <section className="source-panel workbench-current-panel" id="source-audit" aria-labelledby="source-audit-title">
      <div className="section-heading"><div><span className="eyebrow">Step 2 of 4</span><h2 id="source-audit-title">Does the text support the answer?</h2></div><span className="section-meta">{audits}/3 facts checked</span></div>
      <p>Some of these statements contain mistakes. Read the notes on the left, choose how the statement matches them, and select the lines that helped you decide.</p>
      <nav className="workbench-claim-picker" aria-label="Statements to check">{current.claims.map((claim, index) => <button key={claim.id} type="button" aria-pressed={activeClaim === index} onClick={() => setActiveClaim(index)}>Statement {index + 1}{auditIsCorrect(current.id, claim.id, portfolio.audits[claim.id] ?? { verdict: "", references: [], note: "" }) ? <Icon name="check" /> : null}</button>)}</nav><div className="source-audit-layout">
        <aside className="source-pack" aria-label="Source passages">{current.sources.map((source) => <article key={source.id}><div><span className="source-label">{source.id}</span><h3>{source.title}</h3></div><p className="source-credit">{source.credit}</p><ol>{source.lines.map((line, index) => <li key={line} id={`passage-${source.id}-${index + 1}`}><span>{source.id}:{index + 1}</span><p>{line}</p></li>)}</ol></article>)}</aside>
        <div className="source-claims">{current.claims.slice(activeClaim, activeClaim + 1).map((claim) => {
          const index = activeClaim;
          const audit = portfolio.audits[claim.id] ?? { verdict: "", references: [], note: "" };
          const correct = auditIsCorrect(current.id, claim.id, audit);
          return <article className="source-claim" key={claim.id} aria-labelledby={`claim-${claim.id}`}><span className="eyebrow">Statement {index + 1} of 3</span><h3 id={`claim-${claim.id}`}>{claim.text}</h3>
            <label htmlFor={`verdict-${claim.id}`}><span id={`verdict-label-${claim.id}`}>How does it match the notes?</span><select aria-labelledby={`verdict-label-${claim.id}`} id={`verdict-${claim.id}`} value={audit.verdict} onChange={(event) => editAudit(claim.id, { verdict: event.target.value as ClaimAudit["verdict"] })}><option value="">Choose after reading</option>{verdicts.map((verdict) => <option key={verdict} value={verdict}>{{ supported: "The notes support it", unsupported: "The notes do not tell us", contradicted: "The notes say something different", conflict: "The notes disagree with each other" }[verdict]}</option>)}</select></label>
            <fieldset className="source-reference-list"><legend>Which lines helped you decide?</legend>{references.map((ref) => <label key={ref.id} title={ref.line}><input type="checkbox" checked={audit.references.includes(ref.id)} onChange={(event) => editAudit(claim.id, { references: event.target.checked ? [...audit.references, ref.id] : audit.references.filter((id) => id !== ref.id) })} /><span>Note {ref.id.split(":")[0]}, line {ref.id.split(":")[1]}</span></label>)}</fieldset>
            <label htmlFor={`reason-${claim.id}`}>Explain your choice<textarea id={`reason-${claim.id}`} maxLength={1000} rows={3} value={audit.note} placeholder="For example: Note A, line 2 says evaporation can happen below boiling. So this statement needs correcting." onChange={(event) => editAudit(claim.id, { note: event.target.value })} /></label>
            <button type="button" className="button button-secondary button-small" onClick={() => setChecked((before) => [...new Set([...before, claim.id])])}>Check statement {index + 1}</button>
            {checked.includes(claim.id) ? <div role="status" className={`source-audit-feedback ${correct ? "correct" : "needs-review"}`}><strong>{correct ? "Your choice and selected lines match." : "Take another look at the notes."}</strong><p>{claim.explanation}</p><small>Answer: {claim.verdict}. Helpful lines: {claim.references.join(", ")}. Add a short explanation in your own words (at least 20 characters).</small></div> : null}
          </article>;
        })}</div>
      </div>
      <div className="workbench-next"><button type="button" className="button button-secondary" onClick={() => setStep(0)}>Back to your text</button>{activeClaim < 2 ? <button type="button" className="button button-primary" onClick={() => setActiveClaim(activeClaim + 1)}>Next statement <Icon name="arrow-right" /></button> : <button type="button" className="button button-primary" onClick={() => setStep(2)}>Next: make a resource <Icon name="arrow-right" /></button>}</div>
    </section> : null}

    {step === 2 ? <section className="source-panel workbench-current-panel" id="source-draft" aria-labelledby="source-draft-title">
      <div className="section-heading"><div><span className="eyebrow">Step 3 of 4</span><h2 id="source-draft-title">Make something useful for your lesson.</h2></div></div>
      <div className="source-make-layout"><div className="source-prompt"><label htmlFor="artifact-type"><span id="artifact-type-label">What would you like to make?</span><select aria-labelledby="artifact-type-label" id="artifact-type" value={portfolio.artifactType} onChange={(event) => { const format = event.target.value as SourcePortfolio["artifactType"]; if (portfolio.draft.trim() || portfolio.revisionNote.trim()) setPendingFormat(format); else edit({ artifactType: format }, true); }}>{artifactTypes.map((type) => <option key={type} value={type}>{type.replaceAll("-", " ")}</option>)}</select></label>{pendingFormat ? <div className="feedback-box supportive" role="group" aria-label="Change artifact format"><div><strong>Keep your current draft?</strong><p>Changing to {pendingFormat.replaceAll("-", " ")} clears the current draft, revision note and review checks. Export first to keep a copy, or keep writing this version.</p><div className="platform-actions"><button className="button button-secondary button-small" type="button" onClick={() => setPendingFormat(null)}>Keep current draft</button><button className="button button-secondary button-small" type="button" onClick={() => { edit({ artifactType: pendingFormat, draft: "", revisionNote: "" }, true); setPendingFormat(null); }}>Change format and clear draft</button><button className="text-link" type="button" onClick={download}>Export current draft</button></div></div></div> : null}<details className="workbench-external-tool"><summary>Try this with an AI notebook (optional)</summary><h3>Your ready-to-copy AI request</h3><pre>{prompt}</pre><button className="button button-secondary button-small" type="button" onClick={copyPrompt}>Copy AI request <Icon name="document" /></button><a className="text-link" href="https://notebook.google.com/" target="_blank" rel="noreferrer">Open Google’s notebook tool <Icon name="arrow-right" /></a><p className="source-helper">Use only material you are allowed to share. This opens another website; your Google account is not connected to this practice.</p></details></div>
        <div className="source-draft-editor"><button type="button" className="button button-secondary button-small" onClick={() => edit({ draft: buildPracticeDraft(current.id, portfolio.artifactType), revisionNote: "" }, true)}>Use a sample {portfolio.artifactType.replaceAll("-", " ")}</button><p className="source-helper">This teacher-written sample replaces the draft below. Edit it for your teaching goal and learners.</p><label htmlFor="source-artifact">Your classroom resource<textarea id="source-artifact" maxLength={6000} rows={16} value={portfolio.draft} onChange={(event) => edit({ draft: event.target.value }, true)} placeholder="Use a sample above, or write your own resource. Include the note and line number beside each fact." /></label><small>{portfolio.draft.trim().length}/100 minimum characters</small><label htmlFor="source-revision">What did you change, and why?<textarea id="source-revision" maxLength={1500} rows={4} value={portfolio.revisionNote} onChange={(event) => edit({ revisionNote: event.target.value }, true)} placeholder="For example: I corrected the boiling statement using note A, line 2, and added a drawing option for learners who need it." /></label><small>{portfolio.revisionNote.trim().length}/40 minimum characters</small></div></div>
      <div className="workbench-next"><button type="button" className="button button-secondary" onClick={() => setStep(1)}>Back to the facts</button><button type="button" className="button button-primary" onClick={() => setStep(3)}>Next: review and save <Icon name="arrow-right" /></button></div>
    </section> : null}

    {step === 3 ? <section className="source-panel source-final-review workbench-current-panel" id="source-review" aria-labelledby="source-review-title"><div className="section-heading"><div><span className="eyebrow">Step 4 of 4</span><h2 id="source-review-title">Check it before using it in class.</h2></div></div><fieldset><legend>Teacher review checklist</legend>{sourceReviewChecks.map((check) => <label className="source-checkbox" key={check.id}><input type="checkbox" checked={portfolio.reviewChecks.includes(check.id)} onChange={(event) => edit({ reviewChecks: event.target.checked ? [...portfolio.reviewChecks, check.id] : portfolio.reviewChecks.filter((id) => id !== check.id) })} /><span>{check.label}</span></label>)}</fieldset><label htmlFor="source-reflection">What will you try in your next lesson?<textarea id="source-reflection" maxLength={1500} rows={5} value={portfolio.reflection} onChange={(event) => edit({ reflection: event.target.value })} placeholder="What did you learn across the course? What did you correct or improve? What will you try next, and what still needs checking?" /></label><small>{portfolio.reflection.trim().length}/60 minimum characters</small>
      <div className="source-completion"><div><strong>{ready ? "Your course practice is complete." : "Your work is saved. Finish these steps to complete the course practice."}</strong>{!ready ? <ul>{!(portfolio.objective.trim().length >= 20 && portfolio.audience.trim().length >= 3 && portfolio.sourceLabel.trim().length >= 3 && portfolio.sourcePermission && portfolio.sourceSafe) ? <li>Add the teaching goal, class, name for your notes and permission checks.</li> : null}{audits < 3 ? <li>Check all three statements, select the matching lines and explain each choice.</li> : null}{portfolio.draft.trim().length < 100 || portfolio.revisionNote.trim().length < 40 ? <li>Save a draft and explain your revision.</li> : null}{sourceReviewChecks.some((check) => !portfolio.reviewChecks.includes(check.id)) ? <li>Complete the six checks above. Editing your draft clears earlier checks.</li> : null}{portfolio.reflection.trim().length < 60 ? <li>Describe what you will try in your next lesson.</li> : null}</ul> : <p>Check the resource again when you use it with a different class.</p>}</div><button type="button" className="button button-primary" onClick={download}>Download {ready ? "reviewed practice" : "work so far"}<Icon name="document" /></button></div>
      {message ? <p className="source-message" role="status">{message}</p> : null}<div className="source-return-links"><Link className="text-link" href="/learn/module-4/lessons/source-to-classroom-capstone">Return to the final activity <Icon name="arrow-right" /></Link><Link className="text-link" href="/learn/module-4/quiz">Try the knowledge check <Icon name="arrow-right" /></Link></div>
      <div className="workbench-next"><button type="button" className="button button-secondary" onClick={() => setStep(2)}>Back to your resource</button><Link className="text-link" href="/learn/module-4/transform">Use your own teaching notes <Icon name="arrow-right" /></Link></div>
    </section> : null}
  </AppShell></HydrationGate>;
}
