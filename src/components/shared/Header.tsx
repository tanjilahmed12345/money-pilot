"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store";

function useIsDark() {
  const theme = useStore((s) => s.settings.theme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(mql.matches);
      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    setIsDark(theme === "dark");
  }, [theme]);

  return isDark;
}

export function Header() {
  const isDark = useIsDark();
  const setTheme = useStore((s) => s.setTheme);
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <header className="sticky top-0 z-20 flex items-center justify-end px-4 py-3 sm:px-6 lg:px-8 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm">
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        style={{ backgroundColor: isDark ? "var(--primary)" : "var(--muted)" }}
      >
        <span
          className="pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ transform: isDark ? "translateX(22px)" : "translateX(4px)" }}
        >
          {isDark ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </span>
      </button>
    </header>
  );
}
