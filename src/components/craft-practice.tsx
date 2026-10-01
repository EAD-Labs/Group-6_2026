"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useScopedDraft } from "./ui/use-scoped-draft";

import {
  createRuleBasedCraftEvaluation,
  type CraftAiEvaluation,
} from "@/features/learning/craft-ai";
import {
  createCraftScenario,
  craftDimensions,
  craftScenarios,
} from "@/features/learning/craft";

import { Icon } from "./ui/icon";
import { useDemo } from "@/features/demo/demo-provider";

type Attempt = CraftAiEvaluation & { number: number; prompt: string; task: string; createdAt: string };
type PracticeDraft = { suggestionId?: string; task: string; prompt: string; attempts: Attempt[] };
const initialPractice: PracticeDraft = { suggestionId: craftScenarios[0].id, task: craftScenarios[0].task, prompt: craftScenarios[0].startingPrompt, attempts: [] };
function cleanPractice(value: unknown): PracticeDraft {
  const raw = value && typeof value === "object" ? value as Partial<PracticeDraft> : {};
  return { suggestionId: craftScenarios.some((item) => item.id === raw.suggestionId) ? raw.suggestionId : undefined,
    task: typeof raw.task === "string" ? raw.task.slice(0, 300) : initialPractice.task,
    prompt: typeof raw.prompt === "string" ? raw.prompt.slice(0, 12000) : initialPractice.prompt,
    attempts: Array.isArray(raw.attempts) ? raw.attempts.filter((item) => item && typeof item.prompt === "string" && typeof item.task === "string" && typeof item.overallScore === "number" && Array.isArray(item.dimensions) && item.dimensions.length === 5 && item.dimensions.every((dimension) => dimension && typeof dimension.score === "number" && typeof dimension.label === "string") && Array.isArray(item.safetyFlags)).slice(-8) : [] };
}

