"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, getCurrentMonth, getMonthName, getThisMonthTransactions } from "@/utils";

export default function BudgetPage() {
  const { budgets, setBudget, deleteBudget, categories, transactions, settings } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("overall");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(getCurrentMonth());

  const currentMonth = getCurrentMonth();
  const monthTransactions = getThisMonthTransactions(transactions);
  const currency = settings.currency;

  const monthBudgets = budgets.filter((b) => b.month === currentMonth);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

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
  };

  const getStatusColor = (spent: number, budget: number) => {
    const pct = (spent / budget) * 100;
    if (pct >= 100) return "var(--destructive)";
    if (pct >= 80) return "var(--warning)";
    return "var(--success)";
  };

  const categoryOptions = [
    { value: "overall", label: "Overall Budget" },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Budget</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{getMonthName(currentMonth)}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Set Budget
        </Button>
      </div>

      {monthBudgets.length === 0 ? (
        <EmptyState icon="💰" title="No budgets set" description="Set a monthly budget to track your spending" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {monthBudgets.map((b) => {
            const spent = getCategorySpent(b.category);
            const pct = Math.min((spent / b.amount) * 100, 100);
            const statusColor = getStatusColor(spent, b.amount);
            const isOverall = b.category === "overall";
            const cat = isOverall ? null : catMap[b.category];

            return (
              <Card key={b.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{isOverall ? "💳" : cat?.icon || "📦"}</span>
                    <h3 className="font-medium text-[var(--card-foreground)]">
                      {isOverall ? "Overall Budget" : cat?.name || b.category}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteBudget(b.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2">
                      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      Spent: {formatCurrency(spent, currency)}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
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
                    <span style={{ color: statusColor }} className="font-medium">
                      {pct.toFixed(0)}% used
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      {formatCurrency(Math.max(b.amount - spent, 0), currency)} remaining
                    </span>
                  </div>
                  {spent >= b.amount && (
                    <div className="mt-2 rounded-lg bg-[var(--destructive)]/10 px-3 py-2 text-xs font-medium text-[var(--destructive)]">
                      Budget exceeded!
                    </div>
                  )}
                  {spent >= b.amount * 0.8 && spent < b.amount && (
                    <div className="mt-2 rounded-lg bg-[var(--warning)]/10 px-3 py-2 text-xs font-medium text-[var(--warning)]">
                      Warning: 80% of budget reached
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
