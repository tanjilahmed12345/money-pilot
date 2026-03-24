"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { formatCurrency, getTopCategories, getThisMonthTransactions, getTotalExpense } from "@/utils";

export function TopSpending() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);

  const { top, totalMonthExpense, catMap } = useMemo(() => {
    const monthTx = getThisMonthTransactions(transactions);
    return {
      top: getTopCategories(monthTx, 5),
      totalMonthExpense: getTotalExpense(monthTx),
      catMap: Object.fromEntries(categories.map((c) => [c.id, c])),
    };
  }, [transactions, categories]);

  if (top.length === 0) return null;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Top Spending (This Month)</h2>
      <div className="space-y-3">
        {top.map(({ categoryId, amount }) => {
          const cat = catMap[categoryId];
          const pct = totalMonthExpense > 0 ? (amount / totalMonthExpense) * 100 : 0;
          return (
            <div key={categoryId}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{cat?.icon || "📦"}</span>
                  <span className="text-sm font-medium text-[var(--card-foreground)]">
                    {cat?.name || categoryId}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-[var(--card-foreground)]">
                    {formatCurrency(amount, currency)}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] ml-2">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-[var(--secondary)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: cat?.color || "#6b7280" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
