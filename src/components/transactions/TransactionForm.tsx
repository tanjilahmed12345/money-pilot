"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/store";
import { Transaction, TransactionType, Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { matchCategory, aiCategorize } from "@/lib/auto-categorize";

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
  const categories = useStore((s) => s.categories);
  const merchantMap = useStore((s) => s.merchantMap);
  const recurringTransactions = useStore((s) => s.recurringTransactions);
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const addRecurring = useStore((s) => s.addRecurring);
  const setMerchantCategory = useStore((s) => s.setMerchantCategory);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [recurringMode, setRecurringMode] = useState<"pick" | "new">("pick");
  const [selectedRecurringId, setSelectedRecurringId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [autoSuggested, setAutoSuggested] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestionSource, setSuggestionSource] = useState<"rule" | "ai" | "merchant" | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const userOverrodeCategory = useRef(false);

  useEffect(() => {
    if (editTransaction) {
      setTitle(editTransaction.title);
      setAmount(String(editTransaction.amount));
      setType(editTransaction.type);
      setCategory(editTransaction.category);
      setDate(editTransaction.date);
      setNotes(editTransaction.notes);
      setRecurring(false);
      userOverrodeCategory.current = true; // Don't auto-suggest for edits
    } else {
      // Reset form for new transaction
      setTitle("");
      setAmount("");
      setType("expense");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setRecurring(false);
      setErrors({});
      setAutoSuggested(false);
      setSuggestionSource(null);
      userOverrodeCategory.current = false;
    }
  }, [editTransaction]);

  // Auto-categorize when merchant name changes
  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    userOverrodeCategory.current = false;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 2) {
      setAutoSuggested(false);
      setSuggestionSource(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      // Step 1: Try local match (merchant map + keywords)
      const localMatch = matchCategory(trimmed, merchantMap, categories);
      if (localMatch && !userOverrodeCategory.current) {
        setCategory(localMatch);
        setAutoSuggested(true);
        setSuggestionSource(merchantMap[trimmed.toLowerCase()] ? "merchant" : "rule");
        return;
      }

      // Step 2: Try AI categorization (only for 3+ chars)
      if (!localMatch && trimmed.length >= 3) {
        setAiLoading(true);
        const aiResult = await aiCategorize(trimmed, categories);
        setAiLoading(false);

        if (aiResult && !userOverrodeCategory.current) {
          setCategory(aiResult);
          setAutoSuggested(true);
          setSuggestionSource("ai");
          // Save AI result to merchant map for future use
          setMerchantCategory(trimmed, aiResult);
        }
      }
    }, 500);
  }, [merchantMap, categories, setMerchantCategory]);

  const handleRecurringSelect = (id: string) => {
    setSelectedRecurringId(id);
    const tmpl = recurringTransactions.find((r) => r.id === id);
    if (tmpl) {
      setTitle(tmpl.title);
      setAmount(String(tmpl.amount));
      setType(tmpl.type);
      setCategory(tmpl.category);
      setNotes(tmpl.notes || "");
      userOverrodeCategory.current = true;
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    userOverrodeCategory.current = true;
    setAutoSuggested(false);
    setSuggestionSource(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
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

    // Save merchant → category mapping if user overrode or confirmed
    if (title.trim()) {
      setMerchantCategory(title.trim(), category);
    }

    if (editTransaction) {
      updateTransaction(editTransaction.id, data);
      toast("Transaction updated");
    } else {
      addTransaction(data);
      toast("Transaction added");

      if (recurring && recurringMode === "new") {
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

  const selectedCat = categories.find((c) => c.id === category);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount" className="text-sm font-medium text-[var(--foreground)]">
          Amount
        </label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.00"
          className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-lg font-semibold tabular-nums text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors"
        />
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

      {/* Merchant name with auto-categorize indicator */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-[var(--foreground)]">
          Merchant / Description
        </label>
        <div className="relative">
          <input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., Grocery shopping"
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors pr-8"
          />
          {aiLoading && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <span className="h-4 w-4 block animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          )}
        </div>
        {errors.title && <p className="text-xs text-[var(--destructive)]">{errors.title}</p>}
        {autoSuggested && selectedCat && (
          <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
            <span>Auto-categorized as</span>
            <span className="font-medium" style={{ color: selectedCat.color }}>
              {selectedCat.icon} {selectedCat.name}
            </span>
            <span className="text-[10px] opacity-60">
              ({suggestionSource === "merchant" ? "saved rule" : suggestionSource === "ai" ? "AI" : "keyword"})
            </span>
          </p>
        )}
      </div>

      {/* Category with inline create */}
      <CategoryPicker
        categories={categories}
        value={category}
        onChange={handleCategoryChange}
        error={errors.category}
      />

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

      {/* Recurring section */}
      {!editTransaction && (
        <div className="rounded-lg border border-[var(--border)] px-4 py-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Recurring</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {recurringTransactions.length > 0
                  ? "Pick a template or create new"
                  : "Also create a recurring template"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={recurring}
              onClick={() => {
                setRecurring(!recurring);
                setSelectedRecurringId("");
                setRecurringMode(recurringTransactions.length > 0 ? "pick" : "new");
              }}
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
            <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-3">
              {/* Mode toggle — only if templates exist */}
              {recurringTransactions.length > 0 && (
                <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setRecurringMode("pick"); setSelectedRecurringId(""); }}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                      recurringMode === "pick"
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                    }`}
                  >
                    From Template
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRecurringMode("new"); setSelectedRecurringId(""); }}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                      recurringMode === "new"
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                    }`}
                  >
                    Create New
                  </button>
                </div>
              )}

              {/* Pick from existing templates */}
              {recurringMode === "pick" && recurringTransactions.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {recurringTransactions
                    .filter((r) => !r.paused)
                    .map((r) => {
                      const cat = categories.find((c) => c.id === r.category);
                      const isSelected = selectedRecurringId === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleRecurringSelect(r.id)}
                          className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-all ${
                            isSelected
                              ? "bg-[var(--primary)]/10 border-2 border-[var(--primary)]"
                              : "border border-[var(--border)] hover:bg-[var(--accent)]"
                          }`}
                        >
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                            style={{ backgroundColor: `${cat?.color || "#6b7280"}15` }}
                          >
                            {cat?.icon || "📦"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--foreground)] truncate">{r.title}</p>
                            <p className="text-[11px] text-[var(--muted-foreground)]">
                              {cat?.name || "Other"} · {r.frequency}
                            </p>
                          </div>
                          <span
                            className="text-sm font-bold tabular-nums shrink-0"
                            style={{ color: r.type === "income" ? "var(--success)" : "var(--destructive)" }}
                          >
                            {r.type === "income" ? "+" : "-"}{r.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                          {isSelected && (
                            <svg className="shrink-0 text-[var(--primary)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  {recurringTransactions.filter((r) => !r.paused).length === 0 && (
                    <p className="text-xs text-[var(--muted-foreground)] text-center py-2">
                      No active templates. Create one first.
                    </p>
                  )}
                </div>
              )}

              {/* Create new template — frequency picker */}
              {recurringMode === "new" && (
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
              )}
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

// ─── Inline Category Picker with "Create New" ─────────────────

const DEFAULT_ICON = "📁";
const PRESET_COLORS = [
  "#f97316", "#ef4444", "#ec4899", "#a855f7", "#6366f1",
  "#3b82f6", "#06b6d4", "#14b8a6", "#22c55e", "#84cc16",
  "#eab308", "#6b7280",
];

function CategoryPicker({
  categories,
  value,
  onChange,
  error,
}: {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const addCategory = useStore((s) => s.addCategory);
  const { toast } = useToast();

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) nameInputRef.current?.focus();
  }, [creating]);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;

    const cat: Omit<Category, "id"> = {
      name,
      icon: newIcon.trim() || DEFAULT_ICON,
      color: newColor,
    };

    addCategory(cat);

    // Find the newly created category (last one added)
    // We need a slight delay for the store to update
    setTimeout(() => {
      const latest = useStore.getState().categories;
      const created = latest.find(
        (c) => c.name === name && c.color === newColor
      );
      if (created) onChange(created.id);
    }, 50);

    toast(`Category "${name}" created`);
    setCreating(false);
    setNewName("");
    setNewIcon("");
    setNewColor(PRESET_COLORS[0]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--foreground)]">Category</label>

      {!creating ? (
        <>
          {/* Dropdown + Create button */}
          <div className="flex gap-2">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--primary)]/40 bg-[var(--primary)]/5 px-3 py-2 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New
            </button>
          </div>
          {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
        </>
      ) : (
        /* Inline create form */
        <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-3 space-y-3 animate-[fadeIn_0.15s_ease-out]">
          <div className="flex gap-2">
            {/* Icon input */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[var(--muted-foreground)]">Icon</label>
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder={DEFAULT_ICON}
                maxLength={2}
                className="w-12 h-9 rounded-lg border border-[var(--input)] bg-[var(--background)] text-center text-lg focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors"
              />
            </div>
            {/* Name input */}
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[var(--muted-foreground)]">Name</label>
              <input
                ref={nameInputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreate(); } }}
                placeholder="e.g., Groceries"
                className="h-9 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors"
              />
            </div>
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[var(--muted-foreground)]">Color</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className="w-6 h-6 rounded-full transition-all"
                  style={{
                    backgroundColor: c,
                    outline: newColor === c ? `2px solid ${c}` : "none",
                    outlineOffset: newColor === c ? "2px" : "0",
                    transform: newColor === c ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setCreating(false); setNewName(""); setNewIcon(""); }}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="flex-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Create & Select
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
