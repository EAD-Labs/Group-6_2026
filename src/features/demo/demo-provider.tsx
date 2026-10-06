"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { type AiFamiliarity, type DemoState, initialDemoState, loadDemoState, type QuizAttempt, type TeachingLevel } from "./demo-state";
import { mergeParticipantStates, readScopedState, writeScopedState, resolveAssistantConflict, type AssistantMergeConflict, type CachedParticipantState } from "./scoped-state";
import type { AppRole } from "@/features/auth/authorization";
import { usePathname } from "next/navigation";

type ProfileInput = { displayName: string; institution: string; primarySubject: string; teachingLevel: TeachingLevel; yearsTeaching: string };
type GoalsInput = { aiFamiliarity: AiFamiliarity; goals: string[] };
export type SyncStatus = "checking" | "saved" | "saving" | "offline" | "error" | "demo" | "unauthenticated" | "conflict";
type DemoContextValue = {
  hydrated: boolean; isPresentationDemo: boolean; state: DemoState;
  syncConflicts: AssistantMergeConflict[]; resolveSyncConflict: (id: string, choice: "local" | "remote") => void;
  syncStatus: SyncStatus; syncError: string | null; retrySync: () => void;
  participantId: string | null; storageScope: string | null; role: AppRole | null;
  resetDemo: () => void; updateState: (updater: (currentState: DemoState) => DemoState) => void;
  saveGoals: (input: GoalsInput) => void; saveProfile: (input: ProfileInput) => void;
  setSafeUseAccepted: (accepted: boolean) => void; completeLesson: (lessonSlug: string) => void;
  completeModuleLesson: (module: 2 | 3 | 4, lessonId: string) => void;
  recordQuizAttempt: (attempt: QuizAttempt) => void;
  recordModuleQuizAttempt: (module: 2 | 3 | 4, attempt: QuizAttempt) => void;
};
const DemoContext = createContext<DemoContextValue | null>(null);
const sameState = (left: DemoState, right: DemoState) => JSON.stringify(left) === JSON.stringify(right);

