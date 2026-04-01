"use client";

import { useState } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useDbHydration } from "@/hooks/useDbHydration";
import { useStore } from "@/store";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { ToastProvider } from "@/components/ui/Toast";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useDbHydration();
  const hydrationError = useStore((s) => s._hydrationError);
  const hydrateFromDb = useStore((s) => s.hydrateFromDb);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!hydrated) {
    return (
      <div className="lg:ml-60 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (hydrationError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--destructive)]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Failed to load data</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{hydrationError}</p>
          <button
            onClick={() => hydrateFromDb()}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <main className="lg:ml-60 min-h-screen pb-20 lg:pb-0">
          <Header onMobileMenuToggle={() => setMobileOpen((o) => !o)} />
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </ToastProvider>
    </ThemeProvider>
  );
}
