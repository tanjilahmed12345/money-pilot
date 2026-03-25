"use client";

import { useState, useMemo, useCallback } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { getTotalIncome, getTotalExpense } from "@/utils";

export function AiSpendingSummary() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);
  const aiSummary = useStore((s) => s.aiSummary);
  const setAiSummary = useStore((s) => s.setAiSummary);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Check if summary is stale (new transactions since last generation)
  const isStale = useMemo(() => {
    if (!aiSummary) return true;
    return transactions.length !== aiSummary.transactionCount;
  }, [aiSummary, transactions.length]);

  // Prepare spending data for the last 7 and prior 7 days
  const { weeklySpending, priorWeekSpending, weekIncome, weekExpense } = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekStr = weekAgo.toISOString().split("T")[0];
    const twoWeekStr = twoWeeksAgo.toISOString().split("T")[0];
    const todayStr = now.toISOString().split("T")[0];

    const thisWeek = transactions.filter((t) => t.date >= weekStr && t.date <= todayStr);
    const lastWeek = transactions.filter((t) => t.date >= twoWeekStr && t.date < weekStr);

    const aggregate = (txs: typeof transactions) => {
      const map: Record<string, { amount: number; count: number }> = {};
      txs.filter((t) => t.type === "expense").forEach((t) => {
        const name = catMap[t.category]?.name || t.category;
        if (!map[name]) map[name] = { amount: 0, count: 0 };
        map[name].amount += t.amount;
        map[name].count++;
      });
      return Object.entries(map)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.amount - a.amount);
    };

    return {
      weeklySpending: aggregate(thisWeek),
      priorWeekSpending: aggregate(lastWeek),
      weekIncome: getTotalIncome(thisWeek),
      weekExpense: getTotalExpense(thisWeek),
    };
  }, [transactions, catMap]);

  const generateSummary = useCallback(async () => {
    if (transactions.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/spending-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklySpending,
          priorWeekSpending,
          totalIncome: weekIncome,
          totalExpense: weekExpense,
          currency,
          period: "the last 7 days",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate summary");
        return;
      }

      setAiSummary({
        text: data.summary,
        generatedAt: new Date().toISOString(),
        transactionCount: transactions.length,
      });
    } catch {
      setError("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  }, [weeklySpending, priorWeekSpending, weekIncome, weekExpense, currency, transactions.length, setAiSummary]);

  if (transactions.length === 0) return null;

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <h2 className="text-sm font-semibold text-[var(--card-foreground)]">AI Spending Insight</h2>
          {aiSummary && isStale && (
            <span className="text-[10px] font-medium text-[var(--warning)] bg-[var(--warning)]/10 rounded px-1.5 py-0.5">
              New data available
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateSummary}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
              Analyzing...
            </span>
          ) : aiSummary ? "Refresh" : "Generate"}
        </Button>
      </div>

      {loading && !aiSummary && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--destructive)]">{error}</p>
      )}

      {aiSummary && !loading && (
        <div>
          <p className="text-sm text-[var(--card-foreground)] leading-relaxed">
            {aiSummary.text}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Generated {new Date(aiSummary.generatedAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
            })}
          </p>
        </div>
      )}

      {!aiSummary && !loading && !error && (
        <p className="text-sm text-[var(--muted-foreground)]">
          Click &quot;Generate&quot; to get an AI-powered summary of your recent spending.
        </p>
      )}
    </Card>
  );
}
