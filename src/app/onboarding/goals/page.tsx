"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { OnboardingShell } from "@/components/onboarding-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { AiExperienceFields, type AiExperienceAnswers } from "@/components/ai-experience-fields";
import { useDemo } from "@/features/demo/demo-provider";

const goalOptions = [
  { value: "Explain difficult concepts", label: "Explain a topic simply" },
  { value: "Create quizzes and assessments", label: "Make quizzes and worksheets" },
  { value: "Plan lessons and resources", label: "Find ideas for my lessons" },
  { value: "Communicate with parents", label: "Write messages to parents" },
  { value: "Create worksheets and slide outlines", label: "Prepare lesson notes and slides" },
];

export default function GoalsPage() {
  const { storageScope } = useDemo();
  return <GoalsForm key={storageScope} />;
}
function GoalsForm() {
  const router = useRouter();
  const { saveGoals, state, updateState } = useDemo();
  const [experience, setExperience] = useState<AiExperienceAnswers>({
    aiFamiliarity: state.aiFamiliarity,
    aiToolsUsed: state.aiToolsUsed,
    aiToolOther: state.aiToolOther,
    currentAiUse: state.currentAiUse,
    aiUseFrequency: state.aiUseFrequency,
  });
  const [goals, setGoals] = useState(state.goals);

  function toggleGoal(goal: string) {
    const nextGoals = goals.includes(goal) ? goals.filter((currentGoal) => currentGoal !== goal) : [...goals, goal];
    setGoals(nextGoals);
    updateState((current) => ({ ...current, goals: nextGoals }));
  }

  function updateExperience(changes: Partial<AiExperienceAnswers>) {
    setExperience((current) => ({ ...current, ...changes }));
    updateState((current) => ({ ...current, ...changes }));
  }

  function finishOnboarding() {
    saveGoals({ ...experience, goals });
    router.push("/dashboard");
  }

  return (
    <HydrationGate>
      <OnboardingShell currentStep={3}>
        <section className="onboarding-card wide" aria-labelledby="goals-title">
          <span className="eyebrow">Your starting point</span>
          <h1 id="goals-title">Let’s make this useful for you.</h1>
          <p className="lead">Tell us a little about your experience with AI, then choose what you’d like help with. There are no right or wrong answers.</p>
          <p className="onboarding-optional-note">These questions are optional. You can change your answers in your profile anytime.</p>
          <AiExperienceFields value={experience} onChange={updateExperience} />
          <fieldset className="choice-section onboarding-goals">
            <legend>What would you like AI to help you with? <small>Choose any that interest you</small></legend>
            <div className="goal-grid">
              {goalOptions.map((goal) => (
                <label className="goal-card" key={goal.value}>
                  <input checked={goals.includes(goal.value)} onChange={() => toggleGoal(goal.value)} type="checkbox" />
                  <span><Icon name={goals.includes(goal.value) ? "check" : "target"} /></span>
                  <strong>{goal.label}</strong>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="onboarding-actions"><button className="button button-secondary" onClick={() => router.push("/onboarding/profile")} type="button"><Icon name="arrow-left" />Back</button><button className="button button-primary" onClick={finishOnboarding} type="button">Start learning <Icon name="arrow-right" /></button></div>
        </section>
      </OnboardingShell>
    </HydrationGate>
  );
}
