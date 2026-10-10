"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AccountDataControls } from "@/components/account-data-controls";
import { SyncStatus } from "@/components/sync-status";

import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { AiExperienceFields, type AiExperienceAnswers } from "@/components/ai-experience-fields";
import { useDemo } from "@/features/demo/demo-provider";
import type { TeachingLevel } from "@/features/demo/demo-state";

function AiExperienceProfileEditor({ onUpdate }: { onUpdate: () => void }) {
  const { state, updateState } = useDemo();
  const [answers, setAnswers] = useState<AiExperienceAnswers>({
    aiFamiliarity: state.aiFamiliarity,
    aiToolsUsed: state.aiToolsUsed,
    aiToolOther: state.aiToolOther,
    currentAiUse: state.currentAiUse,
    aiUseFrequency: state.aiUseFrequency,
  });

  return <AiExperienceFields value={answers} onChange={(changes) => {
    // Keep the text being edited stable while an account save trims whitespace.
    setAnswers((currentAnswers) => ({ ...currentAnswers, ...changes }));
    updateState((currentState) => ({ ...currentState, ...changes }));
    onUpdate();
  }} />;
}

export default function ProfilePage() {
  const router = useRouter();
  const { resetDemo, state, updateState, isPresentationDemo, storageScope } = useDemo();
  const [resetRequested, setResetRequested] = useState(false);
  const [draftsCleared, setDraftsCleared] = useState(false);
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
        <header className="page-heading profile-heading"><div><span className="eyebrow">Make yourself at home</span><h1>Your profile and preferences</h1><p>Update what you teach, your AI experience and how you like to learn.</p></div>{saved ? <span className="saved-toast" role="status"><Icon name="check" />Preferences updated</span> : null}</header>
        <div className="profile-layout">
          <section className="settings-card ai-experience-settings" aria-labelledby="ai-experience-title">
            <div className="settings-heading"><span><Icon name="sparkles" /></span><div><h2 id="ai-experience-title">Your experience with AI</h2><p>These optional answers help us understand where you’re starting. Changes save automatically.</p></div></div>
            <AiExperienceProfileEditor key={storageScope} onUpdate={() => setSaved(true)} />
          </section>
          <section className="settings-card" aria-labelledby="teaching-profile-title"><div className="settings-heading"><span><Icon name="user" /></span><div><h2 id="teaching-profile-title">Teaching profile</h2><p>Your teaching context is part of your own course profile.</p></div></div><div className="form-grid two-columns"><label>First name<input maxLength={40} onChange={(event) => updateField("displayName", event.target.value)} value={state.displayName} /></label><label>Primary subject<select onChange={(event) => updateField("primarySubject", event.target.value)} value={state.primarySubject}><option>Science</option><option>Mathematics</option><option>English</option><option>Social Science</option><option>Multiple subjects</option><option>Other</option><option value="General">Not specified yet</option></select></label><label>Teaching level<select onChange={(event) => updateField("teachingLevel", event.target.value as TeachingLevel)} value={state.teachingLevel}><option>Classes 5–7</option><option>Classes 8–10</option><option>Both</option></select></label><label>Years of teaching<input min="0" max="70" onChange={(event) => updateField("yearsTeaching", event.target.value)} type="number" value={state.yearsTeaching} /></label><label className="full-column">Institution <small>Optional</small><input maxLength={160} onChange={(event) => updateField("institution", event.target.value)} placeholder="Your school or organisation" value={state.institution} /></label></div></section>
          <section className="settings-card" aria-labelledby="accessibility-title"><div className="settings-heading"><span><Icon name="sparkles" /></span><div><h2 id="accessibility-title">Accessibility</h2><p>Reading preferences apply immediately.</p></div></div><div className="toggle-list"><label><span><strong>Captions always on</strong><small>Request captions in embedded videos when the creator provides them.</small></span><input checked={state.captionsEnabled} onChange={(event) => updatePreference("captionsEnabled", event.target.checked)} role="switch" type="checkbox" /></label><label><span><strong>Larger default text</strong><small>Increase the main interface text size.</small></span><input checked={state.largerText} onChange={(event) => updatePreference("largerText", event.target.checked)} role="switch" type="checkbox" /></label><label><span><strong>Reduce motion</strong><small>Limit non-essential movement and transitions.</small></span><input checked={state.reducedMotion} onChange={(event) => updatePreference("reducedMotion", event.target.checked)} role="switch" type="checkbox" /></label></div></section>
          <section className="settings-card privacy-settings" aria-labelledby="privacy-title"><div className="settings-heading"><span><Icon name="shield" /></span><div><h2 id="privacy-title">Privacy and AI practice</h2><p>Know what is saved when you ask AI for help.</p></div></div><ul><li><Icon name="check" />Keep student names and personal details out of your AI tasks.</li><li><Icon name="check" />The course’s Gemini key stays on the server. An optional personal Gemini key is kept only for your current browser session.</li><li><Icon name="check" />When you run AI practice, your task, prompt and feedback are saved privately to your account. They are included when you export or delete your account data.</li><li><Icon name="check" />The teacher reviews every AI-created classroom draft.</li></ul><p>{state.safeUseAccepted ? "Your safe-use reminders are accepted." : "Read and accept the safe-use reminders before you try AI practice."}</p><div className="profile-privacy-links"><Link className="text-link" href="/onboarding/safe-use">Read the safe-use reminders</Link><Link className="text-link" href="/settings/api-key">Gemini connection <Icon name="arrow-right" /></Link></div></section>
          <section className="settings-card"><div className="settings-heading"><span><Icon name="document" /></span><div><h2>Practice drafts on this device</h2><p>Unfinished drafts and quizzes stay on this device. AI practice that you run is also saved to your account.</p></div></div><button className="button button-secondary" type="button" onClick={() => { if (storageScope) { const prefix = `promptshala:draft:v1:${storageScope}:`; Object.keys(localStorage).filter((key) => key.startsWith(prefix)).forEach((key) => localStorage.removeItem(key)); window.dispatchEvent(new Event("promptshala-draft-change")); setDraftsCleared(true); } }}>Clear unfinished drafts</button>{draftsCleared ? <p role="status">Practice drafts cleared for this account on this device. Completed learning records are unchanged.</p> : null}<p><Link className="text-link" href="/privacy">Read the privacy notice</Link></p><SyncStatus detailed /></section>
          <AccountDataControls />
          {isPresentationDemo ? <section className="settings-card presentation-controls" aria-labelledby="demo-title"><div className="settings-heading"><span><Icon name="refresh" /></span><div><h2 id="demo-title">Presentation controls</h2><p>Clear this device’s demo progress and begin the walkthrough again.</p></div></div>{resetRequested ? <div className="reset-confirmation"><p>Reset the demo lessons, quizzes and practice evidence on this device?</p><button className="button button-secondary" onClick={() => setResetRequested(false)} type="button">Keep progress</button><button className="button button-primary" onClick={restartDemo} type="button">Reset demo progress</button></div> : <button className="button button-secondary" onClick={() => setResetRequested(true)} type="button"><Icon name="refresh" />Reset guided demo</button>}</section> : null}
        </div>
      </AppShell>
    </HydrationGate>
  );
}
