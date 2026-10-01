"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useDemo } from "@/features/demo/demo-provider";

const eventName = "promptshala-draft-change";
function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(eventName, callback); window.removeEventListener("storage", callback); };
}

/** Browser drafts are scoped only after the server has verified the active account. */
export function useScopedDraft<T>(name: string, initial: T, validate: (value: unknown) => T) {
  const { storageScope } = useDemo();
  const key = storageScope ? `promptshala:draft:v1:${storageScope}:${name}` : null;
  const [memory, setMemory] = useState<{ key: string | null; value: T; unavailable?: boolean } | null>(null);
  const read = useCallback(() => {
    if (!key) return null;
    try { return localStorage.getItem(key); } catch { return null; }
  }, [key]);
  const raw = useSyncExternalStore(subscribe, read, () => null);
  const stored = useMemo(() => {
    if (!raw) return null;
    try { return validate(JSON.parse(raw)); } catch { return null; }
  }, [raw, validate]);
  const value = memory?.key === key ? memory.value : stored ?? initial;
  const update = (next: T | ((current: T) => T)) => {
    const nextValue = typeof next === "function" ? (next as (current: T) => T)(value) : next;
    let unavailable = !key;
    if (key) {
      try { localStorage.setItem(key, JSON.stringify(nextValue)); window.dispatchEvent(new Event(eventName)); }
      catch { unavailable = true; }
    }
    setMemory({ key, value: nextValue, unavailable });
  };
  return [value, update, { persisted: Boolean(key) && !memory?.unavailable, restored: Boolean(raw) }] as const;
}
