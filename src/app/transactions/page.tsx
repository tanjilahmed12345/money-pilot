"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/store";
import { useShallowStore } from "@/hooks/useShallowStore";
import { Transaction, FilterState } from "@/types";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/utils";

const defaultFilters: FilterState = {
  search: "",
  type: "all",
  category: "",
  categories: [],
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
  sortBy: "date",
  sortOrder: "desc",
  source: "all",
};

function filtersFromParams(params: URLSearchParams): FilterState {
  const cats = params.get("categories");
  return {
    search: params.get("search") || "",
    type: (params.get("type") as FilterState["type"]) || "all",
    category: params.get("category") || "",
    categories: cats ? cats.split(",").filter(Boolean) : [],
    dateFrom: params.get("dateFrom") || "",
    dateTo: params.get("dateTo") || "",
    amountMin: params.get("amountMin") || "",
    amountMax: params.get("amountMax") || "",
    sortBy: (params.get("sortBy") as "date" | "amount") || "date",
    sortOrder: (params.get("sortOrder") as "asc" | "desc") || "desc",
    source: (params.get("source") as FilterState["source"]) || "all",
  };
}

function filtersToParams(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (filters.categories.length > 0) params.set("categories", filters.categories.join(","));
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.amountMin) params.set("amountMin", filters.amountMin);
  if (filters.amountMax) params.set("amountMax", filters.amountMax);
  if (filters.sortBy !== "date") params.set("sortBy", filters.sortBy);
  if (filters.sortOrder !== "desc") params.set("sortOrder", filters.sortOrder);
  if (filters.source !== "all") params.set("source", filters.source);
  return params.toString();
}

export default function TransactionsPage() {
  const transactions = useStore((s) => s.transactions);
  const { categories, currency } = useShallowStore((s) => ({
    categories: s.categories,
    currency: s.settings.currency,
  }));
  const searchParams = useSearchParams();
  const router = useRouter();
  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const recentTxs = useMemo(() => transactions.slice(0, 5), [transactions]);

  const [filters, setFilters] = useState<FilterState>(() => filtersFromParams(searchParams));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [formKey, setFormKey] = useState(0);

  // Sync URL → state on param changes (e.g. shared link)
  useEffect(() => {
    setFilters(filtersFromParams(searchParams));
  }, [searchParams]);

  // Sync state → URL
  const updateFilters = useCallback((next: FilterState) => {
    setFilters(next);
    const qs = filtersToParams(next);
    const url = qs ? `/transactions?${qs}` : "/transactions";
    router.replace(url, { scroll: false });
  }, [router]);

  const filtered = useFilteredTransactions(transactions, filters);

  const openAdd = () => {
    setEditTx(null);
    setFormKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditTx(t);
    setFormKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditTx(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Transactions</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add
        </Button>
      </div>

      {/* Recent Transactions */}
      {recentTxs.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentTxs.map((t) => {
              const cat = catMap[t.category];
              const isLendBorrow = t.notes.includes("(Lend & Borrow)");
              return (
                <button
                  key={t.id}
                  onClick={() => openEdit(t)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-[var(--accent)] transition-colors"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
                    style={{ backgroundColor: `${cat?.color || "#6b7280"}15` }}
                  >
                    {cat?.icon || "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{t.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-[var(--muted-foreground)]">{formatDate(t.date)}</span>
                      {isLendBorrow && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] font-medium">Lend/Borrow</span>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold tabular-nums shrink-0"
                    style={{ color: t.type === "transfer" ? "var(--primary)" : t.type === "income" ? "var(--success)" : "var(--destructive)" }}
                  >
                    {t.type === "income" ? "+" : t.type === "transfer" ? "↔ " : "-"}{formatCurrency(t.amount, currency)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div id="transaction-filters"><TransactionFilters filters={filters} onChange={updateFilters} defaultFilters={defaultFilters} /></div>
      <div id="transaction-list"><TransactionList transactions={filtered} onEdit={openEdit} /></div>

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editTx ? "Edit Transaction" : "Add Transaction"}
      >
        <TransactionForm key={formKey} editTransaction={editTx} onClose={closeDrawer} />
      </Drawer>
    </div>
  );
}
