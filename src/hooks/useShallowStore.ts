"use client";

import { useStore } from "@/store";
import { useShallow } from "zustand/react/shallow";

export function useShallowStore<T>(selector: (state: ReturnType<typeof useStore.getState>) => T): T {
  return useStore(useShallow(selector));
}
