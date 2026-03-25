"use client";

import { useMemo } from "react";
import { useShallowStore } from "@/hooks/useShallowStore";
import { Card, CardTitle, CardValue } from "@/components/ui/Card";
import {
  formatCurrency,
  getTotalIncome,
  getTotalExpense,
  getMonthlyIncome,
  getLastMonthIncome,
  getThisMonthExpense,
  getLastMonthExpense,
  getSavingsRate,
  getPercentChange,
} from "@/utils";

interface StatCardData {
  title: string;
  value: string;
  icon: string;
  change: number | null;
  invertDirection?: boolean;
}

function ChangeBadge({ change, invert }: { change: number | null; invert?: boolean }) {
  if (change === null) return null;

  const isPositive = change > 0;
  const isBetter = invert ? !isPositive : isPositive;
  const color = change === 0 ? "var(--muted-foreground)" : isBetter ? "var(--success)" : "var(--destructive)";
  const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";

  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ color, backgroundColor: `${color}15` }}
    >
      {arrow} {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export function StatCards() {
  const { transactions, currency } = useShallowStore((s) => ({
    transactions: s.transactions,
    currency: s.settings.currency,
  }));

  const stats = useMemo(() => {
    const totalIncome = getTotalIncome(transactions);
    const totalExpense = getTotalExpense(transactions);
    const balance = totalIncome - totalExpense;

    const monthIncome = getMonthlyIncome(transactions);
    const monthExpense = getThisMonthExpense(transactions);
    const lastIncome = getLastMonthIncome(transactions);
    const lastExpense = getLastMonthExpense(transactions);

    const savingsRate = getSavingsRate(monthIncome, monthExpense);
    const lastSavingsRate = getSavingsRate(lastIncome, lastExpense);

    // Balance change: compare this month's net vs last month's net
    const thisMonthNet = monthIncome - monthExpense;
    const lastMonthNet = lastIncome - lastExpense;
    const balanceChange = getPercentChange(thisMonthNet, lastMonthNet);

    return [
      {
        title: "Total Balance",
        value: formatCurrency(balance, currency),
        icon: "💳",
        change: balanceChange,
      },
      {
        title: "Monthly Income",
        value: formatCurrency(monthIncome, currency),
        icon: "📈",
        change: getPercentChange(monthIncome, lastIncome),
      },
      {
        title: "Monthly Expenses",
        value: formatCurrency(monthExpense, currency),
        icon: "📉",
        change: getPercentChange(monthExpense, lastExpense),
        invertDirection: true,
      },
      {
        title: "Savings Rate",
        value: `${savingsRate.toFixed(1)}%`,
        icon: "🏦",
        change: getPercentChange(savingsRate, lastSavingsRate),
      },
    ] satisfies StatCardData[];
  }, [transactions, currency]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <div className="flex items-center justify-between">
            <CardTitle>{stat.title}</CardTitle>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <CardValue>{stat.value}</CardValue>
            <ChangeBadge change={stat.change} invert={stat.invertDirection} />
          </div>
          {stat.change !== null && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">vs last month</p>
          )}
        </Card>
      ))}
    </div>
  );
}
