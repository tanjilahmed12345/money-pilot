"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { getMonthlyData, getMonthName } from "@/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function MonthlyBarChart() {
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);

  const data = useMemo(
    () => getMonthlyData(transactions).map((d) => ({ ...d, name: getMonthName(d.month) })),
    [transactions]
  );

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-[var(--muted-foreground)]">No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
        <Tooltip
          formatter={(value) => [`${currency}${Number(value).toFixed(2)}`]}
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--card-foreground)",
          }}
        />
        <Legend />
        <Bar dataKey="income" fill="var(--success)" name="Income" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        <Bar dataKey="expense" fill="var(--destructive)" name="Expense" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
