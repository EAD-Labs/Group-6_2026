export const aiToolOptions = ["ChatGPT", "Gemini", "Copilot", "Claude", "Other", "None yet"] as const;
export type AiTool = (typeof aiToolOptions)[number];

export const aiFrequencyOptions = ["Not yet", "Occasionally", "Every week", "Most days", "Prefer not to say"] as const;
export type AiUseFrequency = (typeof aiFrequencyOptions)[number];

export type AiExperience = {
  aiToolsUsed: AiTool[];
  aiToolOther: string;
  currentAiUse: string;
  aiUseFrequency: AiUseFrequency;
};

export const emptyAiExperience: AiExperience = {
  aiToolsUsed: [],
  aiToolOther: "",
  currentAiUse: "",
  aiUseFrequency: "Prefer not to say",
};

export function toggleAiTool(tools: AiTool[], tool: AiTool): AiTool[] {
  if (tools.includes(tool)) return tools.filter((value) => value !== tool);
  if (tool === "None yet") return [tool];
  return [...tools.filter((value) => value !== "None yet"), tool];
}

export function sanitizeAiExperience(input: Partial<AiExperience>): AiExperience {
  const tools = Array.isArray(input.aiToolsUsed)
    ? [...new Set(input.aiToolsUsed.filter((value): value is AiTool => aiToolOptions.includes(value as AiTool)))]
    : [];
  const aiToolsUsed = tools.includes("None yet") ? ["None yet" as const] : tools;
  const noTools = aiToolsUsed.includes("None yet");
  return {
    aiToolsUsed,
    aiToolOther: aiToolsUsed.includes("Other") && typeof input.aiToolOther === "string" ? input.aiToolOther.trim().slice(0, 120) : "",
    currentAiUse: !noTools && typeof input.currentAiUse === "string" ? input.currentAiUse.trim().slice(0, 1000) : "",
    aiUseFrequency: noTools ? "Not yet" : aiFrequencyOptions.includes(input.aiUseFrequency as AiUseFrequency)
      ? input.aiUseFrequency as AiUseFrequency : emptyAiExperience.aiUseFrequency,
  };
}
