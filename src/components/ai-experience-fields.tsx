"use client";

import { Icon } from "@/components/ui/icon";
import { aiFrequencyOptions, aiToolOptions, toggleAiTool, type AiExperience, type AiTool } from "@/features/demo/ai-experience";
import type { AiFamiliarity } from "@/features/demo/demo-state";

export type AiExperienceAnswers = AiExperience & { aiFamiliarity: AiFamiliarity };

const familiarityOptions: { value: AiFamiliarity; label: string; description: string }[] = [
  { value: "New to AI", label: "I'm just starting", description: "Please explain each step." },
  { value: "Tried it a few times", label: "I've tried it a little", description: "I still need some help." },
  { value: "Use it sometimes", label: "I know the basics", description: "I use AI for a few tasks." },
  { value: "Use it regularly", label: "I'm comfortable with AI", description: "I want to build on what I know." },
];

export function AiExperienceFields({ value, onChange }: {
  value: AiExperienceAnswers;
  onChange: (changes: Partial<AiExperienceAnswers>) => void;
}) {
  const noTools = value.aiToolsUsed.includes("None yet");

  function chooseTool(tool: AiTool) {
    const aiToolsUsed = toggleAiTool(value.aiToolsUsed, tool);
    onChange({
      aiToolsUsed,
      ...(!aiToolsUsed.includes("Other") ? { aiToolOther: "" } : {}),
      ...(aiToolsUsed.includes("None yet") ? { currentAiUse: "", aiUseFrequency: "Not yet", aiFamiliarity: "New to AI" } : {}),
    });
  }

  return (
    <div className="ai-experience-fields">
      <fieldset className="experience-question">
        <legend>Which AI tools have you tried?</legend>
        <p className="question-help">Choose all that apply. New to AI? Choose “None yet”.</p>
        <div className="ai-tool-grid">
          {aiToolOptions.map((tool) => (
            <label className="ai-tool-choice" key={tool}>
              <input type="checkbox" checked={value.aiToolsUsed.includes(tool)} onChange={() => chooseTool(tool)} />
              <span className="ai-tool-label"><span>{tool}</span><Icon name="check" /></span>
            </label>
          ))}
        </div>
        {value.aiToolsUsed.includes("Other") ? (
          <label className="experience-text-field">Which other tool? <small>Optional</small>
            <input maxLength={120} value={value.aiToolOther} onChange={(event) => onChange({ aiToolOther: event.target.value })} placeholder="The name of the tool you use" />
          </label>
        ) : null}
      </fieldset>

      {noTools ? (
        <div className="onboarding-reassurance"><Icon name="sparkles" /><p><strong>You’re in the right place.</strong> We’ll start with the basics. You don’t need any AI experience.</p></div>
      ) : (
        <>
          <fieldset className="experience-question">
            <legend>How often do you use AI?</legend>
            <div className="frequency-choices">
              {aiFrequencyOptions.map((frequency) => (
                <label key={frequency}><input type="radio" name="ai-use-frequency" checked={value.aiUseFrequency === frequency} onChange={() => onChange({ aiUseFrequency: frequency })} /><span>{frequency}</span></label>
              ))}
            </div>
          </fieldset>
          <label className="experience-text-field">What do you use AI for today? <small>Optional</small>
            <textarea maxLength={1000} rows={3} value={value.currentAiUse} onChange={(event) => onChange({ currentAiUse: event.target.value })} placeholder="For example: lesson ideas, writing emails, making quizzes, or everyday questions." />
            <span className="question-help">A short answer is enough. Please leave out student names or personal details.</span>
          </label>
          <fieldset className="experience-question">
            <legend>How comfortable do you feel with AI?</legend>
            <div className="experience-level-grid">
              {familiarityOptions.map((option) => (
                <label key={option.value}><input type="radio" name="ai-familiarity" checked={value.aiFamiliarity === option.value} onChange={() => onChange({ aiFamiliarity: option.value })} /><span><strong>{option.label}</strong><small>{option.description}</small></span></label>
              ))}
            </div>
          </fieldset>
        </>
      )}
    </div>
  );
}
