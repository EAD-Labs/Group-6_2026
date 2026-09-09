"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  type AiFamiliarity,
  type DemoState,
  initialDemoState,
  loadDemoState,
  type QuizAttempt,
  saveDemoState,
  type TeachingLevel,
} from "./demo-state";

type ProfileInput = {
  displayName: string;
  institution: string;
  primarySubject: string;
  teachingLevel: TeachingLevel;
  yearsTeaching: string;
};

type GoalsInput = {
  aiFamiliarity: AiFamiliarity;
  goals: string[];
};

type DemoContextValue = {
  hydrated: boolean;
  resetDemo: () => void;
  state: DemoState;
  updateState: (updater: (currentState: DemoState) => DemoState) => void;
  saveGoals: (input: GoalsInput) => void;
  saveProfile: (input: ProfileInput) => void;
  setSafeUseAccepted: (accepted: boolean) => void;
  completeLesson: (lessonSlug: string) => void;
  recordQuizAttempt: (attempt: QuizAttempt) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);
const subscribeToHydration = () => () => undefined;

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() =>
    typeof window === "undefined"
      ? initialDemoState
      : loadDemoState(window.localStorage),
  );
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const persistenceMode = useRef<
    "checking" | "demo" | "supabase" | "unavailable" | "unauthenticated"
  >("checking");

  useEffect(() => {
    if (!hydrated || typeof fetch === "undefined") {
      return;
    }

    let cancelled = false;

    async function loadServerState() {
      try {
        const response = await fetch("/api/participant-state", {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          mode?: typeof persistenceMode.current;
          state?: DemoState;
        };

        if (cancelled) {
          return;
        }

        persistenceMode.current = payload.mode ?? "unavailable";
        if (payload.mode === "supabase" && payload.state) {
          setState(payload.state);
        }
      } catch {
        persistenceMode.current = "unavailable";
      }
    }

    void loadServerState();
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveDemoState(window.localStorage, state);
    document.documentElement.dataset.largeText = String(state.largerText);
    document.documentElement.dataset.reduceMotion = String(state.reducedMotion);
  }, [hydrated, state]);

  useEffect(() => {
    if (
      !hydrated ||
      persistenceMode.current !== "supabase" ||
      typeof fetch === "undefined"
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetch("/api/participant-state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      }).catch(() => undefined);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [hydrated, state]);

  const updateState = useCallback(
    (updater: (currentState: DemoState) => DemoState) => {
      setState((currentState) => updater(currentState));
    },
    [],
  );

  const resetDemo = useCallback(() => {
    setState(initialDemoState);
    window.localStorage.removeItem("promptshala:presentation-state:v1");
  }, []);

  const setSafeUseAccepted = useCallback((accepted: boolean) => {
    setState((currentState) => ({
      ...currentState,
      safeUseAccepted: accepted,
    }));
  }, []);

  const saveProfile = useCallback((input: ProfileInput) => {
    setState((currentState) => ({ ...currentState, ...input }));
  }, []);

  const saveGoals = useCallback((input: GoalsInput) => {
    setState((currentState) => ({
      ...currentState,
      ...input,
      onboardingCompleted: true,
    }));
  }, []);

  const completeLesson = useCallback((lessonSlug: string) => {
    setState((currentState) => ({
      ...currentState,
      completedLessonSlugs: currentState.completedLessonSlugs.includes(lessonSlug)
        ? currentState.completedLessonSlugs
        : [...currentState.completedLessonSlugs, lessonSlug],
    }));
  }, []);

  const recordQuizAttempt = useCallback((attempt: QuizAttempt) => {
    setState((currentState) => ({
      ...currentState,
      quizAttempts: [...currentState.quizAttempts, attempt],
    }));
  }, []);

  const value = useMemo(
    () => ({
      completeLesson,
      hydrated,
      recordQuizAttempt,
      resetDemo,
      saveGoals,
      saveProfile,
      setSafeUseAccepted,
      state,
      updateState,
    }),
    [
      completeLesson,
      hydrated,
      recordQuizAttempt,
      resetDemo,
      saveGoals,
      saveProfile,
      setSafeUseAccepted,
      state,
      updateState,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);

  if (!context) {
    throw new Error("useDemo must be used inside DemoProvider.");
  }

  return context;
}
