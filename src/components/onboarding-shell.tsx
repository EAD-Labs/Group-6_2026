import type { ReactNode } from "react";

import { Brand } from "./ui/brand";
import { Icon } from "./ui/icon";

const steps = ["Safe use", "Teacher profile", "Goals"];

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
        <span>About 3 minutes</span>
      </header>
      <div className="onboarding-layout">
        <aside className="onboarding-rail" aria-label="Onboarding progress">
          <p className="overline">Getting started</p>
          <p className="onboarding-step-count">Step {currentStep} of 3</p>
          <ol>
            {steps.map((step, index) => {
              const number = index + 1;
              const complete = number < currentStep;
              const active = number === currentStep;
              return (
                <li className={active ? "active" : complete ? "complete" : ""} key={step}>
                  <span aria-hidden="true">
                    {complete ? <Icon name="check" /> : number}
                  </span>
                  <span>{step}</span>
                </li>
              );
            })}
          </ol>
          <div className="rail-note">
            <Icon name="cloud" />
            <span>Your choices are saved on this device.</span>
          </div>
        </aside>
        <main className="onboarding-main" id="main-content">
          <div className="mobile-stepper" aria-hidden="true">
            {steps.map((step, index) => (
              <span className={index + 1 <= currentStep ? "active" : ""} key={step} />
            ))}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
