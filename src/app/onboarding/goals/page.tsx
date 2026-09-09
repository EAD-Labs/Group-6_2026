"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { OnboardingShell } from "@/components/onboarding-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import type { AiFamiliarity } from "@/features/demo/demo-state";

const familiarityOptions: { description: string; icon: string; label: AiFamiliarity }[] = [
  { description: "I’m ready to learn from the beginning.", icon: "○", label: "New to AI" },
  { description: "I have tried chat tools once or twice.", icon: "◐", label: "Tried it a few times" },
  { description: "I use AI occasionally for simple tasks.", icon: "●", label: "Use it sometimes" },
];

const goalOptions = [
  "Explain difficult concepts",
  "Create quizzes and assessments",
  "Plan lessons and resources",
  "Communicate with parents",
  "Create worksheets and slide outlines",
];

export default function GoalsPage() {
  const router = useRouter();
  const { saveGoals, state } = useDemo();
  const [aiFamiliarity, setAiFamiliarity] = useState(state.aiFamiliarity);
  const [goals, setGoals] = useState(state.goals);

  function toggleGoal(goal: string) {
    setGoals((currentGoals) =>
      currentGoals.includes(goal)
        ? currentGoals.filter((currentGoal) => currentGoal !== goal)
        : [...currentGoals, goal],
    );
  }

  function finishOnboarding() {
    saveGoals({ aiFamiliarity, goals });
    router.push("/dashboard");
  }

  return (
    <HydrationGate>
      <OnboardingShell currentStep={3}>
        <section className="onboarding-card wide" aria-labelledby="goals-title">
          <span className="eyebrow">Tailor your starting point</span>
          <h1 id="goals-title">What would make AI useful to you?</h1>
          <p className="lead">There is no wrong starting point. Your choices shape examples and recommendations.</p>
          <fieldset className="choice-section">
            <legend>How familiar are you with AI tools?</legend>
            <div className="familiarity-grid">
              {familiarityOptions.map((option) => (
                <label className="choice-card" key={option.label}>
                  <input checked={aiFamiliarity === option.label} name="familiarity" onChange={() => setAiFamiliarity(option.label)} type="radio" />
                  <span className="choice-card-content">
                    <span className="choice-symbol" aria-hidden="true">{option.icon}</span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="choice-section">
            <legend>What are your main goals? <small>Select all that apply</small></legend>
            <div className="goal-grid">
              {goalOptions.map((goal) => (
                <label className="goal-card" key={goal}>
                  <input checked={goals.includes(goal)} onChange={() => toggleGoal(goal)} type="checkbox" />
                  <span><Icon name={goals.includes(goal) ? "check" : "target"} /></span>
                  <strong>{goal}</strong>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="onboarding-actions"><button className="button button-secondary" onClick={() => router.push("/onboarding/profile")} type="button"><Icon name="arrow-left" />Back</button><button className="button button-primary" onClick={finishOnboarding} type="button">Open my dashboard <Icon name="arrow-right" /></button></div>
        </section>
      </OnboardingShell>
    </HydrationGate>
  );
}
