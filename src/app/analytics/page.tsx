"use client";

import { Card } from "@/components/ui/Card";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { MonthlyBarChart } from "@/components/charts/MonthlyBarChart";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Analytics</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Visualize your financial data</p>
      </div>

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
    </div>
  );
}
