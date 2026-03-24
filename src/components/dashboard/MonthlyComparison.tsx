"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import {
  formatCurrency,
  getThisMonthTransactions,
  getLastMonthTransactions,
  getTotalExpense,
  getTotalIncome,
  getPercentChange,
} from "@/utils";

function ChangeIndicator({ change, invert }: { change: number | null; invert?: boolean }) {
  if (change === null) return <span className="text-xs text-[var(--muted-foreground)]">N/A</span>;
  const isUp = change > 0;
  const color = invert
    ? (isUp ? "var(--success)" : "var(--destructive)")
    : (isUp ? "var(--destructive)" : "var(--success)");
  return (
    <span className="flex items-center gap-1 text-xs font-medium" style={{ color }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        {isUp ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
      </svg>
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export function MonthlyComparison() {
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);

  const items = useMemo(() => {
    const thisMonthTx = getThisMonthTransactions(transactions);
    const lastMonthTx = getLastMonthTransactions(transactions);
    return [
      {
        label: "Expense",
        current: getTotalExpense(thisMonthTx),
        previous: getTotalExpense(lastMonthTx),
        color: "var(--destructive)",
        invert: false,
      },
      {
        label: "Income",
        current: getTotalIncome(thisMonthTx),
        previous: getTotalIncome(lastMonthTx),
        color: "var(--success)",
        invert: true,
      },
    ];
  }, [transactions]);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Month vs Last Month</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--card-foreground)]">{item.label}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Last: {formatCurrency(item.previous, currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: item.color }}>
                {formatCurrency(item.current, currency)}
              </p>
              <ChangeIndicator change={getPercentChange(item.current, item.previous)} invert={item.invert} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
