"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { SavingsGoal } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/utils";

export default function GoalsPage() {
  const {
    savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    addToSavings, withdrawFromSavings, settings,
  } = useStore();
  const currency = settings.currency;

  const [modalOpen, setModalOpen] = useState(false);
  const [fundModal, setFundModal] = useState<SavingsGoal | null>(null);
  const [editItem, setEditItem] = useState<SavingsGoal | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [deadline, setDeadline] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [fundAction, setFundAction] = useState<"add" | "withdraw">("add");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  const openAdd = () => {
    setEditItem(null);
    setName("");
    setTargetAmount("");
    setIcon("");
    setColor("#3b82f6");
    setDeadline("");
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (g: SavingsGoal) => {
    setEditItem(g);
    setName(g.name);
    setTargetAmount(String(g.targetAmount));
    setIcon(g.icon);
    setColor(g.color);
    setDeadline(g.deadline);
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!targetAmount || Number(targetAmount) <= 0) e.target = "Target must be positive";
    if (!icon.trim()) e.icon = "Icon is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = {
      name: name.trim(),
      targetAmount: Number(targetAmount),
      savedAmount: editItem ? editItem.savedAmount : 0,
      icon: icon.trim(),
      color,
      deadline,
    };
    if (editItem) {
      updateSavingsGoal(editItem.id, data);
    } else {
      addSavingsGoal(data);
    }
    setModalOpen(false);
  };

  const openFund = (g: SavingsGoal, action: "add" | "withdraw") => {
    setFundModal(g);
    setFundAction(action);
    setFundAmount("");
  };

  const handleFund = () => {
    if (!fundModal || !fundAmount || Number(fundAmount) <= 0) return;
    if (fundAction === "add") {
      addToSavings(fundModal.id, Number(fundAmount));
    } else {
      withdrawFromSavings(fundModal.id, Number(fundAmount));
    }
    setFundModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Savings Goals</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Track progress toward your financial targets</p>
        </div>
        <Button onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Goal
        </Button>
      </div>

      {/* Summary Cards */}
      {savingsGoals.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-[var(--muted-foreground)]">Total Saved</p>
            <p className="mt-1 text-xl font-bold text-[var(--success)]">{formatCurrency(totalSaved, currency)}</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--muted-foreground)]">Total Target</p>
            <p className="mt-1 text-xl font-bold text-[var(--primary)]">{formatCurrency(totalTarget, currency)}</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--muted-foreground)]">Overall Progress</p>
            <p className="mt-1 text-xl font-bold text-[var(--foreground)]">
              {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}%
            </p>
          </Card>
        </div>
      )}

      {savingsGoals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No savings goals yet"
          description="Set a financial target — vacation, emergency fund, new gadget — and track your progress"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {savingsGoals.map((g) => {
            const pct = Math.min((g.savedAmount / g.targetAmount) * 100, 100);
            const isComplete = g.savedAmount >= g.targetAmount;
            const remaining = Math.max(g.targetAmount - g.savedAmount, 0);
            const isOverdue = g.deadline && new Date(g.deadline) < new Date() && !isComplete;

            return (
              <Card key={g.id} className={isComplete ? "border-[var(--success)]/40" : ""}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{ backgroundColor: `${g.color}15` }}
                    >
                      {g.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--card-foreground)]">{g.name}</p>
                      {g.deadline && (
                        <p className={`text-xs mt-0.5 ${isOverdue ? "text-[var(--destructive)] font-medium" : "text-[var(--muted-foreground)]"}`}>
                          {isOverdue ? "Overdue" : "Deadline"}: {formatDate(g.deadline)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(g)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteSavingsGoal(g.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      {formatCurrency(g.savedAmount, currency)}
                    </span>
                    <span className="font-medium text-[var(--card-foreground)]">
                      {formatCurrency(g.targetAmount, currency)}
                    </span>
                  </div>
                  <div className="h-4 rounded-full bg-[var(--secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isComplete ? "var(--success)" : g.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: isComplete ? "var(--success)" : g.color }} className="font-medium">
                      {pct.toFixed(1)}% {isComplete && "- Goal reached!"}
                    </span>
                    {!isComplete && (
                      <span className="text-[var(--muted-foreground)]">
                        {formatCurrency(remaining, currency)} to go
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => openFund(g, "add")}
                  >
                    + Add Funds
                  </Button>
                  {g.savedAmount > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => openFund(g, "withdraw")}
                    >
                      - Withdraw
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Goal Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Goal" : "New Savings Goal"}>
        <div className="space-y-4">
          <Input label="Goal Name" id="goal-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Vacation Fund" />
          {errors.name && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.name}</p>}

          <Input label="Target Amount" id="goal-target" type="number" min="0" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0.00" />
          {errors.target && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.target}</p>}

          <Input label="Icon (emoji)" id="goal-icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g., 🏖️" />
          {errors.icon && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.icon}</p>}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded border-0" />
              <span className="text-sm text-[var(--muted-foreground)]">{color}</span>
            </div>
          </div>

          <Input label="Deadline (optional)" id="goal-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">{editItem ? "Update" : "Create"} Goal</Button>
          </div>
        </div>
      </Modal>

      {/* Fund Modal */}
      <Modal
        open={!!fundModal}
        onClose={() => setFundModal(null)}
        title={fundAction === "add" ? `Add Funds to ${fundModal?.name}` : `Withdraw from ${fundModal?.name}`}
      >
        <div className="space-y-4">
          {fundModal && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Current: {formatCurrency(fundModal.savedAmount, currency)} / {formatCurrency(fundModal.targetAmount, currency)}
            </p>
          )}
          <Input
            label="Amount"
            id="fund-amount"
            type="number"
            min="0"
            step="0.01"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            placeholder="0.00"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setFundModal(null)} className="flex-1">Cancel</Button>
            <Button
              variant={fundAction === "add" ? "primary" : "danger"}
              onClick={handleFund}
              className="flex-1"
            >
              {fundAction === "add" ? "Add" : "Withdraw"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