export function CraftPractice() {
  const { storageScope } = useDemo();
  return <CraftPracticeWorkspace key={storageScope} />;
}
function CraftPracticeWorkspace() {
  const { updateState } = useDemo();
  const [practice, setPractice, storage] = useScopedDraft("craft", initialPractice, cleanPractice);
  const { task, suggestionId, prompt: draft, attempts } = practice;
  const scenario = useMemo(() => createCraftScenario(task, suggestionId), [task, suggestionId]);
  const latest = attempts.at(-1);
  const result = latest?.prompt === draft && latest.task === task ? latest : null;
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [fallbackReason, setFallbackReason] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);
  useEffect(() => () => { cancelledRef.current = true; controllerRef.current?.abort(); }, []);

  function selectSuggestion(nextScenarioId: string) {
    const next = craftScenarios.find((item) => item.id === nextScenarioId) ?? craftScenarios[0];
    setPractice({ ...practice, suggestionId: next.id, task: next.task, prompt: next.startingPrompt });
    setFallbackReason("");
  }
  function record(evaluation: CraftAiEvaluation) {
    setPractice({ ...practice, attempts: [...attempts, { ...evaluation, number: (attempts.at(-1)?.number ?? 0) + 1, prompt: draft, task, createdAt: new Date().toISOString() }].slice(-8) });
    updateState((current) => ({ ...current, craftPracticeCount: current.craftPracticeCount + 1 }));
  }
  async function evaluateDraft() {
    setIsEvaluating(true); setFallbackReason(""); cancelledRef.current = false;
    const controller = new AbortController(); controllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch("/api/craft/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({ prompt: draft, suggestionId, task }) });
      const payload = await response.json() as { error?: string; evaluation?: CraftAiEvaluation; fallbackReason?: string };
      if (!response.ok || !payload.evaluation) throw new Error(payload.error ?? "Evaluation unavailable.");
      if (!cancelledRef.current) { record(payload.evaluation); setFallbackReason(payload.fallbackReason ?? ""); }
    } catch {
      if (!cancelledRef.current) { record(createRuleBasedCraftEvaluation(draft, scenario)); setFallbackReason("The AI evaluator was unavailable. This checklist checks visible CRAFT signals; it cannot judge factual accuracy or nuance. Your draft is preserved for another try."); }
    } finally { window.clearTimeout(timeout); if (!cancelledRef.current) setIsEvaluating(false); }
  }
  function cancelEvaluation() { cancelledRef.current = true; controllerRef.current?.abort(); setIsEvaluating(false); setFallbackReason("Evaluation cancelled. Your draft is unchanged and ready to try again."); }
  function useStrongExample() { setPractice({ ...practice, prompt: scenario.strongPrompt }); setFallbackReason(""); }

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
          <span className="eyebrow">Optional starting points</span>
          <h2 id="scenario-title">Try a task suggestion</h2>
          <p className="scenario-helper">These examples fill the task and prompt fields. Edit either field or write a completely different task.</p>
          <div className="scenario-list" role="list">
            {craftScenarios.map((item) => (
              <button
                aria-pressed={suggestionId === item.id}
                className={suggestionId === item.id ? "active" : ""}
                key={item.id}
                disabled={isEvaluating}
                onClick={() => selectSuggestion(item.id)}
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
          <div className="scenario-brief custom-task-brief">
            <span><Icon name="target" /></span>
            <div><strong>Two inputs, one focused review</strong><p>The evaluator uses your intended task to judge whether your prompt will produce the result you actually need.</p></div>
          </div>
          <label className="craft-textarea-label craft-task-label" htmlFor="craft-task">
            What should this prompt help you do?
            <input
              id="craft-task"
              maxLength={300}
              disabled={isEvaluating}
              onChange={(event) => setPractice({ ...practice, task: event.target.value, suggestionId: craftScenarios.some((item) => item.id === suggestionId && item.task === event.target.value) ? suggestionId : undefined })}
              placeholder="For example: Make a question bank for a revision lesson"
              type="text"
              value={task}
            />
            <span>{task.length}/300 characters · Use a suggestion or describe your own task</span>
          </label>
          <label className="craft-textarea-label" htmlFor="craft-prompt">
            Prompt to analyse
            <textarea
              id="craft-prompt"
              maxLength={12000}
              disabled={isEvaluating}
              onChange={(event) => setPractice({ ...practice, prompt: event.target.value })}
              rows={9}
              value={draft}
            />
            <span>{draft.length}/12,000 characters · Only your task and prompt are sent when you select Score.</span>
          </label>
          <div className="craft-editor-actions">
            <button
              className="button button-primary"
              disabled={!task.trim() || !draft.trim() || isEvaluating}
              onClick={evaluateDraft}
              type="button"
            >
              {isEvaluating
                ? "Scoring every CRAFT dimension…"
                : "Score my CRAFT prompt"}{" "}
              <Icon name="arrow-right" />
            </button>
            <button className="button button-secondary" disabled={!scenario.strongPrompt || isEvaluating} onClick={useStrongExample} type="button">
              Load strong example
            </button>
            {isEvaluating ? <button className="text-link" type="button" onClick={cancelEvaluation}>Cancel evaluation</button> : null}
          </div>
          <p className="draft-note" role="status">{isEvaluating ? "Reviewing the five CRAFT dimensions. This may take up to 30 seconds." : storage.persisted ? "Draft and recent feedback saved on this device for this account. Use only fictional examples." : "Device storage is unavailable. Keep this tab open to retain your draft."}</p>
          {fallbackReason && !result ? <p className="feedback-box supportive" role="status">{fallbackReason}</p> : null}
          {attempts.length ? <button className="text-link" type="button" disabled={isEvaluating} onClick={() => { setPractice(initialPractice); setFallbackReason("This device’s practice draft and feedback were cleared. Your completed practice count remains in your learning record."); }}>Clear this device’s practice draft</button> : null}
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

      {attempts.length > 1 ? <section className="attempt-comparison" aria-labelledby="attempt-comparison-title"><div><span className="eyebrow">Read the change, not just the score</span><h2 id="attempt-comparison-title">Your two latest attempts</h2><p>Compare the words you changed and the feedback on each dimension. A score is guidance; teacher review still matters.</p></div><div>{attempts.slice(-2).map((attempt) => <article key={attempt.number}><span className="eyebrow">Attempt {attempt.number} · {attempt.source === "gemini" ? "AI feedback" : "Checklist feedback"}</span><h3>{attempt.task}</h3><strong className="attempt-score">{attempt.overallScore}/15</strong><pre>{attempt.prompt}</pre><div className="attempt-dimensions">{attempt.dimensions.map((dimension) => <span key={dimension.id}>{dimension.label}<strong>{dimension.score}/3</strong></span>)}</div><p>{attempt.summary}</p><button className="text-link" disabled={isEvaluating} type="button" onClick={() => setPractice({ ...practice, task: attempt.task, prompt: attempt.prompt, suggestionId: undefined })}>Use this draft again<Icon name="arrow-right" /></button></article>)}</div></section> : null}
    </>
  );
}
