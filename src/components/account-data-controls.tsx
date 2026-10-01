"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/features/demo/demo-provider";

export function AccountDataControls() {
  const { participantId, isPresentationDemo } = useDemo();
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Your account could not be deleted. Please try again.");
      try { if (participantId) for (const key of Object.keys(localStorage)) if (key.startsWith("promptshala:") && key.includes(participantId)) localStorage.removeItem(key); } catch { /* Account deletion succeeded even if browser storage is unavailable. */ }
      window.dispatchEvent(new Event("promptshala:signout"));
      router.replace("/sign-in?deleted=1"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again."); setBusy(false); }
  }
  return <section className="platform-panel"><h2>Your account data</h2><p>Download your learning record, private resources and certificates. Unfinished browser drafts are separate; export them from their workspaces.</p>{participantId && !isPresentationDemo ? <><a className="button button-secondary" href="/api/account">Download my account data</a><details className="danger-zone"><summary>Delete my account and learning data</summary><p id="delete-account-warning">This permanently removes your account, saved progress, private resources and certificates. Download a copy first. This cannot be undone.</p><label className="platform-form">Type DELETE MY ACCOUNT<input value={confirmation} disabled={busy} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" aria-describedby="delete-account-warning" /></label>{error ? <p className="platform-message error" role="alert">{error}</p> : null}<button className="button button-secondary" disabled={busy || confirmation !== "DELETE MY ACCOUNT"} onClick={remove} aria-busy={busy}>{busy ? "Deleting…" : "Permanently delete my account"}</button></details></> : <p>Account export and deletion become available when you sign in. Clear guided-practice data using the reset control on this page.</p>}</section>;
}
