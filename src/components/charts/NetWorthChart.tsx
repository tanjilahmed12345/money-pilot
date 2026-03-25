"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { getMonthName } from "@/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

export function NetWorthChart() {
  const snapshots = useStore((s) => s.netWorthSnapshots);
  const currency = useStore((s) => s.settings.currency);

  const data = useMemo(() =>
    snapshots.map((s) => ({
      ...s,
      name: getMonthName(s.month).replace(/\s\d{4}$/, (m) => ` '${m.trim().slice(2)}`),
    })),
    [snapshots]
  );

  if (data.length < 2) return null;

  const minVal = Math.min(...data.map((d) => Math.min(d.netWorth, 0)));
  const maxVal = Math.max(...data.map((d) => d.assets));
  const yMin = Math.floor(minVal * 1.1);
  const yMax = Math.ceil(maxVal * 1.1) || 100;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          domain={[yMin, yMax]}
        />
        <Tooltip
          formatter={(value, name) => [
            `${currency}${Number(value).toFixed(2)}`,
            name === "netWorth" ? "Net Worth" : name === "assets" ? "Assets" : "Liabilities",
          ]}
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--card-foreground)",
          }}
        />
        <Legend
          formatter={(value) =>
            value === "netWorth" ? "Net Worth" : value === "assets" ? "Assets" : "Liabilities"
          }
        />
        <Area
          type="monotone"
          dataKey="assets"
          stroke="var(--success)"
          fill="var(--success)"
          fillOpacity={0.1}
          strokeWidth={2}
          dot={{ r: 3 }}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="liabilities"
          stroke="var(--destructive)"
          fill="var(--destructive)"
          fillOpacity={0.1}
          strokeWidth={2}
          dot={{ r: 3 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="netWorth"
          stroke="var(--primary)"
          strokeWidth={3}
          dot={{ r: 4 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
