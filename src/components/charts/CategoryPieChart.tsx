"use client";

import { useStore } from "@/store";
import { getCategoryExpenses } from "@/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, PieLabelRenderProps } from "recharts";

export function CategoryPieChart() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const expenses = getCategoryExpenses(transactions);

  const data = Object.entries(expenses)
    .map(([catId, amount]) => ({
      name: catMap[catId]?.name || catId,
      value: amount,
      color: catMap[catId]?.color || "#6b7280",
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-[var(--muted-foreground)]">No expense data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
          label={(props: PieLabelRenderProps) => `${props.name || ""} ${((Number(props.percent) || 0) * 100).toFixed(0)}%`}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
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
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
