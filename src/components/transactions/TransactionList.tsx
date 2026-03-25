"use client";

import { useState, useMemo, useCallback } from "react";
import { useStore } from "@/store";
import { useShallowStore } from "@/hooks/useShallowStore";
import { Transaction } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/utils";
import { useToast } from "@/components/ui/Toast";

const PAGE_SIZE = 15;

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
}

export function TransactionList({ transactions, onEdit }: TransactionListProps) {
  const { categories, currency } = useShallowStore((s) => ({
    categories: s.categories,
    currency: s.settings.currency,
  }));
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const addTransaction = useStore((s) => s.addTransaction);
  const { toast } = useToast();
  const [page, setPage] = useState(0);

  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const safePageIndex = Math.min(page, totalPages - 1);
  const paginated = useMemo(
    () => transactions.slice(safePageIndex * PAGE_SIZE, (safePageIndex + 1) * PAGE_SIZE),
    [transactions, safePageIndex]
  );

  // Reset to page 0 when transactions change (e.g. filter change)
  useMemo(() => { setPage(0); }, [transactions.length]);

  const duplicateTransaction = useCallback((e: React.MouseEvent, t: Transaction) => {
    e.stopPropagation();
    addTransaction({
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: new Date().toISOString().split("T")[0],
      notes: t.notes,
    });
    toast("Transaction duplicated");
  }, [addTransaction, toast]);

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteTransaction(id);
    toast("Transaction deleted");
  }, [deleteTransaction, toast]);

  const handleEditClick = useCallback((e: React.MouseEvent, t: Transaction) => {
    e.stopPropagation();
    onEdit(t);
  }, [onEdit]);

  if (transactions.length === 0) {
    return <EmptyState title="No transactions found" description="Try adjusting your filters or add a new transaction" />;
  }

  const start = safePageIndex * PAGE_SIZE + 1;
  const end = Math.min((safePageIndex + 1) * PAGE_SIZE, transactions.length);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {paginated.map((t) => {
          const cat = catMap[t.category];
          const isIncome = t.type === "income";
          const isTransfer = t.type === "transfer";
          const amountColor = isTransfer ? "var(--primary)" : isIncome ? "var(--success)" : "var(--destructive)";
          const amountPrefix = isTransfer ? "↔ " : isIncome ? "+" : "-";
          return (
            <div
              key={t.id}
              onClick={() => onEdit(t)}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition-colors hover:bg-[var(--accent)]/50 cursor-pointer"
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
                  className="text-sm font-semibold whitespace-nowrap tabular-nums"
                  style={{ color: amountColor }}
                >
                  {amountPrefix}{formatCurrency(t.amount, currency)}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => duplicateTransaction(e, t)} title="Duplicate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => handleEditClick(e, t)} title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => handleDelete(e, t.id)} title="Delete">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[var(--muted-foreground)]">
            {start}–{end} of {transactions.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePageIndex === 0}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                  i === safePageIndex
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePageIndex === totalPages - 1}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
