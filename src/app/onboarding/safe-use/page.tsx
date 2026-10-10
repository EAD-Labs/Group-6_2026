"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { OnboardingShell } from "@/components/onboarding-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";

const safetyPrinciples = [
  {
    description: "Use made-up examples. Leave out student names, marks, phone numbers and other personal details.",
    icon: "shield" as const,
    title: "Keep student details private",
  },
  {
    description: "AI can make mistakes. Check facts and answers against your textbook before using them in class.",
    icon: "info" as const,
    title: "Check what AI writes",
  },
  {
    description: "Use AI to get a first draft. Read it, make changes and decide what is right for your students.",
    icon: "user" as const,
    title: "You make the final decision",
  },
];

export default function SafeUsePage() {
  const { storageScope } = useDemo();
  return <SafeUseForm key={storageScope} />;
}
function SafeUseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetDemo, setSafeUseAccepted, state } = useDemo();
  const freshDemo = searchParams.get("fresh") === "1";
  const [accepted, setAccepted] = useState(
    freshDemo ? false : state.safeUseAccepted,
  );

  useEffect(() => {
    if (freshDemo) {
      resetDemo();
    }
  }, [freshDemo, resetDemo]);

  function continueOnboarding() {
    setSafeUseAccepted(accepted);
    router.push("/onboarding/profile");
  }

  return (
    <HydrationGate>
      <OnboardingShell currentStep={1}>
        <section className="onboarding-card" aria-labelledby="safe-use-title">
          <span className="eyebrow">A safe start</span>
          <h1 id="safe-use-title">A little help. You’re still the teacher.</h1>
          <p className="lead">AI can help you write lesson plans, worksheets and explanations. Keep these three simple habits in mind as you try it.</p>
          <div className="principle-list">
            {safetyPrinciples.map((principle, index) => (
              <article key={principle.title}>
                <span className={`principle-icon principle-${index + 1}`}><Icon name={principle.icon} /></span>
                <div><h2>{principle.title}</h2><p>{principle.description}</p></div>
              </article>
            ))}
          </div>
          <label className="consent-check">
            <input checked={accepted} onChange={(event) => setAccepted(event.target.checked)} type="checkbox" />
            <span><strong>I’ll keep student details private and check AI’s work.</strong><small>You can read these reminders again in your profile.</small></span>
          </label>
          <p className="draft-note">When you ask AI for help, the text you enter is sent to the AI service. Your saved work belongs to your account. <Link href="/privacy">How we use your information</Link>.</p>
          <div className="onboarding-actions align-end">
            <button className="button button-primary" disabled={!accepted} onClick={continueOnboarding} type="button">I understand, continue <Icon name="arrow-right" /></button>
          </div>
        </section>
      </OnboardingShell>
    </HydrationGate>
  );
}
