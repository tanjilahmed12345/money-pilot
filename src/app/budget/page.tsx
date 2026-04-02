"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store";
import { useShallowStore } from "@/hooks/useShallowStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, getCurrentMonth, getMonthName, getThisMonthTransactions } from "@/utils";
import { useToast } from "@/components/ui/Toast";

function getStatusColor(spent: number, budget: number) {
  const pct = (spent / budget) * 100;
  if (pct >= 90) return "var(--destructive)";
  if (pct >= 75) return "var(--warning)";
  return "var(--success)";
}

function getStatusLabel(pct: number) {
  if (pct >= 100) return "Exceeded";
  if (pct >= 90) return "Critical";
  if (pct >= 75) return "Warning";
  return "On track";
}

export default function BudgetPage() {
  const { budgets, categories, transactions, currency } = useShallowStore((s) => ({
    budgets: s.budgets,
    categories: s.categories,
    transactions: s.transactions,
    currency: s.settings.currency,
  }));
  const setBudget = useStore((s) => s.setBudget);
  const deleteBudget = useStore((s) => s.deleteBudget);
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("overall");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(getCurrentMonth());

  const currentMonth = getCurrentMonth();
  const monthTransactions = getThisMonthTransactions(transactions);

  const monthBudgets = budgets.filter((b) => b.month === currentMonth);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  // Compute previous month string
  const prevMonth = useMemo(() => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [currentMonth]);

  const prevMonthBudgets = budgets.filter((b) => b.month === prevMonth);

  const getCategorySpent = (categoryId: string) => {
    if (categoryId === "overall") {
      return monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
    }
    return monthTransactions
      .filter((t) => t.type === "expense" && t.category === categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSave = () => {
    if (!amount || Number(amount) <= 0) return;
    setBudget(selectedCategory, Number(amount), month);
    setModalOpen(false);
    setAmount("");
    toast("Budget saved");
  };

  const copyLastMonth = () => {
    if (prevMonthBudgets.length === 0) {
      toast("No budgets found for last month", "error");
      return;
    }
    let copied = 0;
    for (const b of prevMonthBudgets) {
      const exists = monthBudgets.find((mb) => mb.category === b.category);
      if (!exists) {
        setBudget(b.category, b.amount, currentMonth);
        copied++;
      }
    }
    if (copied > 0) {
      toast(`${copied} budget${copied !== 1 ? "s" : ""} copied from ${getMonthName(prevMonth)}`);
    } else {
      toast("All budgets already exist for this month", "info");
    }
  };

  // Summary stats
  const totalBudget = monthBudgets.reduce((sum, b) => b.category !== "overall" ? sum + b.amount : sum, 0);
  const totalSpent = monthBudgets.reduce((sum, b) => b.category !== "overall" ? sum + getCategorySpent(b.category) : sum, 0);
  const exceededCount = monthBudgets.filter((b) => getCategorySpent(b.category) >= b.amount).length;

  const categoryOptions = [
    { value: "overall", label: "Overall Budget" },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">{getMonthName(currentMonth)}</p>
        <div className="flex gap-2">
          {prevMonthBudgets.length > 0 && monthBudgets.length === 0 && (
            <Button variant="secondary" onClick={copyLastMonth}>
              Copy Last Month
            </Button>
          )}
          <Button onClick={() => setModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Set Budget
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {monthBudgets.length > 0 && (
        <div id="budget-summary" className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <Card id="total-budget" className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">Total Budget</p>
            <p className="mt-1 text-lg sm:text-xl font-bold text-[var(--foreground)] tabular-nums">
              {formatCurrency(totalBudget, currency)}
            </p>
          </Card>
          <Card className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">Total Spent</p>
            <p className="mt-1 text-lg sm:text-xl font-bold tabular-nums" style={{ color: totalSpent > totalBudget ? "var(--destructive)" : "var(--foreground)" }}>
              {formatCurrency(totalSpent, currency)}
            </p>
          </Card>
          <Card className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">Status</p>
            <div className="mt-1 flex items-center gap-1.5">
              {exceededCount > 0 ? (
                <>
                  <span className="text-lg sm:text-xl font-bold text-[var(--destructive)]">{exceededCount}</span>
                  <span className="text-xs sm:text-sm text-[var(--destructive)]">exceeded</span>
                </>
              ) : (
                <span className="text-lg sm:text-xl font-bold text-[var(--success)]">All on track</span>
              )}
            </div>
          </Card>
        </div>
      )}

      {monthBudgets.length === 0 ? (
        <EmptyState
          icon="💰"
          title="No budgets set"
          description={`Set spending limits for ${getMonthName(currentMonth)} to track your budget`}
          action={{ label: "Set Budget", onClick: () => setModalOpen(true) }}
        />
      ) : (
        <div id="budget-items" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {monthBudgets.map((b) => {
            const spent = getCategorySpent(b.category);
            const rawPct = (spent / b.amount) * 100;
            const pct = Math.min(rawPct, 100);
            const statusColor = getStatusColor(spent, b.amount);
            const isOverall = b.category === "overall";
            const cat = isOverall ? null : catMap[b.category];

            return (
              <Card key={b.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                      style={{ backgroundColor: `${cat?.color || "#6b7280"}15` }}
                    >
                      {isOverall ? "💳" : cat?.icon || "📦"}
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--card-foreground)]">
                        {isOverall ? "Overall Budget" : cat?.name || b.category}
                      </h3>
                      <Badge
                        color={statusColor === "var(--destructive)" ? "#ef4444" : statusColor === "var(--warning)" ? "#f59e0b" : "#22c55e"}
                      >
                        {getStatusLabel(rawPct)}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { deleteBudget(b.id); toast("Budget deleted"); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2">
                      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)] tabular-nums">
                      Spent: {formatCurrency(spent, currency)}
                    </span>
                    <span className="text-[var(--muted-foreground)] tabular-nums">
                      Budget: {formatCurrency(b.amount, currency)}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-[var(--secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: statusColor }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: statusColor }} className="font-medium tabular-nums">
                      {rawPct.toFixed(0)}% used
                    </span>
                    <span className="text-[var(--muted-foreground)] tabular-nums">
                      {spent >= b.amount
                        ? `${formatCurrency(spent - b.amount, currency)} over`
                        : `${formatCurrency(b.amount - spent, currency)} remaining`}
                    </span>
                  </div>
                  {rawPct >= 90 && rawPct < 100 && (
                    <div className="mt-2 rounded-lg bg-[var(--destructive)]/10 px-3 py-2 text-xs font-medium text-[var(--destructive)]">
                      Critical: {rawPct.toFixed(0)}% of budget used
                    </div>
                  )}
                  {rawPct >= 75 && rawPct < 90 && (
                    <div className="mt-2 rounded-lg bg-[var(--warning)]/10 px-3 py-2 text-xs font-medium text-[var(--warning)]">
                      Warning: {rawPct.toFixed(0)}% of budget used
                    </div>
                  )}
                  {spent >= b.amount && (
                    <div className="mt-2 rounded-lg bg-[var(--destructive)]/10 px-3 py-2 text-xs font-medium text-[var(--destructive)]">
                      Budget exceeded by {formatCurrency(spent - b.amount, currency)}!
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Set Budget">
        <div className="space-y-4">
          <Select
            label="Category"
            id="budget-cat"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categoryOptions}
          />
          <Input
            label="Budget Amount"
            id="budget-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Month"
            id="budget-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Budget
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
