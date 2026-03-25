"use client";

import { ThemeProvider } from "./ThemeProvider";
import { Sidebar } from "./Sidebar";
import { useHydration } from "@/hooks/useHydration";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { ToastProvider } from "@/components/ui/Toast";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();

  if (!hydrated) {
    return (
      <div className="lg:ml-64 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <Sidebar />
        <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </ToastProvider>
    </ThemeProvider>
  );
}
