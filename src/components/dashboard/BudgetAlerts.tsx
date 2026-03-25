"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { formatCurrency, getCurrentMonth, getThisMonthTransactions } from "@/utils";
import Link from "next/link";

export function BudgetAlerts() {
  const transactions = useStore((s) => s.transactions);
  const budgets = useStore((s) => s.budgets);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);

  const alerts = useMemo(() => {
    const currentMonth = getCurrentMonth();
    const monthBudgets = budgets.filter((b) => b.month === currentMonth);
    if (monthBudgets.length === 0) return [];

    const monthTx = getThisMonthTransactions(transactions);
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    return monthBudgets
      .map((b) => {
        const spent = b.category === "overall"
          ? monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
          : monthTx.filter((t) => t.type === "expense" && t.category === b.category).reduce((s, t) => s + t.amount, 0);

        const pct = (spent / b.amount) * 100;
        if (pct < 90) return null;

        const cat = b.category === "overall" ? null : catMap[b.category];
        const name = b.category === "overall" ? "Overall" : cat?.name || b.category;
        const icon = b.category === "overall" ? "💳" : cat?.icon || "📦";
        const exceeded = spent >= b.amount;

        return { name, icon, spent, budget: b.amount, pct, exceeded };
      })
      .filter(Boolean) as { name: string; icon: string; spent: number; budget: number; pct: number; exceeded: boolean }[];
  }, [transactions, budgets, categories]);

  if (alerts.length === 0) return null;

  const exceededAlerts = alerts.filter((a) => a.exceeded);
  const warningAlerts = alerts.filter((a) => !a.exceeded);

  return (
    <div className="space-y-2">
      {exceededAlerts.length > 0 && (
        <Link href="/budget" className="block">
          <div className="flex items-start gap-3 rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 px-4 py-3">
            <span className="text-lg mt-0.5">🚨</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--destructive)]">
                {exceededAlerts.length} budget{exceededAlerts.length !== 1 ? "s" : ""} exceeded
              </p>
              <p className="text-xs text-[var(--destructive)]/80 mt-0.5">
                {exceededAlerts.map((a) => `${a.icon} ${a.name} (${formatCurrency(a.spent - a.budget, currency)} over)`).join(" · ")}
              </p>
            </div>
            <svg className="shrink-0 mt-1 text-[var(--destructive)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </Link>
      )}
      {warningAlerts.length > 0 && (
        <Link href="/budget" className="block">
          <div className="flex items-start gap-3 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20 px-4 py-3">
            <span className="text-lg mt-0.5">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--warning)]">
                {warningAlerts.length} budget{warningAlerts.length !== 1 ? "s" : ""} nearing limit
              </p>
              <p className="text-xs text-[var(--warning)]/80 mt-0.5">
                {warningAlerts.map((a) => `${a.icon} ${a.name} (${a.pct.toFixed(0)}%)`).join(" · ")}
              </p>
            </div>
            <svg className="shrink-0 mt-1 text-[var(--warning)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </Link>
      )}
    </div>
  );
}
