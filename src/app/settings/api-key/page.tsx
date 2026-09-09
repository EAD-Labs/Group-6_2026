import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI evaluation",
};

export default function ApiKeyPage() {
  return (
    <main className="page-shell narrow-shell">
      <span className="eyebrow">AI practice privacy</span>
      <h1>Your browser never receives the evaluator key</h1>
      <p>
        Module 1 does not need AI. The CRAFT practice sends a prompt to a
        restricted server-side evaluator only after the participant selects
        Score my CRAFT prompt.
      </p>
      <div className="privacy-notice" role="note">
        <strong>Current pilot safeguards</strong>
        <p>
          PromptShala does not store raw prompt text. It records only a one-way
          fingerprint, rubric scores, evaluator source and safety flags for an
          authenticated participant. A transparent local CRAFT check remains
          available if the evaluator is unavailable.
        </p>
      </div>
    </main>
  );
}