export function DemoProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Identity is resolved before loading any account cache, including on a shared device.
  const [state, setState] = useState<DemoState>(initialDemoState);
  const [hydrated, setHydrated] = useState(false);
  const [validatedPath, setValidatedPath] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("checking");
  const [syncConflicts, setSyncConflicts] = useState<AssistantMergeConflict[]>([]);
  const conflicts = useRef<AssistantMergeConflict[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [identity, setIdentity] = useState<{ participantId: string | null; storageScope: string | null; role: AppRole | null }>({ participantId: null, storageScope: null, role: null });
  const current = useRef(state);
  const baseline = useRef(state);
  const revision = useRef(0);
  const scope = useRef<string | null>(null);
  const pending = useRef(false);
  const saving = useRef(false);
  const generation = useRef(0);
  const active = useRef(true);

  const cache = useCallback(() => {
    if (!scope.current) return;
    let saved = false;
    try { saved = writeScopedState(window.localStorage, scope.current, { state: current.current, baseline: baseline.current, revision: revision.current, pending: pending.current, conflicts: conflicts.current }); } catch {}
    if (!saved) {
      setSyncError("This browser could not save a local copy. Keep this page open until synchronization succeeds.");
    }
  }, []);
  const replace = useCallback((next: DemoState) => { current.current = next; setState(next); }, []);
  const clearIdentity = useCallback(() => {
    scope.current = null; pending.current = false; conflicts.current = []; setSyncConflicts([]); baseline.current = initialDemoState; revision.current = 0;
    setIdentity({ participantId: null, storageScope: null, role: null }); replace(initialDemoState);
  }, [replace]);

  const refresh = useCallback(async () => {
    const requestGeneration = ++generation.current;
    try {
      const response = await fetch("/api/participant-state", { cache: "no-store" });
      const payload = await response.json();
      if (!active.current || requestGeneration !== generation.current) return;
      if (response.status === 401 || payload.mode === "unauthenticated") {
        clearIdentity(); setSyncStatus("unauthenticated"); setSyncError("Sign in again to continue. Unsent work remains separate for its account."); return;
      }
      if (!response.ok) throw new Error(payload.error ?? "Your saved progress could not be loaded.");
      if (payload.mode === "demo") {
        let stored = initialDemoState;
        try { stored = readScopedState(window.localStorage, "demo")?.state ?? loadDemoState(window.localStorage); } catch {}
        const next = scope.current === "demo" ? current.current : stored;
        scope.current = "demo"; conflicts.current = []; setSyncConflicts([]); baseline.current = next; revision.current = 0; pending.current = false;
        setIdentity({ participantId: null, storageScope: "demo", role: "participant" }); replace(next);
        setSyncStatus("demo"); setSyncError(null); cache(); return;
      }
      if (payload.mode !== "supabase" || typeof payload.participantId !== "string" || !payload.state || !Number.isSafeInteger(payload.revision)) {
        clearIdentity(); throw new Error("Connected progress is unavailable. Please sign in again.");
      }
      const nextScope = `participant:${payload.participantId}`;
      let cached: Pick<CachedParticipantState, "state" | "baseline" | "pending" | "conflicts"> | null = scope.current === nextScope ? { state: current.current, baseline: baseline.current, pending: pending.current, conflicts: conflicts.current } : null;
      if (!cached) { try { cached = readScopedState(window.localStorage, nextScope); } catch {} }
      const merged = cached?.pending ? mergeParticipantStates(cached.baseline, cached.state, payload.state) : { state: payload.state, conflicts: [] };
      const next = merged.state;
      conflicts.current = [...new Map([...(cached?.conflicts ?? []), ...merged.conflicts].map(item => [item.id, item])).values()]; setSyncConflicts(conflicts.current);
      scope.current = nextScope; baseline.current = payload.state; revision.current = payload.revision;
      pending.current = !sameState(next, payload.state);
      setIdentity({ participantId: payload.participantId, storageScope: nextScope, role: payload.role ?? "participant" });
      replace(next); setSyncStatus(conflicts.current.length ? "conflict" : pending.current ? "saving" : "saved"); setSyncError(null); cache();
    } catch (error) {
      if (active.current && requestGeneration === generation.current) {
        setSyncStatus(navigator.onLine === false ? "offline" : "error");
        setSyncError(error instanceof Error ? error.message : "Progress could not be loaded. Please retry.");
      }
    } finally { if (active.current && requestGeneration === generation.current) { setHydrated(true); setValidatedPath(pathname); } }
  }, [cache, clearIdentity, replace, pathname]);

  const synchronize = useCallback(async () => {
    const requestScope = scope.current;
    if (conflicts.current.length || !pending.current || saving.current || !requestScope?.startsWith("participant:")) return;
    if (!navigator.onLine) { setSyncStatus("offline"); return; }
    saving.current = true;
    const snapshot = current.current;
    const expectedRevision = revision.current;
    setSyncStatus("saving"); setSyncError(null);
    try {
      const response = await fetch("/api/participant-state", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: requestScope.slice("participant:".length), revision: expectedRevision, state: snapshot }),
      });
      const payload = await response.json();
      if (!active.current || scope.current !== requestScope) return;
      if (response.status === 401 || payload.mode === "account_changed" || payload.mode === "demo") {
        clearIdentity(); await refresh(); return;
      }
      if (response.status === 409 && payload.conflict) { await refresh(); return; }
      if (!response.ok || !payload.saved || !payload.state || !Number.isSafeInteger(payload.revision)) throw new Error(payload.error ?? "Your progress could not be synchronized.");
      const merged = sameState(snapshot, current.current) ? { state: payload.state, conflicts: [] } : mergeParticipantStates(snapshot, current.current, payload.state);
      const next = merged.state; conflicts.current = merged.conflicts; setSyncConflicts(conflicts.current);
      baseline.current = payload.state; revision.current = payload.revision; pending.current = !sameState(next, payload.state);
      replace(next); setSyncStatus(conflicts.current.length ? "conflict" : pending.current ? "saving" : "saved"); cache();
    } catch (error) {
      if (active.current && scope.current === requestScope) {
        setSyncStatus(navigator.onLine ? "error" : "offline");
        setSyncError(error instanceof Error ? error.message : "Your work is saved on this device. Retry synchronization."); cache();
      }
    } finally { saving.current = false; }
  }, [cache, clearIdentity, refresh, replace]);

  const retrySync = useCallback(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    active.current = true;
    const initialRefresh = window.setTimeout(() => { void refresh(); }, 0);
    const offline = () => setSyncStatus(scope.current === "demo" ? "demo" : "offline");
    const resume = () => { if (document.visibilityState !== "hidden") void refresh(); };
    window.addEventListener("online", retrySync); window.addEventListener("offline", offline);
    window.addEventListener("promptshala:signout", clearIdentity);
    window.addEventListener("storage", resume); document.addEventListener("visibilitychange", resume);
    return () => { active.current = false; generation.current += 1;
      window.clearTimeout(initialRefresh);
      window.removeEventListener("online", retrySync); window.removeEventListener("offline", offline);
      window.removeEventListener("promptshala:signout", clearIdentity);
      window.removeEventListener("storage", resume); document.removeEventListener("visibilitychange", resume); };
  }, [refresh, retrySync, clearIdentity, pathname]);

  useEffect(() => {
    document.documentElement.dataset.largeText = String(state.largerText);
    document.documentElement.dataset.reduceMotion = String(state.reducedMotion);
    if (!hydrated || !pending.current) return;
    const timeout = window.setTimeout(() => { void synchronize(); }, 450);
    return () => window.clearTimeout(timeout);
  }, [hydrated, state, synchronize]);

  const updateState = useCallback((updater: (currentState: DemoState) => DemoState) => {
    if (!scope.current) return;
    const next = updater(current.current); pending.current = scope.current !== "demo";
    replace(next); cache();
    setSyncStatus(conflicts.current.length ? "conflict" : scope.current === "demo" ? "demo" : navigator.onLine ? "saving" : "offline");
  }, [cache, replace]);
  const resolveSyncConflict = useCallback((id: string, choice: "local" | "remote") => {
    const conflict = conflicts.current.find(item => item.id === id);
    if (!conflict) return;
    const next = choice === "local" ? current.current : resolveAssistantConflict(current.current, conflict, choice);
    conflicts.current = conflicts.current.filter(item => item.id !== id); setSyncConflicts(conflicts.current);
    pending.current = !sameState(next, baseline.current); replace(next); cache();
    setSyncStatus(conflicts.current.length ? "conflict" : pending.current ? "saving" : "saved");
  }, [replace, cache]);
  const resetDemo = useCallback(() => {
    if (scope.current !== "demo") return;
    try { window.localStorage.removeItem("promptshala:presentation-state:v1"); } catch {}
    baseline.current = initialDemoState; pending.current = false; replace(initialDemoState); cache();
  }, [cache, replace]);
  const saveProfile = useCallback((input: ProfileInput) => updateState((value) => ({ ...value, ...input })), [updateState]);
  const saveGoals = useCallback((input: GoalsInput) => updateState((value) => ({ ...value, ...input, onboardingCompleted: true })), [updateState]);
  const setSafeUseAccepted = useCallback((accepted: boolean) => updateState((value) => ({ ...value, safeUseAccepted: accepted })), [updateState]);
  const completeLesson = useCallback((slug: string) => updateState((value) => ({ ...value, completedLessonSlugs: [...new Set([...value.completedLessonSlugs, slug])] })), [updateState]);
  const completeModuleLesson = useCallback((module: 2 | 3 | 4, id: string) => {
    const key = module === 2 ? "moduleTwoCompletedLessonIds" : module === 3 ? "moduleThreeCompletedLessonIds" : "moduleFourCompletedLessonIds";
    updateState((value) => ({ ...value, [key]: [...new Set([...value[key], id])] }));
  }, [updateState]);
  const recordQuizAttempt = useCallback((attempt: QuizAttempt) => updateState((value) => ({ ...value, quizAttempts: [...value.quizAttempts, { ...attempt, id: crypto.randomUUID() }] })), [updateState]);
  const recordModuleQuizAttempt = useCallback((module: 2 | 3 | 4, attempt: QuizAttempt) => {
    const key = module === 2 ? "moduleTwoQuizAttempts" : module === 3 ? "moduleThreeQuizAttempts" : "moduleFourQuizAttempts";
    updateState((value) => ({ ...value, [key]: [...value[key], { ...attempt, id: crypto.randomUUID() }] }));
  }, [updateState]);

  const value = useMemo(() => ({ hydrated: hydrated && validatedPath === pathname, isPresentationDemo: identity.storageScope === "demo", state, syncStatus, syncError, retrySync, syncConflicts, resolveSyncConflict,
    ...identity, resetDemo, updateState, saveProfile, saveGoals, setSafeUseAccepted, completeLesson, completeModuleLesson, recordQuizAttempt, recordModuleQuizAttempt }),
  [hydrated, validatedPath, pathname, identity, state, syncStatus, syncError, retrySync, syncConflicts, resolveSyncConflict, resetDemo, updateState, saveProfile, saveGoals, setSafeUseAccepted, completeLesson, completeModuleLesson, recordQuizAttempt, recordModuleQuizAttempt]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider.");
  return context;
}
