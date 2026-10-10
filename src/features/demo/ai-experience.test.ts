import { describe, expect, it } from "vitest";
import { emptyAiExperience, sanitizeAiExperience, toggleAiTool } from "./ai-experience";

describe("AI experience answers", () => {
  it("treats no previous AI use as an exclusive choice", () => {
    expect(toggleAiTool(["Gemini", "ChatGPT"], "None yet")).toEqual(["None yet"]);
    expect(toggleAiTool(["None yet"], "Gemini")).toEqual(["Gemini"]);
    expect(toggleAiTool(["Gemini"], "Gemini")).toEqual([]);
    expect(sanitizeAiExperience({ aiToolsUsed: ["None yet", "Gemini"], currentAiUse: "Old answer", aiToolOther: "Other tool", aiUseFrequency: "Most days" }))
      .toEqual({ ...emptyAiExperience, aiToolsUsed: ["None yet"], aiUseFrequency: "Not yet" });
  });

  it("bounds free text, deduplicates known tools and rejects unsupported answers", () => {
    const answers = sanitizeAiExperience({ aiToolsUsed: ["Gemini", "Other", "Gemini", "Unknown" as "Gemini"], aiToolOther: "X".repeat(150), currentAiUse: "Y".repeat(1500), aiUseFrequency: "Always" as "Most days" });
    expect(answers.aiToolsUsed).toEqual(["Gemini", "Other"]);
    expect(answers.aiToolOther).toHaveLength(120);
    expect(answers.currentAiUse).toHaveLength(1000);
    expect(answers.aiUseFrequency).toBe("Prefer not to say");
    expect(sanitizeAiExperience({})).toEqual(emptyAiExperience);
  });
});
