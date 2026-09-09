"use client";

import { useMemo, useState } from "react";

import {
  createRuleBasedCraftEvaluation,
  type CraftAiEvaluation,
} from "@/features/learning/craft-ai";
import {
  craftDimensions,
  craftScenarios,
} from "@/features/learning/craft";

import { Icon } from "./ui/icon";

type Attempt = CraftAiEvaluation & {
  number: number;
};

export function CraftPractice() {
  const [scenarioId, setScenarioId] = useState(craftScenarios[0].id);
  const scenario = useMemo(
    () => craftScenarios.find((item) => item.id === scenarioId) ?? craftScenarios[0],
    [scenarioId],
  );
  const [draft, setDraft] = useState(craftScenarios[0].startingPrompt);
  const [result, setResult] = useState<CraftAiEvaluation | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [fallbackReason, setFallbackReason] = useState("");

  function selectScenario(nextScenarioId: string) {
    const nextScenario =
      craftScenarios.find((item) => item.id === nextScenarioId) ?? craftScenarios[0];
    setScenarioId(nextScenario.id);
    setDraft(nextScenario.startingPrompt);
    setResult(null);
    setAttempts([]);
    setFallbackReason("");
  }

  async function evaluateDraft() {
    setIsEvaluating(true);
    setFallbackReason("");

    try {
      const response = await fetch("/api/craft/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: draft, scenarioId: scenario.id }),
      });
      const payload = (await response.json()) as {
        error?: string;
        evaluation?: CraftAiEvaluation;
        fallbackReason?: string;
      };

      if (!response.ok || !payload.evaluation) {
        throw new Error(payload.error ?? "Prompt evaluation failed.");
      }

      const evaluation = payload.evaluation;
      setResult(evaluation);
      setFallbackReason(payload.fallbackReason ?? "");
      setAttempts((currentAttempts) => [
        ...currentAttempts,
        { ...evaluation, number: currentAttempts.length + 1 },
      ]);
    } catch {
      const fallback = createRuleBasedCraftEvaluation(draft, scenario);
      setResult(fallback);
      setFallbackReason(
        "The evaluator could not be reached, so PromptShala used its transparent CRAFT fallback.",
      );
      setAttempts((currentAttempts) => [
        ...currentAttempts,
        { ...fallback, number: currentAttempts.length + 1 },
      ]);
    } finally {
      setIsEvaluating(false);
    }
  }

  function useStrongExample() {
    setDraft(scenario.strongPrompt);
    setResult(null);
    setFallbackReason("");
  }

  return (
    <>
      <section className="craft-dimensions" aria-labelledby="craft-dimensions-title">
        <div className="section-heading craft-heading">
          <div>
            <span className="eyebrow">The selected framework</span>
            <h2 id="craft-dimensions-title">Five checks before you send</h2>
          </div>
          <span className="rule-based-chip"><Icon name="sparkles" /> AI score with transparent fallback</span>
        </div>
        <ol>
          {craftDimensions.map((dimension, index) => (
            <li key={dimension.id}>
              <span>{index + 1}</span>
              <strong>{dimension.label}</strong>
              <small>{dimension.prompt}</small>
            </li>
          ))}
        </ol>
      </section>

      <div className="craft-workspace">
        <section className="craft-scenario-panel" aria-labelledby="scenario-title">
          <span className="eyebrow">Teacher scenario</span>
          <h2 id="scenario-title">Choose a classroom need</h2>
          <div className="scenario-list" role="list">
            {craftScenarios.map((item) => (
              <button
                aria-pressed={scenario.id === item.id}
                className={scenario.id === item.id ? "active" : ""}
                key={item.id}
                onClick={() => selectScenario(item.id)}
                type="button"
              >
                <span><Icon name={scenario.id === item.id ? "check" : "target"} /></span>
                <span><strong>{item.title}</strong><small>{item.summary}</small></span>
              </button>
            ))}
          </div>
          <div className="privacy-mini craft-privacy">
            <Icon name="shield" />
            <p><strong>Use fictional examples</strong><br />Never include student names, marks or contact details.</p>
          </div>
        </section>

        <section className="craft-editor-card" aria-labelledby="practice-title">
          <div className="craft-editor-heading">
            <div>
              <span className="eyebrow">Practice canvas</span>
              <h2 id="practice-title">Write, check and improve</h2>
            </div>
            <span>Sent only when you choose Score</span>
          </div>
          <div className="scenario-brief">
            <span><Icon name="target" /></span>
            <div><strong>{scenario.title}</strong><p>{scenario.summary}</p></div>
          </div>
          <label className="craft-textarea-label" htmlFor="craft-prompt">
            Your prompt
            <textarea
              id="craft-prompt"
              onChange={(event) => {
                setDraft(event.target.value);
                setResult(null);
              }}
              rows={9}
              value={draft}
            />
            <span>{draft.length} characters · Evaluated server-side; the API key never reaches the browser</span>
          </label>
          <div className="craft-editor-actions">
            <button
              className="button button-primary"
              disabled={!draft.trim() || isEvaluating}
              onClick={evaluateDraft}
              type="button"
            >
              {isEvaluating
                ? "Scoring every CRAFT dimension…"
                : "Score my CRAFT prompt"}{" "}
              <Icon name="arrow-right" />
            </button>
            <button className="button button-secondary" onClick={useStrongExample} type="button">
              Load strong example
            </button>
          </div>
        </section>
      </div>

      {result ? (
        <section className="craft-feedback" aria-live="polite" aria-labelledby="craft-result-title">
          <div className="craft-score-panel">
            <span className="eyebrow">
              Attempt {attempts.length} ·{" "}
              {result.source === "gemini"
                ? result.model
                : "Rule-based fallback"}
            </span>
            <h2 id="craft-result-title">{result.headline}</h2>
            <p>{result.summary}</p>
            <div className="craft-score">
              <strong>
                {result.overallScore}/{result.maxScore}
              </strong>
              <span>{result.scorePercent}% CRAFT quality score</span>
            </div>
            {fallbackReason ? (
              <p className="fallback-note">
                <Icon name="info" />
                {fallbackReason}
              </p>
            ) : null}
            {result.safetyFlags.length ? (
              <div className="safety-flags">
                <strong>Safety review</strong>
                {result.safetyFlags.map((flag) => (
                  <span key={flag}>{flag}</span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="craft-feedback-list">
            {result.dimensions.map((dimension) => (
              <article
                className={
                  dimension.score >= 2
                    ? "met"
                    : dimension.score === 1
                      ? "developing"
                      : "missing"
                }
                key={dimension.id}
              >
                <span>
                  <Icon name={dimension.score >= 2 ? "check" : "info"} />
                </span>
                <div>
                  <div className="dimension-heading">
                    <strong>{dimension.label}</strong>
                    <b>{dimension.score}/3</b>
                  </div>
                  <p>{dimension.feedback}</p>
                  <small>{dimension.suggestion}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {attempts.length > 1 ? (
        <section className="attempt-comparison" aria-labelledby="attempt-comparison-title">
          <div><span className="eyebrow">Visible improvement</span><h2 id="attempt-comparison-title">Attempt comparison</h2></div>
          <div>
            {attempts.slice(-3).map((attempt) => (
              <article key={attempt.number}>
                <span>Attempt {attempt.number}</span>
                <strong>{attempt.overallScore}/15</strong>
                <small>{attempt.scorePercent}% score</small>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
