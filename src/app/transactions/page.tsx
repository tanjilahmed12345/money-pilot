"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/store";
import { Transaction, FilterState } from "@/types";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";

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
  return params.toString();
}

export default function TransactionsPage() {
  const transactions = useStore((s) => s.transactions);
  const searchParams = useSearchParams();
  const router = useRouter();

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
