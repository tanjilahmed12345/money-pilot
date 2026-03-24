"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Transaction, FilterState } from "@/types";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const defaultFilters: FilterState = {
  search: "",
  type: "all",
  category: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "date",
  sortOrder: "desc",
};

export default function TransactionsPage() {
  const transactions = useStore((s) => s.transactions);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const filtered = useFilteredTransactions(transactions, filters);

  const openAdd = () => {
    setEditTx(null);
    setModalOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditTx(t);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
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

      <TransactionFilters filters={filters} onChange={setFilters} />
      <TransactionList transactions={filtered} onEdit={openEdit} />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editTx ? "Edit Transaction" : "Add Transaction"}
      >
        <TransactionForm editTransaction={editTx} onClose={closeModal} />
      </Modal>
    </div>
  );
}
