"use client";

// Tiny global store for the Sorting Hat modal so any component
// (Hero CTA, InlineStep1, BarakBlock, sticky CTA, exit-intent) can
// open it and pre-seed the vertical without prop-drilling.

import { useSyncExternalStore } from "react";
import type { BusinessType } from "@/lib/funnel/types";

interface State {
  open: boolean;
  initialBusinessType: BusinessType | null;
}

// React requires the server snapshot to keep the same identity between reads.
const SERVER_STATE: State = { open: false, initialBusinessType: null };
let state: State = SERVER_STATE;
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function emit() {
  for (const l of listeners) l();
}

export function openSortingHat(opts: { initialBusinessType?: BusinessType | null } = {}) {
  state = { open: true, initialBusinessType: opts.initialBusinessType ?? null };
  emit();
}

export function closeSortingHat() {
  state = { open: false, initialBusinessType: null };
  emit();
}

export function useSortingHatModal(): State & {
  open: boolean;
  initialBusinessType: BusinessType | null;
  setOpen: (next: boolean) => void;
} {
  const snap = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
  return {
    ...snap,
    setOpen: (next: boolean) => {
      if (next) {
        state = { ...state, open: true };
      } else {
        state = { open: false, initialBusinessType: null };
      }
      emit();
    },
  };
}
