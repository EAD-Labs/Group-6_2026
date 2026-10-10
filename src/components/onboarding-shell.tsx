import type { ReactNode } from "react";

import { Brand } from "./ui/brand";
import { Icon } from "./ui/icon";
import { SyncStatus } from "./sync-status";

const steps = ["A safe start", "Your classroom", "Your AI experience"];

export function OnboardingShell({
  children,
  currentStep,
}: {
  children: ReactNode;
  currentStep: 1 | 2 | 3;
}) {
  return (
    <div className="onboarding-page">
      <header className="onboarding-header">
        <Brand compact />
        <span>3 simple steps · About 3 minutes</span>
      </header>
      <div className="onboarding-layout">
        <aside className="onboarding-rail" aria-label="Onboarding progress">
          <p className="overline">Welcome to PromptShala</p>
          <p className="onboarding-step-count">Step {currentStep} of 3</p>
          <ol>
            {steps.map((step, index) => {
              const number = index + 1;
              const complete = number < currentStep;
              const active = number === currentStep;
              return (
                <li aria-current={active ? "step" : undefined} className={active ? "active" : complete ? "complete" : ""} key={step}>
                  <span aria-hidden="true">
                    {complete ? <Icon name="check" /> : number}
                  </span>
                  <span>{step}</span>
                </li>
              );
            })}
          </ol>
          <p className="onboarding-rail-message">A little help for your everyday teaching. We’ll guide you, one step at a time.</p>
          <div className="rail-note">
            <SyncStatus />
          </div>
        </aside>
        <main className="onboarding-main" id="main-content">
          <div className="mobile-stepper" aria-hidden="true">
            {steps.map((step, index) => (
              <span className={index + 1 <= currentStep ? "active" : ""} key={step} />
            ))}
          </div>
          <p className="onboarding-mobile-progress">Step {currentStep} of 3 · {steps[currentStep - 1]}</p>
          {children}
        </main>
      </div>
    </div>
  );
}
