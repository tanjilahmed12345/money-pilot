"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { getCategoryMonthlyTrends } from "@/lib/anomaly";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function CategoryTrendsChart() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);

  const { chartData, series } = useMemo(() => {
    const { months, series } = getCategoryMonthlyTrends(transactions, categories, 12);

    const chartData = months.map((m, i) => {
      const [, month] = m.split("-");
      const label = new Date(0, Number(month) - 1).toLocaleDateString("en-US", { month: "short" }) + ` '${m.split("-")[0].slice(2)}`;
      const point: Record<string, string | number> = { name: label };
      for (const s of series) {
        point[s.catId] = s.data[i];
      }
      return point;
    });

    return { chartData, series };
  }, [transactions, categories]);

  if (series.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-[var(--muted-foreground)]">No expense data</div>;
  }

  const maxVal = Math.max(...series.flatMap((s) => s.data));
  const yMax = Math.ceil(maxVal * 1.1) || 100;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} domain={[0, yMax]} />
        <Tooltip
          formatter={(value, name) => {
            const s = series.find((s) => s.catId === name);
            return [`${currency}${Number(value).toFixed(2)}`, s?.name || String(name)];
          }}
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--card-foreground)",
          }}
        />
        <Legend
          formatter={(value) => {
            const s = series.find((s) => s.catId === value);
            return s?.name || value;
          }}
        />
        {series.map((s) => (
          <Line
            key={s.catId}
            type="monotone"
            dataKey={s.catId}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
