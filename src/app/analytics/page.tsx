"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

const ChartPlaceholder = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-[300px] w-full rounded-lg" />
  </div>
);

const CategoryPieChart = dynamic(
  () => import("@/components/charts/CategoryPieChart").then((m) => m.CategoryPieChart),
  { ssr: false, loading: ChartPlaceholder }
);

const MonthlyBarChart = dynamic(
  () => import("@/components/charts/MonthlyBarChart").then((m) => m.MonthlyBarChart),
  { ssr: false, loading: ChartPlaceholder }
);

const SpendingTrendChart = dynamic(
  () => import("@/components/charts/SpendingTrendChart").then((m) => m.SpendingTrendChart),
  { ssr: false, loading: ChartPlaceholder }
);

export default function AnalyticsPage() {
  const transactions = useStore((s) => s.transactions);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Analytics</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Visualize your financial data</p>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No data to analyze"
          description="Add some transactions to see charts and insights"
          action={{ label: "Add Transaction", onClick: () => router.push("/transactions") }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Category-wise Expenses</h2>
              <CategoryPieChart />
            </Card>
            <Card>
              <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Monthly Overview</h2>
              <MonthlyBarChart />
            </Card>
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Spending Trend</h2>
            <SpendingTrendChart />
          </Card>
        </>
      )}
    </div>
  );
}
