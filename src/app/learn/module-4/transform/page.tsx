"use client";

import Link from "next/link";
import { downloadFile } from "@/lib/download";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useScopedDraft } from "@/components/ui/use-scoped-draft";
import { useDemo } from "@/features/demo/demo-provider";
import { buildSourceScaffold, exportTransformation, sourcePassages, transformationFormats, transformationReview, validateTransformation, type TransformationInput } from "@/features/learning/transformer";

const empty = { title: "", source: "", audience: "", objective: "", format: "summary" as TransformationInput["format"], permission: "", safe: false, draft: "", checks: [] as string[], id: "", createdAt: 0 };
type Workspace = typeof empty;
function validateDraft(value: unknown): Workspace {
  if (!value || typeof value !== "object") return empty;
  const raw = value as Partial<Workspace>;
  if (typeof raw.createdAt !== "number" || Date.now() - raw.createdAt > 30 * 86400000) return empty;
  const text = (key: "title" | "source" | "audience" | "objective" | "permission" | "draft" | "id", limit: number) => typeof raw[key] === "string" ? raw[key].slice(0, limit) : "";
  return { title: text("title", 120), source: text("source", 20000), audience: text("audience", 160), objective: text("objective", 500), permission: text("permission", 30), draft: text("draft", 24000), id: text("id", 50), createdAt: raw.createdAt, safe: raw.safe === true, format: transformationFormats.some((format) => format.id === raw.format) ? raw.format! : "summary", checks: Array.isArray(raw.checks) ? [...new Set(raw.checks.filter((check): check is string => typeof check === "string" && transformationReview.includes(check)))] : [] };
}
type SavedResource = { id: string; title: string; source_text: string; audience?: string; objective?: string; output_format: TransformationInput["format"]; draft: string; permission: string; reviewed: boolean; created_at: string; expires_at: string };

