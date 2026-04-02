"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { formatCurrency, getStats } from "@/utils";

export function StatsBar() {
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);

  const items = useMemo(() => {
    const stats = getStats(transactions);
    return [
      { label: "Total Transactions", value: String(stats.totalTransactions), icon: "📊", accent: "#06b6d4" },
      { label: "Avg. Daily Spend", value: formatCurrency(stats.avgDailySpend, currency), icon: "📅", accent: "#f59e0b" },
      { label: "Projected Monthly", value: formatCurrency(stats.projectedMonthly, currency), icon: "📈", accent: "#10b981" },
      {
        label: "Highest Expense",
        value: stats.highestExpense ? formatCurrency(stats.highestExpense.amount, currency) : "N/A",
        sub: stats.highestExpense?.title,
        icon: "🔥",
        accent: "#f97316",
      },
    ];
  }, [transactions, currency]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} accent={item.accent} className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base sm:text-lg">{item.icon}</span>
            <span className="text-[10px] sm:text-xs text-[var(--muted-foreground)] truncate">{item.label}</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-[var(--card-foreground)] truncate">{item.value}</p>
          {"sub" in item && item.sub && (
            <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{item.sub}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
