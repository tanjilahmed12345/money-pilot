"use client";

import { useState, useMemo, useCallback } from "react";
import { useStore } from "@/store";
import { useShallowStore } from "@/hooks/useShallowStore";
import { LendBorrowTransaction, LendBorrowType, Currency } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/utils";

const METHODS = ["Cash", "Bank", "bKash", "Nagad", "Other"];

// ─── Person summary ──────────────────────────────────────────
interface PersonSummary {
  name: string;
  lent: number;
  borrowed: number;
  net: number; // positive = they owe me, negative = I owe them
  transactions: LendBorrowTransaction[];
}

function buildPersonSummaries(txs: LendBorrowTransaction[]): PersonSummary[] {
  const map = new Map<string, PersonSummary>();
  for (const t of txs) {
    const key = t.person.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, { name: t.person, lent: 0, borrowed: 0, net: 0, transactions: [] });
    }
    const p = map.get(key)!;
    p.name = t.person; // keep latest casing
    if (t.type === "lent") {
      p.lent += t.amount;
      p.net += t.amount;
    } else {
      p.borrowed += t.amount;
      p.net -= t.amount;
    }
    p.transactions.push(t);
  }
  return Array.from(map.values()).sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

export default function LendBorrowPage() {
  const { lendBorrowTransactions, currency } = useShallowStore((s) => ({
    lendBorrowTransactions: s.lendBorrowTransactions,
    currency: s.settings.currency,
  }));
  const addLendBorrow = useStore((s) => s.addLendBorrow);
  const updateLendBorrow = useStore((s) => s.updateLendBorrow);
  const deleteLendBorrow = useStore((s) => s.deleteLendBorrow);
  const addTransaction = useStore((s) => s.addTransaction);
  const { toast } = useToast();

  // ─── State ───────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<LendBorrowTransaction | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "lent" | "borrowed">("all");

  // Form state
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<LendBorrowType>("lent");
  const [method, setMethod] = useState("Cash");
  const [customMethod, setCustomMethod] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Computed ────────────────────────────────────────────
  const persons = useMemo(() => buildPersonSummaries(lendBorrowTransactions), [lendBorrowTransactions]);

  const totalLent = useMemo(() => lendBorrowTransactions.filter((t) => t.type === "lent").reduce((s, t) => s + t.amount, 0), [lendBorrowTransactions]);
  const totalBorrowed = useMemo(() => lendBorrowTransactions.filter((t) => t.type === "borrowed").reduce((s, t) => s + t.amount, 0), [lendBorrowTransactions]);
  const netBalance = totalLent - totalBorrowed;

  const filteredPersons = useMemo(() => {
    let list = persons;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (filter === "lent") list = list.filter((p) => p.net > 0);
    if (filter === "borrowed") list = list.filter((p) => p.net < 0);
    return list;
  }, [persons, search, filter]);

  const selectedPersonData = useMemo(
    () => selectedPerson ? persons.find((p) => p.name.toLowerCase() === selectedPerson.toLowerCase()) : null,
    [persons, selectedPerson]
  );

  const knownPersons = useMemo(() => [...new Set(lendBorrowTransactions.map((t) => t.person))], [lendBorrowTransactions]);

  // ─── Form helpers ────────────────────────────────────────
  const resetForm = () => {
    setPerson(""); setAmount(""); setType("lent"); setMethod("Cash");
    setCustomMethod(""); setDate(new Date().toISOString().split("T")[0]);
    setNote(""); setErrors({}); setEditItem(null);
  };

  const openAdd = (prefillPerson?: string, prefillType?: LendBorrowType) => {
    resetForm();
    if (prefillPerson) setPerson(prefillPerson);
    if (prefillType) setType(prefillType);
    setModalOpen(true);
  };

  const openEdit = (t: LendBorrowTransaction) => {
    setEditItem(t);
    setPerson(t.person); setAmount(String(t.amount)); setType(t.type);
    const isPreset = METHODS.includes(t.method);
    setMethod(isPreset ? t.method : "Other");
    setCustomMethod(isPreset ? "" : t.method);
    setDate(t.date); setNote(t.note); setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!person.trim()) e.person = "Person name is required";
    if (!amount || Number(amount) <= 0) e.amount = "Amount must be positive";
    if (method === "Other" && !customMethod.trim()) e.method = "Enter payment method";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = useCallback(() => {
    if (!validate()) return;
    const data = {
      person: person.trim(),
      amount: Number(amount),
      type,
      method: method === "Other" ? customMethod.trim() : method,
      date,
      note: note.trim(),
    };
    if (editItem) {
      updateLendBorrow(editItem.id, data);
      toast("Transaction updated");
    } else {
      addLendBorrow(data);
      // Also add to main transactions — lent = expense, borrowed = income
      addTransaction({
        title: `${data.type === "lent" ? "Lent to" : "Borrowed from"} ${data.person}`,
        amount: data.amount,
        type: data.type === "lent" ? "expense" : "income",
        category: "cat-others",
        date: data.date,
        notes: `${data.method}${data.note ? " · " + data.note : ""} (Lend & Borrow)`,
      });
      toast("Transaction added");
    }
    setModalOpen(false);
    resetForm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person, amount, type, method, customMethod, date, note, editItem]);

  const handleSettle = (p: PersonSummary) => {
    const settleType: LendBorrowType = p.net > 0 ? "borrowed" : "lent";
    openAdd(p.name, settleType);
    setAmount(String(Math.abs(p.net)));
    setNote("Settlement");
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-[11px] sm:text-xs font-medium text-[var(--muted-foreground)]">Total Lent</p>
          <p className="mt-1 text-lg sm:text-xl font-bold text-[var(--success)] tabular-nums truncate">
            {formatCurrency(totalLent, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-[11px] sm:text-xs font-medium text-[var(--muted-foreground)]">Total Borrowed</p>
          <p className="mt-1 text-lg sm:text-xl font-bold text-[var(--destructive)] tabular-nums truncate">
            {formatCurrency(totalBorrowed, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-[11px] sm:text-xs font-medium text-[var(--muted-foreground)]">Net Balance</p>
          <p className={`mt-1 text-lg sm:text-xl font-bold tabular-nums truncate ${
            netBalance > 0 ? "text-[var(--success)]" : netBalance < 0 ? "text-[var(--destructive)]" : "text-[var(--muted-foreground)]"
          }`}>
            {netBalance > 0 ? "+" : ""}{formatCurrency(netBalance, currency)}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search person..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 pl-9 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition-all"
          />
        </div>
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden shrink-0">
          {(["all", "lent", "borrowed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              {f === "all" ? "All" : f === "lent" ? "They Owe" : "I Owe"}
            </button>
          ))}
        </div>
      </div>

      {/* Person list OR Person detail */}
      {selectedPerson && selectedPersonData ? (
        <PersonDetail
          person={selectedPersonData}
          currency={currency}
          onBack={() => setSelectedPerson(null)}
          onEdit={openEdit}
          onDelete={(id) => { deleteLendBorrow(id); toast("Transaction deleted"); }}
          onSettle={() => handleSettle(selectedPersonData)}
          onAddNew={(type) => openAdd(selectedPersonData.name, type)}
        />
      ) : lendBorrowTransactions.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="No lend or borrow records"
          description="Start tracking money you lend to or borrow from people"
          action={{ label: "Add Transaction", onClick: () => openAdd() }}
        />
      ) : filteredPersons.length === 0 ? (
        <div className="text-center py-12 text-sm text-[var(--muted-foreground)]">
          No results for &ldquo;{search}&rdquo;
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPersons.map((p) => (
            <button
              key={p.name}
              onClick={() => setSelectedPerson(p.name)}
              className="flex items-center gap-3 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left hover:bg-[var(--accent)] transition-colors"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                p.net > 0 ? "bg-[var(--success)]" : p.net < 0 ? "bg-[var(--destructive)]" : "bg-[var(--muted-foreground)]"
              }`}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">{p.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {p.transactions.length} transaction{p.transactions.length !== 1 && "s"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold tabular-nums ${
                  p.net > 0 ? "text-[var(--success)]" : p.net < 0 ? "text-[var(--destructive)]" : "text-[var(--muted-foreground)]"
                }`}>
                  {p.net > 0 ? "+" : ""}{formatCurrency(p.net, currency)}
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  {p.net > 0 ? "will receive" : p.net < 0 ? "you owe" : "settled"}
                </p>
              </div>
              <svg className="shrink-0 text-[var(--muted-foreground)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => openAdd()}
        className="fixed bottom-24 lg:bottom-8 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30 hover:scale-105 active:scale-95 transition-transform"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editItem ? "Edit Transaction" : "Add Transaction"}
      >
        <div className="space-y-4">
          {/* Person — input with suggestions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Person</label>
            <input
              list="person-suggestions"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder="e.g., John"
              className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors"
            />
            <datalist id="person-suggestions">
              {knownPersons.map((p) => <option key={p} value={p} />)}
            </datalist>
            {errors.person && <p className="text-xs text-[var(--destructive)]">{errors.person}</p>}
          </div>

          {/* Amount */}
          <Input label="Amount" id="lb-amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          {errors.amount && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.amount}</p>}

          {/* Type */}
          <div className="flex gap-2">
            {(["lent", "borrowed"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${
                  type === t
                    ? t === "lent"
                      ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
                      : "border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                {t === "lent" ? "I Lent" : "I Borrowed"}
              </button>
            ))}
          </div>

          {/* Payment Method */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Payment Method</label>
            <div className="flex flex-wrap gap-1.5">
              {METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMethod(m); if (m !== "Other") setCustomMethod(""); }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
                    method === m
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {method === "Other" && (
              <input
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value)}
                placeholder="Enter method..."
                className="mt-1 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors"
              />
            )}
            {errors.method && <p className="text-xs text-[var(--destructive)]">{errors.method}</p>}
          </div>

          {/* Date */}
          <Input label="Date" id="lb-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          {/* Note */}
          <Input label="Note (optional)" id="lb-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note..." />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">{editItem ? "Update" : "Add"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Person Detail View ──────────────────────────────────────

function PersonDetail({
  person, currency, onBack, onEdit, onDelete, onSettle, onAddNew,
}: {
  person: PersonSummary;
  currency: Currency;
  onBack: () => void;
  onEdit: (t: LendBorrowTransaction) => void;
  onDelete: (id: string) => void;
  onSettle: () => void;
  onAddNew: (type: LendBorrowType) => void;
}) {
  const sorted = [...person.transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      {/* Back + person header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-[var(--accent)] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
          person.net > 0 ? "bg-[var(--success)]" : person.net < 0 ? "bg-[var(--destructive)]" : "bg-[var(--muted-foreground)]"
        }`}>
          {person.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-[var(--foreground)] truncate">{person.name}</p>
          <p className={`text-sm font-semibold tabular-nums ${
            person.net > 0 ? "text-[var(--success)]" : person.net < 0 ? "text-[var(--destructive)]" : "text-[var(--muted-foreground)]"
          }`}>
            {person.net > 0 ? `Will receive ${formatCurrency(person.net, currency)}` :
             person.net < 0 ? `You owe ${formatCurrency(Math.abs(person.net), currency)}` :
             "Settled"}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {person.net !== 0 && (
          <Button size="sm" onClick={onSettle}>
            Settle {formatCurrency(Math.abs(person.net), currency)}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => onAddNew("lent")}>+ Lent</Button>
        <Button size="sm" variant="secondary" onClick={() => onAddNew("borrowed")}>+ Borrowed</Button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <p className="text-[11px] text-[var(--muted-foreground)]">You Lent</p>
          <p className="text-base font-bold text-[var(--success)] tabular-nums">{formatCurrency(person.lent, currency)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <p className="text-[11px] text-[var(--muted-foreground)]">You Borrowed</p>
          <p className="text-base font-bold text-[var(--destructive)] tabular-nums">{formatCurrency(person.borrowed, currency)}</p>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">History</p>
        <div className="space-y-2">
          {sorted.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5">
              <div className={`w-1 h-8 rounded-full shrink-0 ${t.type === "lent" ? "bg-[var(--success)]" : "bg-[var(--destructive)]"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold tabular-nums ${t.type === "lent" ? "text-[var(--success)]" : "text-[var(--destructive)]"}`}>
                    {t.type === "lent" ? "+" : "-"}{formatCurrency(t.amount, currency)}
                  </span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">{t.method}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--muted-foreground)]">{formatDate(t.date)}</span>
                  {t.note && <span className="text-xs text-[var(--muted-foreground)] truncate">· {t.note}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--muted-foreground)] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                </button>
                <button onClick={() => onDelete(t.id)} className="p-1.5 rounded-lg hover:bg-[var(--destructive)]/10 text-[var(--destructive)] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
