import {
  craftDimensions,
  evaluateCraftPrompt,
  type CraftDimensionId,
  type CraftScenario,
} from "./craft";

export type CraftAiDimensionResult = {
  evidence: string;
  feedback: string;
  id: CraftDimensionId;
  label: string;
  maxScore: 3;
  score: number;
  suggestion: string;
};

export type CraftAiEvaluation = {
  dimensions: CraftAiDimensionResult[];
  headline: string;
  maxScore: 15;
  model: string;
  nextSteps: string[];
  overallScore: number;
  safetyFlags: string[];
  scorePercent: number;
  source: "gemini" | "rule-based";
  summary: string;
};

type UnknownRecord = Record<string, unknown>;

const rubricGuide = {
  0: "Missing",
  1: "Present but vague",
  2: "Usable with an important detail missing",
  3: "Specific, relevant and easy for a teacher to review",
} as const;

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null
    ? (value as UnknownRecord)
    : {};
}

function cleanText(value: unknown, fallback: string, maxLength = 420) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maxLength)
    : fallback;
}

function cleanStringList(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, 220))
    .filter(Boolean)
    .slice(0, maxItems);
}

function cleanScore(value: unknown) {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue)
    ? Math.max(0, Math.min(3, Math.round(numericValue)))
    : 0;
}

function headlineForScore(scorePercent: number) {
  if (scorePercent >= 87) {
    return "Strong CRAFT prompt";
  }
  if (scorePercent >= 67) {
    return "Usable prompt with focused improvements";
  }
  if (scorePercent >= 40) {
    return "Good start with important details missing";
  }
  return "Build the prompt one CRAFT step at a time";
}

export function createRuleBasedCraftEvaluation(
  prompt: string,
  scenario: CraftScenario,
): CraftAiEvaluation {
  const structuralResult = evaluateCraftPrompt(prompt, scenario);
  const dimensions = structuralResult.dimensions.map((dimension) => ({
    evidence: dimension.met
      ? "A matching structural signal appears in the prompt."
      : "No clear structural signal was detected.",
    feedback: dimension.feedback,
    id: dimension.id,
    label: dimension.label,
    maxScore: 3 as const,
    score: dimension.met ? 3 : 0,
    suggestion: dimension.met
      ? "Keep this detail concise and relevant."
      : dimension.description,
  }));
  const overallScore = dimensions.reduce(
    (total, dimension) => total + dimension.score,
    0,
  );
  const scorePercent = Math.round((overallScore / 15) * 100);

  return {
    dimensions,
    headline: headlineForScore(scorePercent),
    maxScore: 15,
    model: "deterministic CRAFT fallback",
    nextSteps: dimensions
      .filter((dimension) => dimension.score < 2)
      .slice(0, 3)
      .map(
        (dimension) =>
          "Improve " + dimension.label + ": " + dimension.suggestion,
      ),
    overallScore,
    safetyFlags: [],
    scorePercent,
    source: "rule-based",
    summary:
      "This fallback checks visible CRAFT signals. It does not judge nuance or factual correctness.",
  };
}

export function buildGeminiCraftRequest(
  prompt: string,
  scenario: CraftScenario,
) {
  const responseSchema = {
    type: "object",
    properties: {
      dimensions: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              enum: craftDimensions.map((dimension) => dimension.id),
            },
            score: { type: "integer", minimum: 0, maximum: 3 },
            evidence: { type: "string" },
            feedback: { type: "string" },
            suggestion: { type: "string" },
          },
          required: ["id", "score", "evidence", "feedback", "suggestion"],
        },
      },
      summary: { type: "string" },
      nextSteps: {
        type: "array",
        items: { type: "string" },
        maxItems: 3,
      },
      safetyFlags: {
        type: "array",
        items: { type: "string" },
        maxItems: 4,
      },
    },
    required: ["dimensions", "summary", "nextSteps", "safetyFlags"],
  };

  const evaluatorPrompt = [
    "You evaluate prompts written by beginner school teachers.",
    "Scenario: " + scenario.title + ". " + scenario.summary,
    "Score each CRAFT dimension independently from 0 to 3.",
    ...Object.entries(rubricGuide).map(
      ([score, meaning]) => score + ": " + meaning + ".",
    ),
    "CRAFT means Context, Role, Action, Format and Target.",
    "Judge the clarity and classroom usefulness of the teacher prompt, not an answer that has not been generated.",
    "Evidence must point closely to the teacher words. Feedback and suggestions must be brief, supportive and specific.",
    "Flag possible personal student data, unsafe high-stakes decisions, unsupported factual authority, or copyright and source risks.",
    "Do not reward unnecessary length. Do not invent absent details.",
    "Teacher prompt:",
    prompt,
  ].join("\\n");

  return {
    input: evaluatorPrompt,
    generation_config: {
      temperature: 0.1,
      max_output_tokens: 1000,
      thinking_level: "minimal",
    },
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: responseSchema,
    },
  };
}

export function normalizeGeminiCraftEvaluation(
  value: unknown,
  model: string,
): CraftAiEvaluation {
  const record = asRecord(value);
  const rawDimensions = Array.isArray(record.dimensions)
    ? record.dimensions.map(asRecord)
    : [];
  const rawById = new Map(
    rawDimensions.map((dimension) => [String(dimension.id), dimension]),
  );
  const dimensions = craftDimensions.map((dimension) => {
    const rawDimension = rawById.get(dimension.id) ?? {};
    const score = cleanScore(rawDimension.score);

    return {
      evidence: cleanText(
        rawDimension.evidence,
        score > 0
          ? "The model found a relevant signal."
          : "No clear evidence found.",
      ),
      feedback: cleanText(rawDimension.feedback, dimension.description),
      id: dimension.id,
      label: dimension.label,
      maxScore: 3 as const,
      score,
      suggestion: cleanText(rawDimension.suggestion, dimension.prompt),
    };
  });
  const overallScore = dimensions.reduce(
    (total, dimension) => total + dimension.score,
    0,
  );
  const scorePercent = Math.round((overallScore / 15) * 100);

  return {
    dimensions,
    headline: headlineForScore(scorePercent),
    maxScore: 15,
    model,
    nextSteps: cleanStringList(record.nextSteps, 3),
    overallScore,
    safetyFlags: cleanStringList(record.safetyFlags, 4),
    scorePercent,
    source: "gemini",
    summary: cleanText(
      record.summary,
      "Review the dimension feedback and revise the prompt once.",
    ),
  };
}
