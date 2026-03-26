"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useStore } from "@/store";
import { RecurringTransaction, TransactionType, RecurringTag } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/utils";
import { useToast } from "@/components/ui/Toast";
import {
  calcNextDueDate, advanceDueDate, isDueToday, isOverdue,
  daysUntilDue, TAG_COLORS, TAG_LABELS,
} from "@/lib/recurring";

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly",
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
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [tag, setTag] = useState<RecurringTag>("other");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-apply due transactions on mount
  const autoApplied = useMemo(() => new Set<string>(), []);
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    for (const r of recurringTransactions) {
      if (r.paused || autoApplied.has(r.id)) continue;
      const due = r.nextDueDate || calcNextDueDate(r.frequency, r.startDate);
      if (due <= today) {
        addTransaction({
          title: r.title,
          amount: r.amount,
          type: r.type,
          category: r.category,
          date: today,
          notes: r.notes ? `${r.notes} (auto-recurring)` : "Auto-recurring transaction",
        });
        updateRecurring(r.id, { nextDueDate: advanceDueDate(r.frequency, due) });
        autoApplied.add(r.id);
        toast(`Auto-applied: ${r.title}`, "info");
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Enrich with computed due dates
  const enriched = useMemo(() =>
    recurringTransactions.map((r) => {
      const nextDue = r.nextDueDate || calcNextDueDate(r.frequency, r.startDate);
      const days = daysUntilDue(nextDue);
      return { ...r, nextDue, days, due: isDueToday(nextDue), overdue: isOverdue(nextDue) };
    }).sort((a, b) => {
      if (a.paused !== b.paused) return a.paused ? 1 : -1;
      return (a.nextDue || "").localeCompare(b.nextDue || "");
    }),
    [recurringTransactions]
  );

  const activeCount = enriched.filter((r) => !r.paused).length;
  const totalMonthly = useMemo(() => {
    return enriched
      .filter((r) => !r.paused && r.type === "expense")
      .reduce((sum, r) => {
        switch (r.frequency) {
          case "daily": return sum + r.amount * 30;
          case "weekly": return sum + r.amount * 4.33;
          case "monthly": return sum + r.amount;
          case "yearly": return sum + r.amount / 12;
          default: return sum;
        }
      }, 0);
  }, [enriched]);

  const togglePause = useCallback((r: RecurringTransaction) => {
    updateRecurring(r.id, { paused: !r.paused });
    toast(r.paused ? `${r.title} resumed` : `${r.title} paused`);
  }, [updateRecurring, toast]);

  const applyNow = useCallback((r: typeof enriched[number]) => {
    addTransaction({
      title: r.title,
      amount: r.amount,
      type: r.type,
      category: r.category,
      date: new Date().toISOString().split("T")[0],
      notes: r.notes ? `${r.notes} (recurring)` : "Recurring transaction",
    });
    updateRecurring(r.id, { nextDueDate: advanceDueDate(r.frequency, r.nextDue) });
    toast("Transaction applied");
  }, [addTransaction, updateRecurring, toast]);

  const openAdd = () => {
    setEditItem(null);
    setTitle(""); setAmount(""); setType("expense"); setCategory("");
    setNotes(""); setFrequency("monthly"); setTag("other");
    setStartDate(new Date().toISOString().split("T")[0]);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (r: RecurringTransaction) => {
    setEditItem(r);
    setTitle(r.title); setAmount(String(r.amount)); setType(r.type);
    setCategory(r.category); setNotes(r.notes); setFrequency(r.frequency);
    setStartDate(r.startDate || new Date().toISOString().split("T")[0]);
    setTag(r.tag || "other");
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
    const nextDue = calcNextDueDate(frequency, startDate);
    const data = {
      title: title.trim(), amount: Number(amount), type, category,
      notes: notes.trim(), frequency, startDate, tag,
      nextDueDate: nextDue, paused: editItem?.paused || false,
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

  const categoryOptions = [
    { value: "", label: "Select category" },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ];

  const tagOptions: { value: RecurringTag; label: string }[] = [
    { value: "subscription", label: "Subscription" },
    { value: "bill", label: "Bill" },
    { value: "income", label: "Income" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Recurring Transactions</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Manage subscriptions, bills, and repeating payments
          </p>
        </div>
        <Button onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add
        </Button>
      </div>

      {/* Summary */}
      {enriched.length > 0 && (
        <div id="recurring-summary" className="grid grid-cols-3 gap-3 sm:gap-4">
          <Card id="active-recurring">
            <p className="text-[10px] sm:text-sm text-[var(--muted-foreground)]">Active</p>
            <p className="mt-1 text-xl font-bold text-[var(--foreground)]">{activeCount}</p>
          </Card>
          <Card id="monthly-cost">
            <p className="text-sm text-[var(--muted-foreground)]">Est. Monthly Cost</p>
            <p className="mt-1 text-xl font-bold text-[var(--destructive)] tabular-nums">
              {formatCurrency(totalMonthly, currency)}
            </p>
          </Card>
          <Card id="paused-recurring">
            <p className="text-sm text-[var(--muted-foreground)]">Paused</p>
            <p className="mt-1 text-xl font-bold text-[var(--muted-foreground)]">
              {enriched.length - activeCount}
            </p>
          </Card>
        </div>
      )}

      {enriched.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="No recurring transactions"
          description="Create templates for bills, salary, subscriptions, and other repeating transactions"
          action={{ label: "Add Template", onClick: openAdd }}
        />
      ) : (
        <div id="recurring-items" className="space-y-2">
          {enriched.map((r) => {
            const cat = catMap[r.category];
            const tagColor = TAG_COLORS[r.tag || "other"];
            const daysText = r.days !== null
              ? r.days === 0 ? "Due today" : r.days < 0 ? `${Math.abs(r.days)}d overdue` : `${r.days}d`
              : null;

            return (
              <div
                key={r.id}
                className={`flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 sm:px-4 py-3 transition-colors ${
                  r.paused ? "opacity-50" : ""
                }`}
              >
                {/* Color indicator */}
                <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: tagColor }} />

                {/* Icon */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                  style={{ backgroundColor: `${cat?.color || "#6b7280"}15` }}
                >
                  {cat?.icon || "📦"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--card-foreground)] truncate">{r.title}</p>
                    {r.paused && <Badge color="#6b7280">Paused</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <Badge color={tagColor}>{TAG_LABELS[r.tag || "other"]}</Badge>
                    <span className="text-xs text-[var(--muted-foreground)]">{FREQUENCY_LABELS[r.frequency]}</span>
                    {r.nextDue && !r.paused && (
                      <span className={`text-xs font-medium ${
                        r.overdue || r.due ? "text-[var(--destructive)]" : "text-[var(--muted-foreground)]"
                      }`}>
                        {daysText} · {formatDate(r.nextDue)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <span
                  className="text-sm font-bold tabular-nums whitespace-nowrap shrink-0"
                  style={{ color: r.type === "transfer" ? "var(--primary)" : r.type === "income" ? "var(--success)" : "var(--destructive)" }}
                >
                  {r.type === "transfer" ? "↔ " : r.type === "income" ? "+" : "-"}{formatCurrency(r.amount, currency)}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!r.paused && (
                    <Button variant="primary" size="sm" onClick={() => applyNow(r)}>
                      Apply
                    </Button>
                  )}
                  <button
                    onClick={() => togglePause(r)}
                    title={r.paused ? "Resume" : "Pause"}
                    className={`rounded-lg p-1.5 transition-colors ${
                      r.paused
                        ? "text-[var(--success)] hover:bg-[var(--success)]/10"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                    }`}
                  >
                    {r.paused ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                      </svg>
                    )}
                  </button>
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
              </div>
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
          <Input label="Title" id="rec-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Netflix Subscription" />
          {errors.title && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.title}</p>}

          <Input label="Amount" id="rec-amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          {errors.amount && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.amount}</p>}

          <div className="flex gap-2">
            {(["expense", "income", "transfer"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${
                  type === t
                    ? t === "expense" ? "border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]"
                      : t === "income" ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
                      : "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>

          <Select label="Tag" id="rec-tag" value={tag} onChange={(e) => setTag(e.target.value as RecurringTag)} options={tagOptions} />
          <Select label="Category" id="rec-category" value={category} onChange={(e) => setCategory(e.target.value)} options={categoryOptions} />
          {errors.category && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.category}</p>}

          <Select label="Frequency" id="rec-frequency" value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurringTransaction["frequency"])}
            options={[
              { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" },
            ]}
          />

          <Input label="Start Date" id="rec-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

          <Input label="Notes" id="rec-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">{editItem ? "Update" : "Create"} Template</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
