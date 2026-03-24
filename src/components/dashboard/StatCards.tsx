"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { Card, CardTitle, CardValue } from "@/components/ui/Card";
import { formatCurrency, getTotalIncome, getTotalExpense, getThisMonthExpense } from "@/utils";

export function StatCards() {
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);

  const stats = useMemo(() => {
    const income = getTotalIncome(transactions);
    const expense = getTotalExpense(transactions);
    const balance = income - expense;
    const monthExpense = getThisMonthExpense(transactions);
    return [
      { title: "Total Balance", value: balance, color: balance >= 0 ? "var(--success)" : "var(--destructive)", icon: "💳" },
      { title: "Total Income", value: income, color: "var(--success)", icon: "📈" },
      { title: "Total Expense", value: expense, color: "var(--destructive)", icon: "📉" },
      { title: "This Month Expense", value: monthExpense, color: "var(--warning)", icon: "📅" },
    ];
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <div className="flex items-center justify-between">
            <CardTitle>{stat.title}</CardTitle>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <CardValue className="mt-3">
            <span style={{ color: stat.color }}>{formatCurrency(stat.value, currency)}</span>
          </CardValue>
        </Card>
      ))}
    </div>
  );
}
