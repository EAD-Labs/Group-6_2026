"use client";

import Link from "next/link";
import { useDemo } from "@/features/demo/demo-provider";
import { Icon } from "./ui/icon";

export function SyncStatus({ detailed = false }: { detailed?: boolean }) {
  const { syncStatus, syncError, retrySync, syncConflicts, resolveSyncConflict } = useDemo();
  const labels = { conflict: "Choose which assistant edits to keep", checking: "Checking saved progress", saving: "Saving progress…", saved: "Progress synced", offline: "Saved here · waiting for internet", error: "Progress has not synced", demo: "Demo · saved on this device", unauthenticated: "Sign in to save progress" };
  const status = syncStatus ?? "checking";
  const needsAction = status === "error" || status === "unauthenticated" || status === "conflict";
  return <div className={`sync-status sync-${status}${detailed ? " sync-detailed" : ""}`} role="status"><Icon name={status === "saved" ? "check" : status === "offline" ? "wifi-off" : needsAction ? "info" : "cloud"} /><span>{labels[status]}{detailed && syncError ? <small>{syncError}</small> : null}</span>{detailed && status === "conflict" ? <div className="sync-conflicts">{(syncConflicts ?? []).map(conflict => <section key={conflict.id}><strong>{conflict.assistantName} · {conflict.field.replace(/([A-Z])/g, " $1")}</strong><p>Both copies changed this field. Saving is paused until you choose. Separate tests and instruction histories are retained.</p><dl><dt>This device</dt><dd>{String(conflict.localValue ?? "Empty / removed")}</dd><dt>Saved account copy</dt><dd>{String(conflict.remoteValue ?? "Empty / removed")}</dd></dl><div className="platform-actions"><button type="button" className="button button-secondary" onClick={() => resolveSyncConflict(conflict.id, "local")}>Keep this device’s edit</button><button type="button" className="button button-secondary" onClick={() => resolveSyncConflict(conflict.id, "remote")}>Keep saved account edit</button></div></section>)}</div> : null}{status === "error" ? <button type="button" className="text-link" onClick={retrySync}>Try again</button> : status === "unauthenticated" ? <Link className="text-link" href="/sign-in">Sign in</Link> : null}</div>;
}
