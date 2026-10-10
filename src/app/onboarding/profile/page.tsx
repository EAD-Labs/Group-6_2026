"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { OnboardingShell } from "@/components/onboarding-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import type { TeachingLevel } from "@/features/demo/demo-state";

const teachingLevels: TeachingLevel[] = ["Classes 5–7", "Classes 8–10", "Both"];
const subjectOptions = ["Science", "Mathematics", "English", "Social Science", "Multiple subjects", "Other"];

export default function TeacherProfilePage() {
  const { storageScope } = useDemo();
  return <TeacherProfileForm key={storageScope} />;
}
function TeacherProfileForm() {
  const router = useRouter();
  const { saveProfile, state } = useDemo();
  const [displayName, setDisplayName] = useState(state.displayName);
  const [primarySubject, setPrimarySubject] = useState(subjectOptions.includes(state.primarySubject) ? state.primarySubject : "");
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
          <span className="eyebrow">A little about you</span>
          <h1 id="profile-title">Let’s start with your classroom.</h1>
          <p className="lead">Tell us what you teach. You can change these details in your profile anytime.</p>
          <form className="profile-form" onSubmit={submitProfile}>
            <div className="form-grid two-columns">
              <label>Your first name<input autoComplete="given-name" maxLength={40} onChange={(event) => setDisplayName(event.target.value)} required value={displayName} /></label>
              <label>What do you teach?<select onChange={(event) => setPrimarySubject(event.target.value)} required value={primarySubject}><option disabled value="">Choose a subject</option>{subjectOptions.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
            </div>
            <fieldset>
              <legend>Which classes do you teach?</legend>
              <div className="segmented-options">
                {teachingLevels.map((level) => (
                  <label key={level}><input checked={teachingLevel === level} name="teaching-level" onChange={() => setTeachingLevel(level)} type="radio" /><span>{level}</span></label>
                ))}
              </div>
            </fieldset>
            <div className="form-grid two-columns">
              <label>How many years have you taught?<input inputMode="numeric" min="0" max="70" onChange={(event) => setYearsTeaching(event.target.value)} required type="number" value={yearsTeaching} /></label>
              <label>School or organisation <small>Optional</small><input maxLength={160} onChange={(event) => setInstitution(event.target.value)} placeholder="Your school or organisation" value={institution} /></label>
            </div>
            <div className="privacy-inline"><Icon name="shield" /><span>Your school name is optional. Please leave out student names and personal details.</span></div>
            <div className="onboarding-actions"><button className="button button-secondary" onClick={() => router.push("/onboarding/safe-use")} type="button"><Icon name="arrow-left" />Back</button><button className="button button-primary" type="submit">Save and continue <Icon name="arrow-right" /></button></div>
          </form>
        </section>
      </OnboardingShell>
    </HydrationGate>
  );
}
