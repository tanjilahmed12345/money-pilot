"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/utils";
import Link from "next/link";

export function RecentTransactions() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);

  const { recent, catMap } = useMemo(() => ({
    recent: transactions.slice(0, 5),
    catMap: Object.fromEntries(categories.map((c) => [c.id, c])),
  }), [transactions, categories]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--card-foreground)]">Recent Transactions</h2>
        <Link href="/transactions" className="text-sm text-[var(--primary)] hover:underline">
          View all
        </Link>
      </div>
      {recent.length === 0 ? (
        <EmptyState title="No transactions yet" description="Add your first transaction to get started" />
      ) : (
        <div className="space-y-3">
          {recent.map((t) => {
            const cat = catMap[t.category];
            return (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat?.icon || "📦"}</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--card-foreground)]">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--muted-foreground)]">{formatDate(t.date)}</span>
                      {cat && <Badge color={cat.color}>{cat.name}</Badge>}
                    </div>
                  </div>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: t.type === "income" ? "var(--success)" : "var(--destructive)" }}
                >
                  {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
