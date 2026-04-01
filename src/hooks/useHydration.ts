"use client";

import { useStore } from "@/store";

// Returns true once the store has been hydrated from the database
export function useHydration() {
  return useStore((s) => s._dbHydrated);
}
