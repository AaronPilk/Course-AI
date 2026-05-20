// Client-side points system. All state lives in localStorage for now —
// when we wire real user accounts, this becomes the API surface that
// reads/writes to the database instead. The widget code doesn't change.

const STORAGE_KEY = "cf:points";

export type PointEventType =
  | "lesson_complete"
  | "lesson_quiz_passed"
  | "lesson_quiz_completed"
  | "module_quiz_completed"
  | "course_complete";

export interface PointEvent {
  id: string;          // stable dedup key, e.g. "lesson_complete:slug:0:0"
  type: PointEventType;
  points: number;
  label: string;
  awardedAt: number;
}

export interface PointsState {
  total: number;
  events: PointEvent[];
}

export const POINT_VALUES = {
  lesson_complete: 10,
  lesson_quiz_passed: 15,
  lesson_quiz_completed: 5,        // even if not perfect
  module_quiz_perfect: 50,
  module_quiz_per_correct: 10,
  course_complete: 200,
} as const;

export const LEVEL_THRESHOLDS = [
  0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000,
];

export function levelFromPoints(total: number): {
  level: number;
  current: number;
  needed: number;
  nextThreshold: number;
} {
  let level = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (total >= LEVEL_THRESHOLDS[i]) level = i;
  }
  const nextThreshold =
    LEVEL_THRESHOLDS[level + 1] ??
    LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000;
  const base = LEVEL_THRESHOLDS[level];
  return {
    level,
    current: total - base,
    needed: nextThreshold - base,
    nextThreshold,
  };
}

function readState(): PointsState {
  if (typeof window === "undefined") return { total: 0, events: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { total: 0, events: [] };
    const parsed = JSON.parse(raw);
    if (typeof parsed.total === "number" && Array.isArray(parsed.events)) {
      return parsed;
    }
    return { total: 0, events: [] };
  } catch {
    return { total: 0, events: [] };
  }
}

function writeState(state: PointsState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("cf:points-updated", { detail: state }));
  } catch {
    // ignore
  }
}

/**
 * Award points for a uniquely-identified event. Idempotent — if the
 * event id already exists, this is a no-op (returns false). Otherwise
 * it appends the event and updates the total (returns true with the
 * awarded amount).
 */
export function awardPoints(event: Omit<PointEvent, "awardedAt">): {
  awarded: boolean;
  newTotal: number;
  delta: number;
} {
  const state = readState();
  if (state.events.some((e) => e.id === event.id)) {
    return { awarded: false, newTotal: state.total, delta: 0 };
  }
  const full: PointEvent = { ...event, awardedAt: Date.now() };
  const next: PointsState = {
    total: state.total + event.points,
    events: [...state.events, full],
  };
  writeState(next);
  return { awarded: true, newTotal: next.total, delta: event.points };
}

/** Remove a previously-awarded event (used when un-marking a lesson). */
export function revokePoints(eventId: string): { newTotal: number; delta: number } {
  const state = readState();
  const event = state.events.find((e) => e.id === eventId);
  if (!event) return { newTotal: state.total, delta: 0 };
  const next: PointsState = {
    total: Math.max(0, state.total - event.points),
    events: state.events.filter((e) => e.id !== eventId),
  };
  writeState(next);
  return { newTotal: next.total, delta: -event.points };
}

export function getPointsState(): PointsState {
  return readState();
}

export function resetPoints() {
  writeState({ total: 0, events: [] });
}

// ─── React hook ─────────────────────────────────────────────────────

import { useEffect, useState } from "react";

export function usePointsState(): PointsState {
  const [state, setState] = useState<PointsState>({ total: 0, events: [] });

  useEffect(() => {
    setState(readState());
    function onUpdate() {
      setState(readState());
    }
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) onUpdate();
    }
    window.addEventListener("cf:points-updated" as never, onUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("cf:points-updated" as never, onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return state;
}
