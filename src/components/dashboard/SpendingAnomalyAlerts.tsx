"use client";

import { useMemo } from "react";
import { useShallowStore } from "@/hooks/useShallowStore";
import { formatCurrency } from "@/utils";
import { detectAnomalies } from "@/lib/anomaly";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export function SpendingAnomalyAlerts() {
  const { transactions, categories, currency } = useShallowStore((s) => ({
    transactions: s.transactions, categories: s.categories, currency: s.settings.currency,
  }));

  const anomalies = useMemo(
    () => detectAnomalies(transactions, categories),
    [transactions, categories]
  );

  if (anomalies.length === 0) return null;

  return (
    <Link href="/analytics" className="block">
      <div className="flex items-start gap-3 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20 px-4 py-3">
        <span className="text-lg mt-0.5">📊</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--warning)]">
            Unusual spending in {anomalies.length} categor{anomalies.length !== 1 ? "ies" : "y"}
          </p>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {anomalies.slice(0, 4).map((a) => (
              <span key={a.categoryId} className="inline-flex items-center gap-1 text-xs text-[var(--warning)]">
                <span>{a.categoryIcon}</span>
                <span className="font-medium">{a.categoryName}</span>
                <Badge color="#f59e0b">+{a.percentAbove.toFixed(0)}%</Badge>
              </span>
            ))}
            {anomalies.length > 4 && (
              <span className="text-xs text-[var(--warning)]">+{anomalies.length - 4} more</span>
            )}
          </div>
        </div>
        <svg className="shrink-0 mt-1 text-[var(--warning)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}
