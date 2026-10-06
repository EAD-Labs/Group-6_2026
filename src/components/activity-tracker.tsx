"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDemo } from "@/features/demo/demo-provider";
import { createActiveClock, type ActivityInput } from "@/features/analytics/client";

type QueuedEvent = ActivityInput & { id: string; sessionId: string; path: string; occurredAt: string };
export function ActivityTracker() {
  const { participantId, hydrated } = useDemo();
  const path = usePathname();
  useEffect(() => {
    if (!hydrated || !participantId || !/^\/(?:dashboard|learn|progress|profile|onboarding|certificate|admin|staff)(?:\/|$)/.test(path)) return;
    const key = `promptshala:activity:${participantId}`;
    let queue: QueuedEvent[] = [], sending = false;
    try {
      const stored = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (Array.isArray(stored)) queue = stored.filter(event => Date.parse(event.occurredAt) > Date.now() - 7 * 86400_000).slice(-500);
    } catch {}
    const sessionKey = `promptshala:session:${participantId}`;
    let sessionId = crypto.randomUUID();
    try { sessionId = sessionStorage.getItem(sessionKey) || sessionId; sessionStorage.setItem(sessionKey, sessionId); } catch {}
    const persist = () => { try { localStorage.setItem(key, JSON.stringify(queue)); } catch {} };
    const add = (event: ActivityInput) => {
      queue.push({ ...event, activeMs: event.activeMs ?? 0, id: crypto.randomUUID(), sessionId, path, occurredAt: new Date().toISOString() });
      queue = queue.slice(-500); persist();
    };
    async function flush() {
      if (!queue.length || sending || !navigator.onLine) return;
      const batch = queue.slice(0, 50); sending = true;
      try {
        const response = await fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ participantId, events: batch }), keepalive: true });
        if (response.ok || response.status === 400) {
          const ids = new Set(batch.map(event => event.id));
          try { const latest = JSON.parse(localStorage.getItem(key) ?? "[]"); if (Array.isArray(latest)) queue = [...new Map([...queue, ...latest].map(event => [event.id, event])).values()]; } catch {}
          queue = queue.filter(event => !ids.has(event.id)); persist();
        }
      } catch {} finally { sending = false; }
    }
    const clock = createActiveClock();
    const checkpoint = () => { const activeMs = clock.take(); if (activeMs > 0) add({ kind: "page_time", activeMs }); };
    const activity = (event: Event) => add((event as CustomEvent<ActivityInput>).detail);
    const click = (event: MouseEvent) => {
      const element = (event.target as Element)?.closest?.("a,button,input[type=radio],input[type=checkbox],summary");
      if (!element) return;
      const href = element.getAttribute("href");
      const destination = href?.startsWith("/") ? href.split(/[?#]/)[0] : "";
      const target = element.getAttribute("data-analytics-id") || (destination ? `link:${destination}` : `${element.tagName.toLowerCase()}:${element.getAttribute("type") || "control"}`);
      if (/^[a-z0-9_/:.\-]{1,160}$/i.test(target)) add({ kind: "click", target });
    };
    const leave = () => { checkpoint(); void flush(); };
    const visibility = () => { if (document.visibilityState === "hidden") leave(); };
    add({ kind: "page_view" }); void flush();
    const timer = window.setInterval(() => { checkpoint(); void flush(); }, 15_000);
    document.addEventListener("click", click); document.addEventListener("visibilitychange", visibility);
    window.addEventListener("promptshala:activity", activity); window.addEventListener("pagehide", leave); window.addEventListener("online", flush);
    return () => {
      checkpoint(); void flush(); clock.stop(); window.clearInterval(timer);
      document.removeEventListener("click", click); document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("promptshala:activity", activity); window.removeEventListener("pagehide", leave); window.removeEventListener("online", flush);
    };
  }, [hydrated, participantId, path]);
  return null;
}
