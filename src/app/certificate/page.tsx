"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { downloadFile } from "@/lib/download";
import type { Route } from "next";
import { AppShell } from "@/components/app-shell";
import { getLearningPlan } from "@/components/learning-plan";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import type { CertificateRecord } from "@/features/platform/certificate-pdf";

export default function CertificatePage() {
  const { storageScope } = useDemo();
  return <CertificateWorkspace key={storageScope} />;
}
function CertificateWorkspace() {
  const { state, isPresentationDemo, syncStatus } = useDemo();
  const [record, setRecord] = useState<CertificateRecord | null>(null);
  const [eligible, setEligible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [retry, setRetry] = useState(0);
  const [pending, setPending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const missing = getLearningPlan(state).flatMap((module) => module.requirements.filter((item) => !item.complete).map((item) => ({ ...item, module: module.position })));
  useEffect(() => {
    if (isPresentationDemo || syncStatus !== "saved") return;
    const controller = new AbortController();
    fetch("/api/certificate", { cache: "no-store", signal: controller.signal }).then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Your certificate record could not be checked.");
      setRecord(payload.certificate); setEligible(payload.eligible); setChecked(true); setError("");
    }).catch((cause) => { if (cause.name !== "AbortError") { setError(cause.message); setChecked(true); } });
    return () => controller.abort();
  }, [isPresentationDemo, syncStatus, retry]);
  async function issue() {
    setPending(true); setError("");
    try {
      const response = await fetch("/api/certificate", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Your certificate could not be prepared. Try again.");
      setRecord(payload.certificate);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again."); }
    finally { setPending(false); }
  }
  async function downloadCertificate() {
    setDownloading(true); setError("");
    try {
      const response = await fetch("/api/certificate/download", { cache: "no-store" });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Your PDF could not be downloaded. Please try again.");
      }
      downloadFile(await response.blob(), "PromptShala-certificate.pdf");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Your PDF could not be downloaded. Please try again."); }
    finally { setDownloading(false); }
  }
  return <HydrationGate><AppShell active="progress"><div className="platform-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/progress">My progress</Link><Icon name="chevron-right" /><span>Completion certificate</span></nav>
    <header className="page-heading"><div><span className="eyebrow">Your learning record</span><h1>A record of the work you have done.</h1><p>Complete every module and its practical evidence to receive your PromptShala certificate.</p></div></header>
    {error ? <div className="platform-message error" role="alert"><p>{error}</p><button className="button button-secondary" disabled={pending} onClick={() => { setError(""); setChecked(false); setRetry((current) => current + 1); }}>Check again</button></div> : null}
    {!isPresentationDemo && syncStatus === "saved" && !checked ? <p className="platform-message" role="status">Checking your saved completion record…</p> : null}
    {record ? <section className="certificate-sheet"><span className="eyebrow">PromptShala · Practical AI literacy</span><h2>{record.revoked_at ? "Record revoked" : "Certificate of completion"}</h2><p>Awarded to</p><strong className="certificate-name">{record.participant_name}</strong><p>For completing the four learning modules, knowledge checks and required classroom practice evidence.</p><p>Issued {new Date(record.issued_at).toLocaleDateString("en-GB")}</p><small>Record {record.id}</small>{!record.revoked_at ? <div className="platform-actions"><button type="button" className="button button-primary" onClick={downloadCertificate} disabled={downloading} aria-busy={downloading}>{downloading ? "Preparing download…" : "Download certificate PDF"}<Icon name="document" /></button><Link className="button button-secondary" href={`/verify/${record.id}` as Route}>Verify this record</Link></div> : <p>Contact your programme facilitator about this record.</p>}<p className="platform-fineprint">This records professional learning. It is not an accreditation or a licence to use unchecked AI output.</p></section> : <section className="platform-panel"><h2>{missing.length ? "What remains" : "Your learning evidence is complete"}</h2>
      {isPresentationDemo ? <p className="platform-message">You are using guided practice on this device. Certificates require a signed-in account and a verified saved learning record.</p> : syncStatus !== "saved" ? <p className="platform-message">Your progress must finish syncing before the certificate service can confirm your record.</p> : checked && !eligible && !missing.length && !error ? <p className="platform-message">The server has not confirmed all completion requirements yet. Review your saved progress, then check again.</p> : null}
      {missing.length ? <ul className="platform-requirements">{missing.map((item, index) => <li key={index}><span>Module {item.module}</span><Link href={item.href as Route}>{item.label}</Link></li>)}</ul> : <p>Your certificate uses the name in your profile: <strong>{state.displayName}</strong>. Check it before requesting the record.</p>}
      <div className="platform-actions"><Link className="button button-secondary" href="/profile">Check my name</Link><button className="button button-primary" disabled={pending || !eligible || !checked || isPresentationDemo || syncStatus !== "saved"} onClick={issue} aria-busy={pending}>{pending ? "Preparing your certificate…" : "Request completion certificate"}</button></div>
    </section>}
    <Link className="text-link" href="/progress"><Icon name="arrow-left" />Back to my progress</Link>
  </div></AppShell></HydrationGate>;
}
