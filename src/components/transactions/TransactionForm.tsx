"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { Transaction } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface TransactionFormProps {
  editTransaction?: Transaction | null;
  onClose: () => void;
}

export function TransactionForm({ editTransaction, onClose }: TransactionFormProps) {
  const { addTransaction, updateTransaction, categories } = useStore();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTransaction) {
      setTitle(editTransaction.title);
      setAmount(String(editTransaction.amount));
      setType(editTransaction.type);
      setCategory(editTransaction.category);
      setDate(editTransaction.date);
      setNotes(editTransaction.notes);
    }
  }, [editTransaction]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!amount || Number(amount) <= 0) e.amount = "Amount must be positive";
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
    } else {
      addTransaction(data);
    }
    onClose();
  };

  const categoryOptions = [
    { value: "", label: "Select category" },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Grocery shopping"
      />
      {errors.title && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.title}</p>}

      <Input
        label="Amount"
        id="amount"
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
      />
      {errors.amount && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.amount}</p>}

      <div className="flex gap-3">
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
      </div>

      <Select
        label="Category"
        id="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={categoryOptions}
      />
      {errors.category && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.category}</p>}

      <Input
        label="Date"
        id="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      {errors.date && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.date}</p>}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-[var(--foreground)]">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors resize-none"
        />
      </div>

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
