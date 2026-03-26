"use client";

import { useSyncExternalStore } from "react";
import { useStore } from "@/store";

// SSR-safe hydration check using Zustand persist API
// Returns true once the store has loaded from localStorage
// Uses useSyncExternalStore to avoid the double-render (false → true) pattern
export function useHydration() {
  return useSyncExternalStore(
    (onStoreChange) => useStore.persist.onFinishHydration(onStoreChange),
    () => useStore.persist.hasHydrated(),
    () => false // SSR always returns false
  );
}
