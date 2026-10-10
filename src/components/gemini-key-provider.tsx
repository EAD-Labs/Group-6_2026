"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useDemo } from "@/features/demo/demo-provider";
import { geminiKeyHeader, isValidGeminiKey } from "@/lib/ai/gemini-key";

type GeminiKeyContextValue = {
  enabled: boolean;
  setKey: (key: string) => void;
  clearKey: () => void;
  requestHeaders: () => Record<string, string>;
};
const GeminiKeyContext = createContext<GeminiKeyContextValue>({ enabled: false, setKey: () => {}, clearKey: () => {}, requestHeaders: () => ({}) });

export function GeminiKeyProvider({ children }: { children: ReactNode }) {
  const { participantId } = useDemo();
  return <GeminiKeySession key={participantId ?? "signed-out"} participantId={participantId}>{children}</GeminiKeySession>;
}

function GeminiKeySession({ children, participantId }: { children: ReactNode; participantId: string | null }) {
  const [connection, setConnection] = useState<{ owner: string; key: string } | null>(null);
  const clearKey = useCallback(() => setConnection(null), []);
  const enabled = Boolean(participantId && connection?.owner === participantId);

  useEffect(() => {
    window.addEventListener("promptshala:signout", clearKey);
    return () => window.removeEventListener("promptshala:signout", clearKey);
  }, [clearKey]);

  const setKey = useCallback((value: string) => {
    if (!participantId) throw new Error("Sign in before adding your Gemini key.");
    const key = value.trim();
    if (!isValidGeminiKey(key)) throw new Error("Your Gemini key looks incomplete. Copy the whole key and try again.");
    setConnection({ owner: participantId, key });
  }, [participantId]);
  const requestHeaders = useCallback((): Record<string, string> => enabled && connection
    ? { [geminiKeyHeader]: connection.key } : {}, [enabled, connection]);
  const value = useMemo(() => ({ enabled, setKey, clearKey, requestHeaders }), [enabled, setKey, clearKey, requestHeaders]);
  return <GeminiKeyContext.Provider value={value}>{children}</GeminiKeyContext.Provider>;
}

export function useGeminiKey() { return useContext(GeminiKeyContext); }
