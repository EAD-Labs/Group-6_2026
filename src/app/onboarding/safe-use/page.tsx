"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { OnboardingShell } from "@/components/onboarding-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";

const safetyPrinciples = [
  {
    description: "Use fictional or general examples—never names, marks, health information or contact details.",
    icon: "shield" as const,
    title: "Protect student privacy",
  },
  {
    description: "AI can sound certain while being wrong. Verify important claims with trusted curriculum sources.",
    icon: "info" as const,
    title: "Check facts and context",
  },
  {
    description: "You review, adapt and decide what reaches learners. AI remains a drafting assistant.",
    icon: "user" as const,
    title: "Keep the teacher in control",
  },
];

export default function SafeUsePage() {
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
          <span className="eyebrow">Start safely</span>
          <h1 id="safe-use-title">Welcome to PromptShala</h1>
          <p className="lead">Before we practise, agree on three simple habits for responsible classroom use.</p>
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
            <span><strong>I understand and will use only safe, non-identifying classroom examples.</strong><small>You can review these principles anytime from your profile.</small></span>
          </label>
          <div className="onboarding-actions align-end">
            <button className="button button-primary" disabled={!accepted} onClick={continueOnboarding} type="button">I understand, continue <Icon name="arrow-right" /></button>
          </div>
        </section>
      </OnboardingShell>
    </HydrationGate>
  );
}
