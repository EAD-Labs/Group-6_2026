"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { OnboardingShell } from "@/components/onboarding-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import type { TeachingLevel } from "@/features/demo/demo-state";

const teachingLevels: TeachingLevel[] = ["Classes 5–7", "Classes 8–10", "Both"];

export default function TeacherProfilePage() {
  const router = useRouter();
  const { saveProfile, state } = useDemo();
  const [displayName, setDisplayName] = useState(state.displayName);
  const [primarySubject, setPrimarySubject] = useState(state.primarySubject);
  const [teachingLevel, setTeachingLevel] = useState(state.teachingLevel);
  const [yearsTeaching, setYearsTeaching] = useState(state.yearsTeaching);
  const [institution, setInstitution] = useState(state.institution);

  function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveProfile({ displayName, institution, primarySubject, teachingLevel, yearsTeaching });
    router.push("/onboarding/goals");
  }

  return (
    <HydrationGate>
      <OnboardingShell currentStep={2}>
        <section className="onboarding-card" aria-labelledby="profile-title">
          <span className="eyebrow">Make examples relevant</span>
          <h1 id="profile-title">Tell us about your teaching</h1>
          <p className="lead">We use this context to tailor examples—not to evaluate you.</p>
          <form className="profile-form" onSubmit={submitProfile}>
            <div className="form-grid two-columns">
              <label>Your first name<input maxLength={40} onChange={(event) => setDisplayName(event.target.value)} required value={displayName} /></label>
              <label>Primary subject<select onChange={(event) => setPrimarySubject(event.target.value)} value={primarySubject}><option>Science</option><option>Mathematics</option><option>English</option><option>Social Science</option><option>Multiple subjects</option></select></label>
            </div>
            <fieldset>
              <legend>Teaching level</legend>
              <div className="segmented-options">
                {teachingLevels.map((level) => (
                  <label key={level}><input checked={teachingLevel === level} name="teaching-level" onChange={() => setTeachingLevel(level)} type="radio" /><span>{level}</span></label>
                ))}
              </div>
            </fieldset>
            <div className="form-grid two-columns">
              <label>Years of teaching<input inputMode="numeric" min="0" onChange={(event) => setYearsTeaching(event.target.value)} required type="number" value={yearsTeaching} /></label>
              <label>Institution <small>Optional</small><input onChange={(event) => setInstitution(event.target.value)} placeholder="Your school or organisation" value={institution} /></label>
            </div>
            <div className="privacy-inline"><Icon name="shield" /><span>We collect only the minimum profile information needed to personalise learning.</span></div>
            <div className="onboarding-actions"><button className="button button-secondary" onClick={() => router.push("/onboarding/safe-use")} type="button"><Icon name="arrow-left" />Back</button><button className="button button-primary" type="submit">Save and continue <Icon name="arrow-right" /></button></div>
          </form>
        </section>
      </OnboardingShell>
    </HydrationGate>
  );
}
