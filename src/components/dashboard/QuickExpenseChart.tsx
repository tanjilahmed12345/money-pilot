"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { getCategoryExpenses } from "@/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function QuickExpenseChart() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);

  const data = useMemo(() => {
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
    const expenses = getCategoryExpenses(transactions);
    return Object.entries(expenses).map(([catId, amount]) => ({
      name: catMap[catId]?.name || catId,
      value: amount,
      color: catMap[catId]?.color || "#6b7280",
    }));
  }, [transactions, categories]);

  if (data.length === 0) return null;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Expense Breakdown</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            isAnimationActive={false}
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
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[var(--muted-foreground)]">{d.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
