"use client";

import { useDemo } from "@/features/demo/demo-provider";
import type { PromptTemplate } from "@/features/demo/demo-state";
import { promptLibraryCategories, promptLibraryReady } from "@/features/learning/prompt-library";

const fields: { key: Exclude<keyof PromptTemplate, "category">; label: string; hint: string }[] = [
  { key: "template", label: "Reusable template", hint: "Use named slots such as [objective], [grade], [source] and [constraints]." },
  { key: "completedExample", label: "Completed example", hint: "Fill the slots using a fictional or general classroom task." },
  { key: "knownFailure", label: "Known failure", hint: "Name a weakness found during testing and the input that exposed it." },
  { key: "reviewChecklist", label: "Teacher verification", hint: "List facts, alignment, accessibility and safety checks before use." },
  { key: "transferNote", label: "Transfer result", hint: "Try a different topic or grade and record what needed changing." },
];

function downloadLibrary(templates: PromptTemplate[]) {
  const content = ["# PromptShala teaching prompt library", "", ...promptLibraryCategories.flatMap(({ id, label }) => {
    const template = templates.find((item) => item.category === id);
    return [`## ${label}`, "", ...fields.flatMap(({ key, label: fieldLabel }) =>
      [`### ${fieldLabel}`, template?.[key] || "Not recorded", ""]), ""];
  }), "Check all AI outputs before classroom use. Do not add private learner records."].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "promptshala-prompt-library.md";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function PromptLibraryEditor() {
  const { state, updateState } = useDemo();
  function edit(category: PromptTemplate["category"], key: Exclude<keyof PromptTemplate, "category">, value: string) {
    updateState((current) => {
      const existing = current.promptLibrary.find((item) => item.category === category);
      const template: PromptTemplate = { category, template: "", completedExample: "", knownFailure: "", reviewChecklist: "", transferNote: "", ...existing, [key]: value };
      return { ...current, promptLibrary: [...current.promptLibrary.filter((item) => item.category !== category), template] };
    });
  }
  return <div className="prompt-library-editor">
    <div className="section-heading"><div><span className="eyebrow">Portfolio artifact</span><h2>Three reusable templates</h2></div><button className="button button-secondary button-small" onClick={() => downloadLibrary(state.promptLibrary)} type="button">Export library</button></div>
    <p>Complete each template, test it with a different classroom context, and record one known failure. Your drafts save with your progress.</p>
    {promptLibraryCategories.map(({ id, label }) => {
      const template = state.promptLibrary.find((item) => item.category === id);
      const complete = template && fields.every(({ key }) => template[key].trim().length >= 20);
      return <details className="prompt-library-card" key={id} open={id === "planning" && !complete}><summary>{label} · {complete ? "Ready" : "In progress"}</summary>{fields.map(({ key, label: fieldLabel, hint }) => <label key={key}><strong>{fieldLabel}</strong><small>{hint}</small><textarea maxLength={key === "template" || key === "completedExample" ? 2500 : 1200} onChange={(event) => edit(id, key, event.target.value)} rows={4} value={template?.[key] ?? ""} /></label>)}</details>;
    })}
    <p role="status">{promptLibraryReady(state.promptLibrary) ? "All three templates are ready for teacher review and export." : "Complete all five fields for each of the three templates to finish this lesson."}</p>
  </div>;
}
