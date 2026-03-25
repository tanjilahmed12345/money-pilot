"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store";
import { getMonthlyData } from "@/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type RangeOption = 6 | 12;

export function MonthlyBarChart() {
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);
  const [range, setRange] = useState<RangeOption>(6);

  const { data, yMax } = useMemo(() => {
    const all = getMonthlyData(transactions).map((d) => {
      const [, m] = d.month.split("-");
      const short = new Date(0, Number(m) - 1).toLocaleDateString("en-US", { month: "short" });
      return { ...d, name: `${short} ${d.month.split("-")[0].slice(2)}` };
    });

    const sliced = all.slice(-range);
    const maxVal = sliced.reduce((max, d) => Math.max(max, d.income, d.expense), 0);
    const yMax = Math.ceil(maxVal * 1.1);

    return { data: sliced, yMax: yMax || 100 };
  }, [transactions, range]);

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-[var(--muted-foreground)]">No data</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-1 mb-4">
        {([6, 12] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              range === r
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {r}M
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            domain={[0, yMax]}
            allowDataOverflow={false}
          />
          <Tooltip
            formatter={(value, name) => [
              `${currency}${Number(value).toFixed(2)}`,
              name === "income" ? "Income" : "Expense",
            ]}
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
    </div>
  );
}
//