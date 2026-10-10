import { describe, expect, it } from "vitest";
import { geminiKeyHeader, readParticipantGeminiKey } from "./gemini-key";
import { getGeminiEnvironment } from "@/lib/env";

describe("participant Gemini key boundary", () => {
  it("reads an explicit key and overrides only the provider credential", () => {
    const key = "a_private_participant_key_12345";
    const request = new Request("https://example.test", { headers: { [geminiKeyHeader]: key } });
    expect(readParticipantGeminiKey(request)).toBe(key);
    expect(getGeminiEnvironment(key).apiKey).toBe(key);
  });
  it("returns no override when absent and rejects malformed key headers", () => {
    expect(readParticipantGeminiKey(new Request("https://example.test"))).toBeUndefined();
    expect(() => readParticipantGeminiKey(new Request("https://example.test", { headers: { [geminiKeyHeader]: "short" } }))).toThrow("looks incomplete");
    expect(() => readParticipantGeminiKey(new Request("https://example.test", { headers: { [geminiKeyHeader]: "key with spaces and other words" } }))).toThrow("looks incomplete");
  });
  it("accepts authorization-key token punctuation and longer credentials", () => {
    const key = "AQ." + "a".repeat(300) + ".b_-=";
    expect(readParticipantGeminiKey(new Request("https://example.test", { headers: { [geminiKeyHeader]: key } }))).toBe(key);
  });
});
