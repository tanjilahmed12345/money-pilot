"use client";

import { useStore } from "@/store";
import { getMonthlyData, getMonthName } from "@/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function SpendingTrendChart() {
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);

  const data = getMonthlyData(transactions).map((d) => ({
    ...d,
    name: getMonthName(d.month),
  }));

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-[var(--muted-foreground)]">No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
        <Line type="monotone" dataKey="expense" stroke="var(--destructive)" name="Expense" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="income" stroke="var(--success)" name="Income" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
