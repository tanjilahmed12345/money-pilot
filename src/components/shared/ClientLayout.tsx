"use client";

import { ThemeProvider } from "./ThemeProvider";
import { Sidebar } from "./Sidebar";
import { useHydration } from "@/hooks/useHydration";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Sidebar />
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </ThemeProvider>
  );
}
