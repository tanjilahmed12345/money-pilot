"use client";

import { useStore } from "@/store";
import { Transaction } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/utils";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
}

export function TransactionList({ transactions, onEdit }: TransactionListProps) {
  const { deleteTransaction, addTransaction } = useStore();
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);

  const duplicateTransaction = (t: Transaction) => {
    addTransaction({
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: new Date().toISOString().split("T")[0],
      notes: t.notes,
    });
  };

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  if (transactions.length === 0) {
    return <EmptyState title="No transactions found" description="Try adjusting your filters or add a new transaction" />;
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => {
        const cat = catMap[t.category];
        const isIncome = t.type === "income";
        return (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition-colors hover:bg-[var(--accent)]/50"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                style={{ backgroundColor: `${cat?.color || "#6b7280"}15` }}
              >
                {cat?.icon || "📦"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--card-foreground)] truncate">{t.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--muted-foreground)]">{formatDate(t.date)}</span>
                  {cat && <Badge color={cat.color}>{cat.name}</Badge>}
                  {t.notes && (
                    <span className="text-xs text-[var(--muted-foreground)] truncate max-w-[120px]" title={t.notes}>
                      {t.notes}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: isIncome ? "var(--success)" : "var(--destructive)" }}
              >
                {isIncome ? "+" : "-"}{formatCurrency(t.amount, currency)}
              </span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => duplicateTransaction(t)} title="Duplicate">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(t)} title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteTransaction(t.id)} title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2">
                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
