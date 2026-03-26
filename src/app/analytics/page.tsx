"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils";
import { detectAnomalies } from "@/lib/anomaly";

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

const CategoryTrendsChart = dynamic(
  () => import("@/components/charts/CategoryTrendsChart").then((m) => m.CategoryTrendsChart),
  { ssr: false, loading: ChartPlaceholder }
);

type Tab = "overview" | "trends";

export default function AnalyticsPage() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  const anomalies = useMemo(
    () => detectAnomalies(transactions, categories),
    [transactions, categories]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Analytics</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Visualize your financial data</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {(["overview", "trends"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {t === "overview" ? "Overview" : "Trends"}
          </button>
        ))}
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No data to analyze"
          description="Add some transactions to see charts and insights"
          action={{ label: "Add Transaction", onClick: () => router.push("/transactions") }}
        />
      ) : tab === "overview" ? (
        <>
          {/* Anomaly alerts */}
          {anomalies.length > 0 && (
            <Card id="spending-anomalies">
              <h2 className="text-sm font-semibold text-[var(--warning)] uppercase mb-3">
                Spending Anomalies This Month
              </h2>
              <div className="space-y-2">
                {anomalies.map((a) => (
                  <div key={a.categoryId} className="flex items-center justify-between rounded-lg bg-[var(--warning)]/5 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span>{a.categoryIcon}</span>
                      <span className="text-sm font-medium text-[var(--card-foreground)]">{a.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[var(--card-foreground)] tabular-nums">
                          {formatCurrency(a.currentSpend, currency)}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] tabular-nums">
                          avg {formatCurrency(a.avgSpend, currency)}
                        </p>
                      </div>
                      <Badge color="#f59e0b">+{a.percentAbove.toFixed(0)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card id="category-expenses">
              <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">Category-wise Expenses</h2>
              <CategoryPieChart />
            </Card>
            <Card id="monthly-overview">
              <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Monthly Overview</h2>
              <MonthlyBarChart />
            </Card>
          </div>

          <Card id="spending-trend">
            <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Spending Trend</h2>
            <SpendingTrendChart />
          </Card>
        </>
      ) : (
        <>
          {/* Trends tab */}
          <Card id="category-trends">
            <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
              Category Spending Trends (12 Months)
            </h2>
            <CategoryTrendsChart />
          </Card>

          {/* Anomaly detail table */}
          {anomalies.length > 0 && (
            <Card id="categories-above-avg">
              <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
                Categories Above Average
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Categories where this month&apos;s spending exceeds the 3-month average by more than 30%
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="px-3 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Category</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">This Month</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">3-Mo Avg</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">Difference</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">% Above</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalies.map((a) => (
                      <tr key={a.categoryId} className="border-b border-[var(--border)]">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span>{a.categoryIcon}</span>
                            <span className="font-medium text-[var(--card-foreground)]">{a.categoryName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-[var(--card-foreground)]">
                          {formatCurrency(a.currentSpend, currency)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-[var(--muted-foreground)]">
                          {formatCurrency(a.avgSpend, currency)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-[var(--destructive)]">
                          +{formatCurrency(a.currentSpend - a.avgSpend, currency)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Badge color="#f59e0b">+{a.percentAbove.toFixed(0)}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
