type PublicSupabaseEnvironment = {
  publishableKey: string;
  url: string;
};

type GeminiEnvironment = {
  apiKey: string;
  model: string;
};

export const defaultCraftEvaluationModel = "gemini-3.5-flash";

export function hasPublicSupabaseEnvironment() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function getPublicSupabaseEnvironment(): PublicSupabaseEnvironment {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { publishableKey, url };
}

export function hasGeminiEnvironment() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGeminiEnvironment(): GeminiEnvironment {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  return {
    apiKey,
    model: process.env.GEMINI_CRAFT_MODEL ?? defaultCraftEvaluationModel,
  };
}
