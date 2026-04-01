"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store";

/**
 * Triggers a one-time fetch from the database to populate the store.
 * Falls back gracefully to local data if the API is unreachable
 * (e.g., no DATABASE_URL configured).
 */
export function useDbHydration() {
  const hydrateFromDb = useStore((s) => s.hydrateFromDb);
  const dbHydrated = useStore((s) => s._dbHydrated);
  const called = useRef(false);

  useEffect(() => {
    if (!called.current && !dbHydrated) {
      called.current = true;
      hydrateFromDb();
    }
  }, [hydrateFromDb, dbHydrated]);

  return dbHydrated;
}
