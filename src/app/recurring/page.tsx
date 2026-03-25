"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { RecurringTransaction, TransactionType } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/utils";
import { useToast } from "@/components/ui/Toast";

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const FREQUENCY_COLORS: Record<string, string> = {
  daily: "#ef4444",
  weekly: "#f59e0b",
  monthly: "#3b82f6",
  yearly: "#8b5cf6",
};

export default function RecurringPage() {
  const {
    recurringTransactions, addRecurring, updateRecurring, deleteRecurring,
    categories, addTransaction, settings,
  } = useStore();
  const currency = settings.currency;
  const { toast } = useToast();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<RecurringTransaction | null>(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [frequency, setFrequency] = useState<RecurringTransaction["frequency"]>("monthly");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openAdd = () => {
    setEditItem(null);
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("");
    setNotes("");
    setFrequency("monthly");
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (r: RecurringTransaction) => {
    setEditItem(r);
    setTitle(r.title);
    setAmount(String(r.amount));
    setType(r.type);
    setCategory(r.category);
    setNotes(r.notes);
    setFrequency(r.frequency);
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!amount || Number(amount) <= 0) e.amount = "Amount must be positive";
    if (!category) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = {
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      notes: notes.trim(),
      frequency,
    };
    if (editItem) {
      updateRecurring(editItem.id, data);
      toast("Template updated");
    } else {
      addRecurring(data);
      toast("Template created");
    }
    setModalOpen(false);
  };

  const applyNow = (r: RecurringTransaction) => {
    addTransaction({
      title: r.title,
      amount: r.amount,
      type: r.type,
      category: r.category,
      date: new Date().toISOString().split("T")[0],
      notes: r.notes ? `${r.notes} (recurring)` : "Recurring transaction",
    });
    toast("Transaction applied");
  };

  const categoryOptions = [
    { value: "", label: "Select category" },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Recurring Transactions</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Templates for repeating income and expenses
          </p>
        </div>
        <Button onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Template
        </Button>
      </div>

      {recurringTransactions.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="No recurring transactions"
          description="Create templates for bills, salary, subscriptions, and other repeating transactions"
          action={{ label: "Add Template", onClick: openAdd }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recurringTransactions.map((r) => {
            const cat = catMap[r.category];
            const isIncome = r.type === "income";
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                      style={{ backgroundColor: `${cat?.color || "#6b7280"}15` }}
                    >
                      {cat?.icon || "📦"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--card-foreground)]">{r.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {cat && <Badge color={cat.color}>{cat.name}</Badge>}
                        <Badge color={FREQUENCY_COLORS[r.frequency]}>
                          {FREQUENCY_LABELS[r.frequency]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-lg font-bold"
                    style={{ color: r.type === "transfer" ? "var(--primary)" : isIncome ? "var(--success)" : "var(--destructive)" }}
                  >
                    {r.type === "transfer" ? "↔ " : isIncome ? "+" : "-"}{formatCurrency(r.amount, currency)}
                  </span>
                  <Badge color={r.type === "transfer" ? "#2563eb" : isIncome ? "#22c55e" : "#ef4444"}>
                    {r.type}
                  </Badge>
                </div>

                {r.notes && (
                  <p className="text-xs text-[var(--muted-foreground)] mb-3 truncate" title={r.notes}>
                    {r.notes}
                  </p>
                )}

                <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => applyNow(r)}>
                    Apply Now
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { deleteRecurring(r.id); toast("Template deleted"); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2">
                      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Template" : "Add Recurring Template"}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            id="rec-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Netflix Subscription"
          />
          {errors.title && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.title}</p>}

          <Input
            label="Amount"
            id="rec-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          {errors.amount && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.amount}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${
                type === "expense"
                  ? "border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${
                type === "income"
                  ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType("transfer")}
              className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${
                type === "transfer"
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              Transfer
            </button>
          </div>

          <Select
            label="Category"
            id="rec-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoryOptions}
          />
          {errors.category && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.category}</p>}

          <Select
            label="Frequency"
            id="rec-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurringTransaction["frequency"])}
            options={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />

          <Input
            label="Notes"
            id="rec-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
          />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editItem ? "Update" : "Create"} Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
