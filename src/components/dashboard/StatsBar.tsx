"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { formatCurrency, getStats } from "@/utils";

export function StatsBar() {
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);
  const stats = getStats(transactions);

  const items = [
    {
      label: "Total Transactions",
      value: String(stats.totalTransactions),
      icon: "📊",
    },
    {
      label: "Avg. Daily Spend",
      value: formatCurrency(stats.avgDailySpend, currency),
      icon: "📅",
    },
    {
      label: "Projected Monthly",
      value: formatCurrency(stats.projectedMonthly, currency),
      icon: "📈",
    },
    {
      label: "Highest Expense",
      value: stats.highestExpense
        ? formatCurrency(stats.highestExpense.amount, currency)
        : "N/A",
      sub: stats.highestExpense?.title,
      icon: "🔥",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs text-[var(--muted-foreground)]">{item.label}</span>
          </div>
          <p className="text-base font-bold text-[var(--card-foreground)]">{item.value}</p>
          {item.sub && (
            <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{item.sub}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
