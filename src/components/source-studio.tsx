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
    setChecked([]);
  }
  async function copyPrompt() {
    try { await navigator.clipboard.writeText(prompt); setMessage("Notebook prompt copied. Add only approved sources in your external tool."); }
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

  return <HydrationGate><AppShell active="learn" contentClassName="learning-reading-scale">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/learn/module-4">Module 4</Link><Icon name="chevron-right" /><span>Source Studio</span></nav>
    <header className="source-studio-heading page-heading"><div><span className="eyebrow">The teacher’s evidence desk</span><h1>Source Studio</h1><p>Read closely. Challenge the claim. Leave with a draft you can explain.</p></div><span className={`status-pill ${ready ? "passed" : "available"}`}>{ready ? "Evidence recorded" : `${audits}/3 claims checked`}</span></header>
    <nav className="source-steps" aria-label="Studio sections"><a href="#source-brief"><span>01</span>Choose & brief</a><a href="#source-audit"><span>02</span>Inspect evidence</a><a href="#source-draft"><span>03</span>Make & repair</a><a href="#source-review"><span>04</span>Review & export</a></nav>
    <div className="source-studio-intro"><Icon name="info" /><p>This is guided practice with original fictional packs and prepared drafts. No live AI generation or source upload occurs here. Use an approved external notebook optionally; never add learner records.</p></div>

    <section className="source-panel source-brief" id="source-brief" aria-labelledby="source-brief-title">
      <div className="section-heading"><div><span className="eyebrow">01 · Choose & brief</span><h2 id="source-brief-title">A small pack. A real teaching decision.</h2></div><span className="section-meta">Three practice cases</span></div>
      <div className="source-case-picker"><label htmlFor="source-case"><span id="source-case-label">Practice pack</span><select aria-labelledby="source-case-label" id="source-case" value={nextCase} onChange={(event) => setNextCase(event.target.value)}>{sourceCases.map((item) => <option key={item.id} value={item.id}>{item.subject} · {item.title}</option>)}</select></label><button type="button" className="button button-secondary button-small" disabled={nextCase === current.id} onClick={startCase}>Start selected case</button></div>
      <p className="source-helper">Starting a different case replaces this practice portfolio. Export your work first if you want to keep a copy.</p>
      <div className="source-case-caption"><span>{current.audience} / {current.subject}</span><h3>{current.title}</h3><p>{current.hook}</p></div>
      <div className="source-brief-fields"><label>Learning objective<input maxLength={500} placeholder={current.objective} value={portfolio.objective} onChange={(event) => edit({ objective: event.target.value }, true)} /></label><label>Learner group<input maxLength={120} placeholder={current.audience} value={portfolio.audience} onChange={(event) => edit({ audience: event.target.value }, true)} /></label><label>Source register label<input maxLength={160} placeholder="For example: Pack A+B — original water changes practice" value={portfolio.sourceLabel} onChange={(event) => edit({ sourceLabel: event.target.value }, true)} /></label><label htmlFor="source-permission"><span id="source-permission-label">Permission basis</span><select id="source-permission" aria-labelledby="source-permission-label" value={portfolio.sourcePermission} onChange={(event) => edit({ sourcePermission: event.target.value as SourcePortfolio["sourcePermission"] }, true)}><option value="">Choose a basis after inspection</option><option value="original">Original material: I own it or have permission from its creator</option><option value="licensed">A checked licence permits this use</option><option value="permission">Explicit permission for this activity</option></select></label></div>
      <label className="source-checkbox"><input type="checkbox" checked={portfolio.sourceSafe} onChange={(event) => edit({ sourceSafe: event.target.checked }, true)} /><span>I inspected this pack: it contains no identifiable learner or confidential information.</span></label>
    </section>

    <section className="source-panel" id="source-audit" aria-labelledby="source-audit-title">
      <div className="section-heading"><div><span className="eyebrow">02 · Inspect evidence</span><h2 id="source-audit-title">The Citation Detective</h2></div><span className="section-meta">{audits}/3 reasoned verdicts</span></div>
      <p>These practice claims include deliberate errors. Read the passages, choose a verdict, mark the relevant lines and explain your reasoning. Feedback appears when you check a claim.</p>
      <div className="source-audit-layout">
        <aside className="source-pack" aria-label="Source passages">{current.sources.map((source) => <article key={source.id}><div><span className="source-label">{source.id}</span><h3>{source.title}</h3></div><p className="source-credit">{source.credit}</p><ol>{source.lines.map((line, index) => <li key={line} id={`passage-${source.id}-${index + 1}`}><span>{source.id}:{index + 1}</span><p>{line}</p></li>)}</ol></article>)}</aside>
        <div className="source-claims">{current.claims.map((claim, index) => {
          const audit = portfolio.audits[claim.id] ?? { verdict: "", references: [], note: "" };
          const correct = auditIsCorrect(current.id, claim.id, audit);
          return <article className="source-claim" key={claim.id} aria-labelledby={`claim-${claim.id}`}><span className="eyebrow">Practice claim {index + 1}</span><h3 id={`claim-${claim.id}`}>{claim.text}</h3>
            <label htmlFor={`verdict-${claim.id}`}><span id={`verdict-label-${claim.id}`}>Your verdict</span><select aria-labelledby={`verdict-label-${claim.id}`} id={`verdict-${claim.id}`} value={audit.verdict} onChange={(event) => editAudit(claim.id, { verdict: event.target.value as ClaimAudit["verdict"] })}><option value="">Choose after reading</option>{verdicts.map((verdict) => <option key={verdict} value={verdict}>{verdict.charAt(0).toUpperCase() + verdict.slice(1)}</option>)}</select></label>
            <fieldset className="source-reference-list"><legend>Passages for claim {index + 1}</legend>{references.map((ref) => <label key={ref.id} title={ref.line}><input type="checkbox" checked={audit.references.includes(ref.id)} onChange={(event) => editAudit(claim.id, { references: event.target.checked ? [...audit.references, ref.id] : audit.references.filter((id) => id !== ref.id) })} /><span>{ref.id}</span></label>)}</fieldset>
            <label htmlFor={`reason-${claim.id}`}>Why this verdict?<textarea id={`reason-${claim.id}`} maxLength={1000} rows={3} value={audit.note} placeholder="Compare the exact claim with the passage. What should the teacher retain, correct or leave uncertain?" onChange={(event) => editAudit(claim.id, { note: event.target.value })} /></label>
            <button type="button" className="button button-secondary button-small" onClick={() => setChecked((before) => [...new Set([...before, claim.id])])}>Check claim {index + 1}</button>
            {checked.includes(claim.id) ? <div role="status" className={`source-audit-feedback ${correct ? "correct" : "needs-review"}`}><strong>{correct ? "Your verdict and evidence match." : "Revisit the verdict or evidence."}</strong><p>{claim.explanation}</p><small>Expected verdict: {claim.verdict}. Relevant passages: {claim.references.join(", ")}. Explain the comparison in at least 20 characters.</small></div> : null}
          </article>;
        })}</div>
      </div>
    </section>

    <section className="source-panel" id="source-draft" aria-labelledby="source-draft-title">
      <div className="section-heading"><div><span className="eyebrow">03 · Make & repair</span><h2 id="source-draft-title">Give the evidence a classroom purpose.</h2></div></div>
      <div className="source-make-layout"><div className="source-prompt"><label htmlFor="artifact-type"><span id="artifact-type-label">Artifact format</span><select aria-labelledby="artifact-type-label" id="artifact-type" value={portfolio.artifactType} onChange={(event) => { const format = event.target.value as SourcePortfolio["artifactType"]; if (portfolio.draft.trim() || portfolio.revisionNote.trim()) setPendingFormat(format); else edit({ artifactType: format }, true); }}>{artifactTypes.map((type) => <option key={type} value={type}>{type.replaceAll("-", " ")}</option>)}</select></label>{pendingFormat ? <div className="feedback-box supportive" role="group" aria-label="Change artifact format"><div><strong>Keep your current draft?</strong><p>Changing to {pendingFormat.replaceAll("-", " ")} clears the current draft, revision note and review checks. Export first to keep a copy, or keep writing this version.</p><div className="platform-actions"><button className="button button-secondary button-small" type="button" onClick={() => setPendingFormat(null)}>Keep current draft</button><button className="button button-secondary button-small" type="button" onClick={() => { edit({ artifactType: pendingFormat, draft: "", revisionNote: "" }, true); setPendingFormat(null); }}>Change format and clear draft</button><button className="text-link" type="button" onClick={download}>Export current draft</button></div></div></div> : null}<h3>A portable notebook request</h3><pre>{prompt}</pre><button className="button button-secondary button-small" type="button" onClick={copyPrompt}>Copy notebook prompt <Icon name="document" /></button><a className="text-link" href="https://notebook.google.com/" target="_blank" rel="noreferrer">Open Google’s notebook tool <Icon name="arrow-right" /></a><p className="source-helper">Optional external exercise. Only add school-approved, permitted sources. This workbench does not connect to your Google account.</p></div>
        <div className="source-draft-editor"><button type="button" className="button button-secondary button-small" onClick={() => edit({ draft: buildPracticeDraft(current.id, portfolio.artifactType), revisionNote: "" }, true)}>Load prepared {portfolio.artifactType.replaceAll("-", " ")} draft</button><p className="source-helper">Loading replaces the draft below. These are prepared examples, not live AI outputs. Edit the result for your objective and audience.</p><label htmlFor="source-artifact">Your classroom artifact<textarea id="source-artifact" maxLength={6000} rows={16} value={portfolio.draft} onChange={(event) => edit({ draft: event.target.value }, true)} placeholder="Load a practice example or write your own non-sensitive classroom draft with source references." /></label><small>{portfolio.draft.trim().length}/100 minimum characters</small><label htmlFor="source-revision">What did you change, and why?<textarea id="source-revision" maxLength={1500} rows={4} value={portfolio.revisionNote} onChange={(event) => edit({ revisionNote: event.target.value }, true)} placeholder="Describe a correction, an access improvement or a removed assumption. Explain how it preserves the source meaning." /></label><small>{portfolio.revisionNote.trim().length}/40 minimum characters</small></div></div>
    </section>

    <section className="source-panel source-final-review" id="source-review" aria-labelledby="source-review-title"><div className="section-heading"><div><span className="eyebrow">04 · Review & export</span><h2 id="source-review-title">Put your judgment in the handoff.</h2></div></div><fieldset><legend>Teacher review checklist</legend>{sourceReviewChecks.map((check) => <label className="source-checkbox" key={check.id}><input type="checkbox" checked={portfolio.reviewChecks.includes(check.id)} onChange={(event) => edit({ reviewChecks: event.target.checked ? [...portfolio.reviewChecks, check.id] : portfolio.reviewChecks.filter((id) => id !== check.id) })} /><span>{check.label}</span></label>)}</fieldset><label htmlFor="source-reflection">Course reflection and next classroom use<textarea id="source-reflection" maxLength={1500} rows={5} value={portfolio.reflection} onChange={(event) => edit({ reflection: event.target.value })} placeholder="Connect the four course habits. What did your judgment change? What limitation remains? What will you try and verify next?" /></label><small>{portfolio.reflection.trim().length}/60 minimum characters</small>
      <div className="source-completion"><div><strong>{ready ? "Your required portfolio evidence is recorded." : "Build a reviewable portfolio before marking the capstone complete."}</strong>{!ready ? <ul>{!(portfolio.objective.trim().length >= 20 && portfolio.audience.trim().length >= 3 && portfolio.sourceLabel.trim().length >= 3 && portfolio.sourcePermission && portfolio.sourceSafe) ? <li>Finish the objective, audience, source register and safety confirmation.</li> : null}{audits < 3 ? <li>Complete all three correct passage-linked audits with explanations.</li> : null}{portfolio.draft.trim().length < 100 || portfolio.revisionNote.trim().length < 40 ? <li>Save a draft and explain your revision.</li> : null}{sourceReviewChecks.some((check) => !portfolio.reviewChecks.includes(check.id)) ? <li>Inspect and complete all six teacher checks. Draft changes reset them.</li> : null}{portfolio.reflection.trim().length < 60 ? <li>Write the course reflection with a concrete next action.</li> : null}</ul> : <p>Your work still needs professional judgment when transferred to a real class.</p>}</div><button type="button" className="button button-primary" onClick={download}>Export {ready ? "reviewed portfolio" : "draft portfolio"}<Icon name="document" /></button></div>
      {message ? <p className="source-message" role="status">{message}</p> : null}<div className="source-return-links"><Link className="text-link" href="/learn/module-4/lessons/source-to-classroom-capstone">Return to capstone <Icon name="arrow-right" /></Link><Link className="text-link" href="/learn/module-4/quiz">Open knowledge check <Icon name="arrow-right" /></Link></div>
    </section>
  </AppShell></HydrationGate>;
}
