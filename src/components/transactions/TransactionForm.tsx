"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { Transaction, TransactionType } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";

interface TransactionFormProps {
  editTransaction?: Transaction | null;
  onClose: () => void;
}

const TYPE_CONFIG: { value: TransactionType; label: string; activeClass: string }[] = [
  {
    value: "expense",
    label: "Expense",
    activeClass: "border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]",
  },
  {
    value: "income",
    label: "Income",
    activeClass: "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]",
  },
  {
    value: "transfer",
    label: "Transfer",
    activeClass: "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]",
  },
];

export function TransactionForm({ editTransaction, onClose }: TransactionFormProps) {
  const { addTransaction, updateTransaction, addRecurring, categories } = useStore();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTransaction) {
      setTitle(editTransaction.title);
      setAmount(String(editTransaction.amount));
      setType(editTransaction.type);
      setCategory(editTransaction.category);
      setDate(editTransaction.date);
      setNotes(editTransaction.notes);
      setRecurring(false);
    }
  }, [editTransaction]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty, digits, and one decimal point with up to 2 decimal places
    if (val === "" || /^\d+\.?\d{0,2}$/.test(val)) {
      setAmount(val);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Merchant name is required";
    if (!amount || Number(amount) <= 0) e.amount = "Amount must be a positive number";
    if (isNaN(Number(amount))) e.amount = "Amount must be a valid number";
    if (!category) e.category = "Category is required";
    if (!date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date,
      notes: notes.trim(),
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, data);
      toast("Transaction updated");
    } else {
      addTransaction(data);
      toast("Transaction added");

      // Also create a recurring template if toggled on
      if (recurring) {
        addRecurring({
          title: data.title,
          amount: data.amount,
          type: data.type,
          category: data.category,
          notes: data.notes,
          frequency,
        });
        toast("Recurring template created", "info");
      }
    }
    onClose();
  };

  const categoryOptions = [
    { value: "", label: "Select category" },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount" className="text-sm font-medium text-[var(--foreground)]">
          Amount
        </label>
        <div className="relative">
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-lg font-semibold tabular-nums text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors"
          />
        </div>
        {errors.amount && <p className="text-xs text-[var(--destructive)]">{errors.amount}</p>}
      </div>

      {/* Type selector */}
      <div className="flex gap-2">
        {TYPE_CONFIG.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${
              type === t.value
                ? t.activeClass
                : "border-[var(--border)] text-[var(--muted-foreground)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Merchant name */}
      <Input
        label="Merchant / Description"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Grocery shopping"
      />
      {errors.title && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.title}</p>}

      {/* Category */}
      <Select
        label="Category"
        id="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={categoryOptions}
      />
      {errors.category && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.category}</p>}

      {/* Date */}
      <Input
        label="Date"
        id="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      {errors.date && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.date}</p>}

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-[var(--foreground)]">
          Notes <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note..."
          className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors resize-none"
        />
      </div>

      {/* Recurring toggle — only for new transactions */}
      {!editTransaction && (
        <div className="rounded-lg border border-[var(--border)] px-4 py-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Recurring</p>
              <p className="text-xs text-[var(--muted-foreground)]">Also create a recurring template</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={recurring}
              onClick={() => setRecurring(!recurring)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                recurring ? "bg-[var(--primary)]" : "bg-[var(--secondary)]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  recurring ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
          {recurring && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <Select
                label="Frequency"
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as typeof frequency)}
                options={[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" },
                ]}
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {editTransaction ? "Update" : "Add"} Transaction
        </Button>
      </div>
    </form>
  );
}
