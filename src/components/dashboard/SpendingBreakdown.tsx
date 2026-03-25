"use client";

import { useState, useMemo } from "react";
import { useShallowStore } from "@/hooks/useShallowStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate, getCurrentMonth, getMonthName } from "@/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SliceData {
  catId: string;
  name: string;
  icon: string;
  value: number;
  color: string;
  percent: number;
}

export function SpendingBreakdown() {
  const { transactions, categories, currency } = useShallowStore((s) => ({
    transactions: s.transactions,
    categories: s.categories,
    currency: s.settings.currency,
  }));

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [drillCat, setDrillCat] = useState<SliceData | null>(null);

  const yearMonth = `${year}-${String(month).padStart(2, "0")}`;
  const monthLabel = getMonthName(yearMonth);

  const prev = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const next = () => {
    const current = getCurrentMonth();
    const nextMonth = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
    if (nextMonth > current) return;
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const { data, total } = useMemo(() => {
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
    const expenses: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(yearMonth))
      .forEach((t) => {
        expenses[t.category] = (expenses[t.category] || 0) + t.amount;
      });

    const total = Object.values(expenses).reduce((s, v) => s + v, 0);
    const data: SliceData[] = Object.entries(expenses)
      .map(([catId, amount]) => ({
        catId,
        name: catMap[catId]?.name || catId,
        icon: catMap[catId]?.icon || "📦",
        value: amount,
        color: catMap[catId]?.color || "#6b7280",
        percent: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return { data, total };
  }, [transactions, categories, yearMonth]);

  const drillTransactions = useMemo(() => {
    if (!drillCat) return [];
    return transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(yearMonth) && t.category === drillCat.catId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [drillCat, transactions, yearMonth]);

  const isCurrentMonth = yearMonth === getCurrentMonth();

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--card-foreground)]">Spending Breakdown</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={prev}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Button>
          <span className="text-sm font-medium text-[var(--card-foreground)] min-w-[120px] text-center">
            {monthLabel}
          </span>
          <Button variant="ghost" size="sm" onClick={next} disabled={isCurrentMonth}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Button>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState icon="📊" title="No expenses this month" description="Expenses for this month will appear here" />
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={false}
                  onClick={(_, index) => setDrillCat(data[index])}
                  className="cursor-pointer"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${currency}${Number(value).toFixed(2)}`, "Amount"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--card-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center total */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs text-[var(--muted-foreground)]">Total</p>
                <p className="text-lg font-bold text-[var(--card-foreground)]">
                  {formatCurrency(total, currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {data.map((d) => (
              <button
                key={d.catId}
                onClick={() => setDrillCat(d)}
                className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--accent)]/50"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                    style={{ backgroundColor: `${d.color}15` }}
                  >
                    {d.icon}
                  </div>
                  <span className="text-sm font-medium text-[var(--card-foreground)]">{d.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--card-foreground)]">
                    {formatCurrency(d.value, currency)}
                  </span>
                  <Badge color={d.color}>{d.percent.toFixed(0)}%</Badge>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Drill-down modal */}
      <Modal
        open={!!drillCat}
        onClose={() => setDrillCat(null)}
        title={drillCat ? `${drillCat.icon} ${drillCat.name} — ${monthLabel}` : ""}
      >
        {drillCat && (
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border)]">
              <span className="text-sm text-[var(--muted-foreground)]">
                {drillTransactions.length} transaction{drillTransactions.length !== 1 ? "s" : ""}
              </span>
              <span className="text-sm font-bold" style={{ color: drillCat.color }}>
                {formatCurrency(drillCat.value, currency)}
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {drillTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--card-foreground)]">{t.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{formatDate(t.date)}</p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--destructive)]">
                    -{formatCurrency(t.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