export default function TransformPage() {
  const { storageScope } = useDemo();
  return <TransformWorkspace key={storageScope} />;
}
function TransformWorkspace() {
  const { isPresentationDemo, participantId } = useDemo();
  const [work, setWork, storage] = useScopedDraft("teacher-resource", empty, validateDraft);
  const [operation, setOperation] = useState<"generate" | "save" | "delete" | "load" | null>(null);
  const [useAi, setUseAi] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resources, setResources] = useState<SavedResource[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState("");
  const controller = useRef<AbortController | null>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const busy = operation !== null;
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  function edit(values: Partial<Workspace>) { setWork({ ...work, ...values, checks: [], createdAt: work.createdAt || Date.now() }); setError(""); setNotice(""); }
  async function readResources(signal?: AbortSignal) {
    const response = await fetch("/api/resources", { cache: "no-store", signal });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Saved resources could not be loaded. Try again.");
    setResources(payload.resources); setLoaded(true);
  }
  async function loadResources() {
    setOperation("load"); setError("");
    const request = new AbortController(); controller.current = request;
    try { await readResources(request.signal); }
    catch (cause) { if (!(cause instanceof Error && cause.name === "AbortError")) setError(cause instanceof Error ? cause.message : "Saved resources could not be loaded."); }
    finally { setOperation(null); controller.current = null; }
  }
  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setOperation("generate");
    const request = new AbortController(); controller.current = request;
    const timeout = window.setTimeout(() => request.abort(), 30000);
    try {
      const input = validateTransformation(work);
      if (!useAi) {
        setWork({ ...work, draft: buildSourceScaffold(input).draft, checks: [] });
        setMode("Source-based scaffold"); setNotice("Your selected source passages are organised into a teaching scaffold. Edit it for your learners, then check every claim.");
      } else {
        const response = await fetch("/api/transform", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...input, useAi: true }), signal: request.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "AI drafting is unavailable. Try the source scaffold or retry.");
        setWork({ ...work, draft: payload.draft, checks: [] });
        setMode(payload.source === "gemini" ? "AI-assisted draft" : "Source-based scaffold");
        setNotice(payload.notice ?? "Draft ready. Check each claim against the numbered passages.");
      }
      window.setTimeout(() => draftRef.current?.focus(), 0);
    } catch (cause) { setError(cause instanceof Error ? cause.name === "AbortError" ? "Generation stopped. Your source and previous draft are preserved. Try again or turn off connected AI to create a source scaffold." : cause.message : "Drafting failed. Your input is preserved; try again."); }
    finally { window.clearTimeout(timeout); setOperation(null); controller.current = null; }
  }
  async function save() {
    setError(""); setOperation("save");
    const request = new AbortController(); controller.current = request;
    try {
      const input = validateTransformation(work);
      const response = await fetch("/api/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...input, id: work.id || undefined, draft: work.draft, reviewed: transformationReview.every((check) => work.checks.includes(check)) }), signal: request.signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "The private copy was not saved. Please try again.");
      setWork({ ...work, id: payload.resource.id });
      setNotice(`Saved privately until ${new Date(payload.resource.expires_at).toLocaleDateString("en-GB")}. Download a copy to keep it longer.`);
      await readResources(request.signal);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save. Your local draft is still here."); }
    finally { setOperation(null); controller.current = null; }
  }
  async function remove(id: string) {
    setError(""); setOperation("delete");
    const request = new AbortController(); controller.current = request;
    try {
      const response = await fetch("/api/resources", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }), signal: request.signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "The resource was not deleted. Try again.");
      if (work.id === id) { setWork(empty); setMode(""); }
      setResources((current) => current.filter((item) => item.id !== id));
      setNotice("The private resource has been deleted. Any open local copy of that resource was also cleared.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not delete. The resource has been kept."); }
    finally { setOperation(null); controller.current = null; }
  }
  function openResource(resource: SavedResource) {
    if (work.source && work.id !== resource.id) { setError("Download or clear your current workspace before opening another resource. Your current source is still here."); return; }
    const createdAt = Date.parse(resource.created_at) || Date.parse(resource.expires_at) - 30 * 86400000;
    setWork({ ...empty, id: resource.id, title: resource.title, source: resource.source_text, audience: resource.audience ?? "", objective: resource.objective ?? "", format: resource.output_format, draft: resource.draft, permission: resource.permission, safe: true, createdAt });
    setMode("Saved private resource"); setError("");
    setNotice(resource.audience && resource.objective ? "Source, teaching brief and draft restored. Check the material again for this classroom use." : "Source and draft restored. Add the audience and learning objective before saving or exporting this older resource.");
    window.setTimeout(() => draftRef.current?.focus(), 0);
  }
  function download() {
    setError("");
    try {
      const input = validateTransformation(work);
      downloadFile(new Blob([exportTransformation(input, work.draft, work.checks)], { type: "text/markdown;charset=utf-8" }), "PromptShala-teacher-resource.md");
      setNotice("Markdown download requested with the resource, original passages and review status.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Check your source and teaching brief before exporting."); }
  }
  async function importFile(file?: File) {
    if (!file) return;
    if (file.size > 60000 || !/\.txt$/i.test(file.name)) { setError("Choose a .txt file smaller than 60 KB."); return; }
    try {
      const text = await file.text();
      if (text.length > 20000) { setError("Keep your source under 20,000 characters."); return; }
      edit({ source: text, title: work.title || file.name.replace(/\.txt$/i, "") });
    } catch { setError("This file could not be read. Try another plain text file or paste the text directly."); }
  }
  return <HydrationGate><AppShell active="learn"><div className="platform-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/learn/module-4">Module 4</Link><Icon name="chevron-right" /><span>Teacher resource workspace</span></nav>
    <header className="page-heading"><div><span className="eyebrow">From your material to your classroom</span><h1>Start with a source you trust.</h1><p>Bring your own notes, choose a format, then trace and review the draft. Your judgment is the final step.</p></div></header>
    <p className="platform-message">Use teacher-owned or permitted material without identifiable learner information. {storage.persisted ? "This device keeps the source and draft for up to 30 days." : "Device storage is unavailable; download your work before leaving."} Only choosing connected AI and creating a draft sends your source to the AI service.</p>
    {error ? <div className="platform-message error" role="alert" ref={errorRef} tabIndex={-1}><strong>Let’s check one thing.</strong><p>{error}</p></div> : null}{notice ? <p className="platform-message" role="status">{notice}</p> : null}
    <nav className="lesson-section-jump" aria-label="Resource workspace"><a href="#resource-brief">1. Source and purpose</a><a href="#resource-draft">2. Edit and review</a><a href="#saved-resources">3. Saved resources</a></nav>
    <div className="platform-columns"><section className="platform-panel" id="resource-brief"><span className="eyebrow">01 · Source and purpose</span><h2>Your teaching brief</h2>
      <form onSubmit={generate}><fieldset className="platform-form" disabled={busy}><legend className="visually-hidden">Source details and generation settings</legend>
        <label>Source title<input value={work.title} minLength={3} maxLength={120} required onChange={(event) => edit({ title: event.target.value })} placeholder="My notes on the water cycle" /></label>
        <label>Who is this for?<input value={work.audience} minLength={3} maxLength={160} required onChange={(event) => edit({ audience: event.target.value })} placeholder="Class 6 · mixed reading confidence" /></label>
        <label>What should learners be able to do?<textarea rows={3} minLength={10} maxLength={500} required value={work.objective} onChange={(event) => edit({ objective: event.target.value })} placeholder="Explain evaporation using evidence from an everyday observation." /></label>
        <label>Paste your source text<textarea rows={12} minLength={80} maxLength={20000} aria-describedby="source-length" required value={work.source} onChange={(event) => edit({ source: event.target.value })} /></label><small id="source-length">{work.source.length.toLocaleString()} / 20,000 characters · at least 80 needed. Separate passages with a blank line.</small>
        <label>Or open a plain text file<input type="file" accept=".txt,text/plain" onChange={(event) => void importFile(event.target.files?.[0])} /></label>
        <label>Permission to use this material<select required value={work.permission} onChange={(event) => edit({ permission: event.target.value })}><option value="">Choose permission</option><option value="own">I created and own it</option><option value="licensed">I have permission or a suitable licence</option><option value="public-domain">It is in the public domain</option></select></label>
        <label className="platform-check"><input type="checkbox" required checked={work.safe} onChange={(event) => edit({ safe: event.target.checked })} />I checked that this contains no identifiable learner information.</label>
        <label>Make a<select value={work.format} onChange={(event) => edit({ format: event.target.value as TransformationInput["format"] })}>{transformationFormats.map((format) => <option value={format.id} key={format.id}>{format.label}</option>)}</select></label>
        <label className="platform-check"><input type="checkbox" checked={useAi} disabled={isPresentationDemo || !participantId} onChange={(event) => setUseAi(event.target.checked)} />Use connected AI to draft from this source</label><small>{isPresentationDemo || !participantId ? "Guided practice uses a local source scaffold. Sign in to an account with approved AI access for assisted drafting." : "Optional: sends this source and teaching brief to the configured Gemini service. Without it, a local source scaffold is prepared."}</small>
        <div className="platform-actions"><button className="button button-primary" type="submit" aria-busy={operation === "generate"}>{operation === "generate" ? "Preparing your draft…" : useAi ? "Create AI-assisted draft" : "Create source scaffold"}</button></div>
      </fieldset></form>{operation === "generate" && useAi ? <button type="button" className="text-link" onClick={() => controller.current?.abort()}>Cancel generation</button> : null}
    </section>
    <section className="platform-panel" id="resource-draft"><span className="eyebrow">02 · Edit, trace, review</span><h2>Your classroom resource</h2>{work.draft ? <>
      <p>{mode || "Saved draft"} · Edits reset your review checks.</p><label className="platform-form">Editable draft<textarea ref={draftRef} rows={22} maxLength={24000} disabled={busy} value={work.draft} onChange={(event) => edit({ draft: event.target.value })} /></label>
      <details className="source-reference"><summary>Compare with the original passages</summary>{sourcePassages(work.source).map((passage) => <p key={passage.id}><strong>[{passage.id}]</strong> {passage.text}</p>)}</details>
      <fieldset className="platform-review" disabled={busy}><legend>Before using it with learners</legend>{transformationReview.map((check) => <label className="platform-check" key={check}><input type="checkbox" checked={work.checks.includes(check)} onChange={(event) => setWork({ ...work, checks: event.target.checked ? [...work.checks, check] : work.checks.filter((item) => item !== check) })} />{check}</label>)}</fieldset>
      <p>{work.checks.length} of {transformationReview.length} checks recorded. Unfinished downloads include their review status.</p><div className="platform-actions"><button className="button button-primary" disabled={busy} onClick={download}>Download resource & sources</button><button className="button button-secondary" disabled={busy || !participantId || isPresentationDemo} onClick={save}>{operation === "save" ? "Saving private copy…" : "Save privately for 30 days"}</button></div>{!participantId || isPresentationDemo ? <p className="platform-fineprint">A signed-in account is required for private cloud storage. Local downloads remain available.</p> : null}
      <details className="danger-zone"><summary>Clear this workspace</summary><p>This clears the local source, draft and review checks. Download anything you need first. Cloud copies are managed below.</p><button className="button button-secondary" disabled={busy} onClick={() => { setWork(empty); setMode(""); setError(""); setNotice("The source and draft on this device have been cleared."); }}>Clear local source and draft</button></details>
    </> : <div className="platform-empty"><Icon name="document" /><h3>Give the source a classroom purpose.</h3><p>Add a teaching brief and source text. Your editable draft will appear here with the original passages and review checklist.</p><Link className="text-link" href="/learn/module-4/studio">Practise with a fictional source first<Icon name="arrow-right" /></Link></div>}</section></div>
    <section className="platform-panel" id="saved-resources"><div className="section-heading"><div><span className="eyebrow">Only you can open these</span><h2>Saved resources</h2><p>Private account copies expire after 30 days. Delete them sooner whenever you are finished.</p></div><button className="button button-secondary" disabled={!participantId || isPresentationDemo || busy} onClick={loadResources}>{operation === "load" ? "Loading resources…" : loaded ? "Refresh saved resources" : "Load saved resources"}</button></div>{!participantId || isPresentationDemo ? <p>Sign in to use private cloud storage. Guided practice and local downloads remain available.</p> : loaded && !resources.length ? <p className="platform-empty">No private copies yet. Save a classroom draft above to keep it with your account for 30 days.</p> : !loaded ? <p className="platform-fineprint">Load your account copies when you want to resume earlier work.</p> : null}
    {resources.map((resource) => <article className="saved-resource-row" key={resource.id}><div><h3>{resource.title}</h3><p>Expires {new Date(resource.expires_at).toLocaleDateString("en-GB")} · {resource.reviewed ? "Reviewed when saved" : "Review incomplete"}</p></div><button className="button button-secondary" disabled={busy} onClick={() => openResource(resource)}>Open resource</button><details><summary>Delete</summary><p>Permanently remove this private account copy?</p><button disabled={busy} className="button button-secondary" onClick={() => remove(resource.id)}>{operation === "delete" ? "Deleting…" : "Delete this resource"}</button></details></article>)}</section>
  </div></AppShell></HydrationGate>;
}
