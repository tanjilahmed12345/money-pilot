"use client";

import { useState } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useDbHydration } from "@/hooks/useDbHydration";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { ToastProvider } from "@/components/ui/Toast";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useDbHydration();
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
