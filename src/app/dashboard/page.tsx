"use client";

import dynamic from "next/dynamic";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { MonthlyComparison } from "@/components/dashboard/MonthlyComparison";
import { TopSpending } from "@/components/dashboard/TopSpending";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { BudgetAlerts } from "@/components/dashboard/BudgetAlerts";
import { SpendingAnomalyAlerts } from "@/components/dashboard/SpendingAnomalyAlerts";
import { AiSpendingSummary } from "@/components/dashboard/AiSpendingSummary";
import { ChartSkeleton } from "@/components/ui/Skeleton";

const SpendingBreakdown = dynamic(
  () => import("@/components/dashboard/SpendingBreakdown").then((m) => m.SpendingBreakdown),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Your financial overview</p>
      </div>
      <div id="budget-alerts"><BudgetAlerts /></div>
      <div id="spending-anomalies"><SpendingAnomalyAlerts /></div>
      <div id="stat-cards"><StatCards /></div>
      <div id="stats-bar"><StatsBar /></div>
      <div id="recent-transactions" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentTransactions />
        <div className="space-y-6">
          <div id="month-comparison"><MonthlyComparison /></div>
          <div id="top-spending"><TopSpending /></div>
        </div>
      </div>
      <div id="ai-insight"><AiSpendingSummary /></div>
      <div id="spending-breakdown"><SpendingBreakdown /></div>
    </div>
  );
}
