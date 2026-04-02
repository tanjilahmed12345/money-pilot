"use client";

import { useMemo } from "react";
import { useShallowStore } from "@/hooks/useShallowStore";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, getMonthlyData } from "@/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MONTHS_TO_SHOW = 6;

export function CashFlowTrend() {
  const { transactions, currency } = useShallowStore((s) => ({
    transactions: s.transactions,
    currency: s.settings.currency,
  }));

  const chartData = useMemo(() => {
    const all = getMonthlyData(transactions);
    const recent = all.slice(-MONTHS_TO_SHOW);
    return recent.map((d) => ({
      ...d,
      label: new Date(d.month + "-01").toLocaleDateString("en", {
        month: "short",
        year: "2-digit",
      }),
      net: d.income - d.expense,
    }));
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <Card>
        <h2 className="text-base sm:text-lg font-semibold text-[var(--card-foreground)] mb-4">
          Cash Flow Trend
        </h2>
        <EmptyState
          icon="📊"
          title="No data yet"
          description="Income & expense trends will appear here"
        />
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-base sm:text-lg font-semibold text-[var(--card-foreground)] mb-1">
        Cash Flow Trend
      </h2>
      <p className="text-xs text-[var(--muted-foreground)] mb-4">
        Last {chartData.length} months — income vs expenses
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barGap={4} barCategoryGap="20%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
              return String(v);
            }}
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--card-foreground)",
              fontSize: "13px",
            }}
            formatter={(value, name) => [
              formatCurrency(Number(value), currency),
              name === "income" ? "Income" : "Expenses",
            ]}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Mini legend */}
      <div className="flex items-center justify-center gap-5 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
          <span className="text-xs text-[var(--muted-foreground)]">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
          <span className="text-xs text-[var(--muted-foreground)]">Expenses</span>
        </div>
      </div>

      {/* Net summary for latest month */}
      {chartData.length > 0 && (() => {
        const latest = chartData[chartData.length - 1];
        const isPositive = latest.net >= 0;
        return (
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">
              Net this month
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: isPositive ? "var(--success)" : "var(--destructive)" }}
            >
              {isPositive ? "+" : "-"}{formatCurrency(Math.abs(latest.net), currency)}
            </span>
          </div>
        );
      })()}
    </Card>
  );
}
