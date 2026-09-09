"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import type { TeachingLevel } from "@/features/demo/demo-state";

export default function ProfilePage() {
  const router = useRouter();
  const { resetDemo, state, updateState } = useDemo();
  const [saved, setSaved] = useState(false);

  function updatePreference(key: "captionsEnabled" | "largerText" | "reducedMotion", value: boolean) {
    updateState((currentState) => ({ ...currentState, [key]: value }));
    setSaved(true);
  }

  function updateField(key: "displayName" | "primarySubject" | "institution" | "teachingLevel" | "yearsTeaching", value: string) {
    updateState((currentState) => ({ ...currentState, [key]: value }));
    setSaved(true);
  }

  function restartDemo() {
    resetDemo();
    router.push("/onboarding/safe-use");
  }

  return (
    <HydrationGate>
      <AppShell active="profile">
        <header className="page-heading profile-heading"><div><span className="eyebrow">Your learning preferences</span><h1>Profile and accessibility</h1><p>Keep examples relevant and choose how PromptShala supports you.</p></div>{saved ? <span className="saved-toast" role="status"><Icon name="check" />Changes saved</span> : null}</header>
        <div className="profile-layout">
          <section className="settings-card" aria-labelledby="teaching-profile-title"><div className="settings-heading"><span><Icon name="user" /></span><div><h2 id="teaching-profile-title">Teaching profile</h2><p>This information personalises examples only.</p></div></div><div className="form-grid two-columns"><label>First name<input onChange={(event) => updateField("displayName", event.target.value)} value={state.displayName} /></label><label>Primary subject<select onChange={(event) => updateField("primarySubject", event.target.value)} value={state.primarySubject}><option>Science</option><option>Mathematics</option><option>English</option><option>Social Science</option><option>Multiple subjects</option></select></label><label>Teaching level<select onChange={(event) => updateField("teachingLevel", event.target.value as TeachingLevel)} value={state.teachingLevel}><option>Classes 5–7</option><option>Classes 8–10</option><option>Both</option></select></label><label>Years of teaching<input min="0" onChange={(event) => updateField("yearsTeaching", event.target.value)} type="number" value={state.yearsTeaching} /></label><label className="full-column">Institution <small>Optional</small><input onChange={(event) => updateField("institution", event.target.value)} placeholder="Your school or organisation" value={state.institution} /></label></div></section>
          <section className="settings-card" aria-labelledby="accessibility-title"><div className="settings-heading"><span><Icon name="sparkles" /></span><div><h2 id="accessibility-title">Accessibility</h2><p>Preferences apply immediately on this device.</p></div></div><div className="toggle-list"><label><span><strong>Captions always on</strong><small>Show captions when a lesson supports them.</small></span><input checked={state.captionsEnabled} onChange={(event) => updatePreference("captionsEnabled", event.target.checked)} role="switch" type="checkbox" /></label><label><span><strong>Larger default text</strong><small>Increase the main interface text size.</small></span><input checked={state.largerText} onChange={(event) => updatePreference("largerText", event.target.checked)} role="switch" type="checkbox" /></label><label><span><strong>Reduce motion</strong><small>Limit non-essential movement and transitions.</small></span><input checked={state.reducedMotion} onChange={(event) => updatePreference("reducedMotion", event.target.checked)} role="switch" type="checkbox" /></label></div></section>
          <section className="settings-card privacy-settings" aria-labelledby="privacy-title"><div className="settings-heading"><span><Icon name="shield" /></span><div><h2 id="privacy-title">Privacy and AI evaluation</h2><p>Clear boundaries before any live AI activity.</p></div></div><ul><li><Icon name="check" />PromptShala does not need identifiable student information.</li><li><Icon name="check" />The restricted evaluator key stays on the server and never reaches the browser.</li><li><Icon name="check" />Raw prompt text is not stored; only scores, safety flags and a one-way fingerprint may be recorded.</li><li><Icon name="check" />The teacher reviews every AI-created classroom draft.</li></ul></section>
          <section className="settings-card presentation-controls" aria-labelledby="demo-title"><div className="settings-heading"><span><Icon name="refresh" /></span><div><h2 id="demo-title">Presentation controls</h2><p>Restart the complete client walkthrough from onboarding.</p></div></div><button className="button button-secondary" onClick={restartDemo} type="button"><Icon name="refresh" />Reset guided demo</button></section>
        </div>
      </AppShell>
    </HydrationGate>
  );
}
