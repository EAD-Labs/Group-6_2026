import { RequestValidationError } from "@/lib/server/request";

export const geminiKeyHeader = "x-promptshala-gemini-key";
export const geminiKeyMaxLength = 2048;

export function isValidGeminiKey(value: string) {
  // Accept both standard keys and Google's newer authorization-key tokens.
  // Google validates the credential itself; we only enforce safe header input.
  return /^[A-Za-z0-9._~+\/=-]{20,2048}$/.test(value);
}

export function readParticipantGeminiKey(request: Request) {
  const value = request.headers.get(geminiKeyHeader);
  if (value === null) return undefined;
  const key = value.trim();
  if (!isValidGeminiKey(key)) {
    throw new RequestValidationError("Your Gemini key looks incomplete. Add it again in Gemini connection settings.");
  }
  return key;
}
