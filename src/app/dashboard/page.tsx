"use client";

import dynamic from "next/dynamic";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { MonthlyComparison } from "@/components/dashboard/MonthlyComparison";
import { TopSpending } from "@/components/dashboard/TopSpending";
import { StatsBar } from "@/components/dashboard/StatsBar";

const QuickExpenseChart = dynamic(
  () => import("@/components/dashboard/QuickExpenseChart").then((m) => m.QuickExpenseChart),
  { ssr: false, loading: () => <div className="h-[350px] rounded-xl border border-[var(--border)] bg-[var(--card)] animate-pulse" /> }
);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Your financial overview</p>
      </div>
      <StatCards />
      <StatsBar />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentTransactions />
        <div className="space-y-6">
          <MonthlyComparison />
          <TopSpending />
        </div>
      </div>
      <QuickExpenseChart />
    </div>
  );
}
