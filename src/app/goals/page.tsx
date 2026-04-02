"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store";
import { useShallowStore } from "@/hooks/useShallowStore";
import { SavingsGoal } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { formatCurrency, formatDate } from "@/utils";
import { useToast } from "@/components/ui/Toast";

function getDaysRemaining(deadline: string): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getMonthsRemaining(deadline: string): number | null {
  if (!deadline) return null;
  const now = new Date();
  const end = new Date(deadline);
  return (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()) + (end.getDate() >= now.getDate() ? 0 : -1);
}

function getRequiredMonthly(remaining: number, deadline: string): number | null {
  const months = getMonthsRemaining(deadline);
  if (months === null || months <= 0) return null;
  return remaining / months;
}

function getEstimatedCompletion(remaining: number, monthlySavingsRate: number): string | null {
  if (monthlySavingsRate <= 0 || remaining <= 0) return null;
  const months = Math.ceil(remaining / monthlySavingsRate);
  const est = new Date();
  est.setMonth(est.getMonth() + months);
  return est.toISOString().split("T")[0];
}

export default function GoalsPage() {
  const { savingsGoals, categories, transactions, currency } = useShallowStore((s) => ({
    savingsGoals: s.savingsGoals,
    categories: s.categories,
    transactions: s.transactions,
    currency: s.settings.currency,
  }));
  const addSavingsGoal = useStore((s) => s.addSavingsGoal);
  const updateSavingsGoal = useStore((s) => s.updateSavingsGoal);
  const deleteSavingsGoal = useStore((s) => s.deleteSavingsGoal);
  const addToSavings = useStore((s) => s.addToSavings);
  const withdrawFromSavings = useStore((s) => s.withdrawFromSavings);
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [fundModal, setFundModal] = useState<SavingsGoal | null>(null);
  const [editItem, setEditItem] = useState<SavingsGoal | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [deadline, setDeadline] = useState("");
  const [linkedCategory, setLinkedCategory] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [fundAction, setFundAction] = useState<"add" | "withdraw">("add");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estimate monthly savings rate from last 3 months of income - expense
  const monthlySavingsRate = useMemo(() => {
    const now = new Date();
    let totalSaved = 0;
    let months = 0;
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthTx = transactions.filter((t) => t.date.startsWith(prefix));
      if (monthTx.length === 0) continue;
      const inc = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      totalSaved += inc - exp;
      months++;
    }
    return months > 0 ? Math.max(totalSaved / months, 0) : 0;
  }, [transactions]);

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const openAdd = () => {
    setEditItem(null);
    setName("");
    setTargetAmount("");
    setIcon("");
    setColor("#3b82f6");
    setDeadline("");
    setLinkedCategory("");
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
    setLinkedCategory(g.category || "");
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
      category: linkedCategory || undefined,
    };
    if (editItem) {
      updateSavingsGoal(editItem.id, data);
      toast("Goal updated");
    } else {
      addSavingsGoal(data);
      toast("Goal created");
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
      toast("Funds added");
    } else {
      withdrawFromSavings(fundModal.id, Number(fundAmount));
      toast("Funds withdrawn");
    }
    setFundModal(null);
  };

  const categoryOptions = [
    { value: "", label: "None (unlinked)" },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Goal
        </Button>
      </div>

      {/* Summary Cards */}
      {savingsGoals.length > 0 && (
        <div id="goals-summary" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card id="total-saved">
            <p className="text-sm text-[var(--muted-foreground)]">Total Saved</p>
            <p className="mt-1 text-xl font-bold text-[var(--success)] tabular-nums">{formatCurrency(totalSaved, currency)}</p>
          </Card>
          <Card id="total-target">
            <p className="text-sm text-[var(--muted-foreground)]">Total Target</p>
            <p className="mt-1 text-xl font-bold text-[var(--primary)] tabular-nums">{formatCurrency(totalTarget, currency)}</p>
          </Card>
          <Card id="overall-progress">
            <p className="text-sm text-[var(--muted-foreground)]">Overall Progress</p>
            <p className="mt-1 text-xl font-bold text-[var(--foreground)]">
              {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}%
            </p>
          </Card>
          <Card id="avg-savings">
            <p className="text-sm text-[var(--muted-foreground)]">Avg Monthly Savings</p>
            <p className="mt-1 text-xl font-bold text-[var(--foreground)] tabular-nums">
              {formatCurrency(monthlySavingsRate, currency)}
            </p>
          </Card>
        </div>
      )}

      {savingsGoals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No savings goals yet"
          description="Set a financial target — vacation, emergency fund, new gadget — and track your progress"
          action={{ label: "Create Goal", onClick: openAdd }}
        />
      ) : (
        <div id="goals-list" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {savingsGoals.map((g) => {
            const pct = Math.min((g.savedAmount / g.targetAmount) * 100, 100);
            const isComplete = g.savedAmount >= g.targetAmount;
            const remaining = Math.max(g.targetAmount - g.savedAmount, 0);
            const daysLeft = getDaysRemaining(g.deadline);
            const isOverdue = daysLeft !== null && daysLeft < 0 && !isComplete;
            const requiredMonthly = getRequiredMonthly(remaining, g.deadline);
            const estCompletion = getEstimatedCompletion(remaining, monthlySavingsRate);
            const behindPace = requiredMonthly !== null && monthlySavingsRate > 0 && requiredMonthly > monthlySavingsRate;
            const linkedCat = g.category ? catMap[g.category] : null;

            return (
              <Card key={g.id} className={isComplete ? "border-[var(--success)]/40" : ""}>
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Progress Ring */}
                  <ProgressRing
                    percent={pct}
                    size={64}
                    strokeWidth={6}
                    color={isComplete ? "var(--success)" : g.color}
                  >
                    <span className="text-sm font-bold text-[var(--card-foreground)]">
                      {pct.toFixed(0)}%
                    </span>
                  </ProgressRing>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{g.icon}</span>
                          <p className="font-semibold text-[var(--card-foreground)]">{g.name}</p>
                        </div>
                        {linkedCat && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            {linkedCat.icon} {linkedCat.name}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(g)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { deleteSavingsGoal(g.id); toast("Goal deleted"); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-lg font-bold tabular-nums" style={{ color: isComplete ? "var(--success)" : g.color }}>
                        {formatCurrency(g.savedAmount, currency)}
                      </span>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        / {formatCurrency(g.targetAmount, currency)}
                      </span>
                    </div>

                    {/* Deadline & countdown */}
                    {g.deadline && (
                      <div className="mt-2">
                        {isComplete ? (
                          <p className="text-xs font-medium text-[var(--success)]">Goal reached!</p>
                        ) : isOverdue ? (
                          <p className="text-xs font-medium text-[var(--destructive)]">
                            Overdue by {Math.abs(daysLeft!)} day{Math.abs(daysLeft!) !== 1 ? "s" : ""}
                          </p>
                        ) : (
                          <p className="text-xs text-[var(--muted-foreground)]">
                            <span className="font-medium text-[var(--card-foreground)]">{daysLeft} day{daysLeft !== 1 ? "s" : ""}</span> remaining · {formatDate(g.deadline)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Pace message */}
                    {!isComplete && remaining > 0 && (
                      <div className="mt-2 space-y-1">
                        {behindPace && requiredMonthly !== null && (
                          <p className="text-xs font-medium text-[var(--warning)]">
                            You need to save {formatCurrency(requiredMonthly, currency)}/month to hit your goal
                          </p>
                        )}
                        {!behindPace && requiredMonthly !== null && monthlySavingsRate > 0 && (
                          <p className="text-xs text-[var(--success)]">
                            On pace — saving {formatCurrency(monthlySavingsRate, currency)}/month
                          </p>
                        )}
                        {estCompletion && !g.deadline && (
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Est. completion: {formatDate(estCompletion)}
                          </p>
                        )}
                        {estCompletion && g.deadline && (
                          <p className="text-xs text-[var(--muted-foreground)]">
                            At current rate: {formatDate(estCompletion)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fund actions */}
                <div className="flex gap-2 pt-3 mt-3 border-t border-[var(--border)]">
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => openFund(g, "add")}>
                    + Add Funds
                  </Button>
                  {g.savedAmount > 0 && (
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => openFund(g, "withdraw")}>
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

          <Input label="Target Date (optional)" id="goal-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

          <Select
            label="Linked Category (optional)"
            id="goal-category"
            value={linkedCategory}
            onChange={(e) => setLinkedCategory(e.target.value)}
            options={categoryOptions}
          />

          <Input label="Icon (emoji)" id="goal-icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g., 🏖️" />
          {errors.icon && <p className="text-xs text-[var(--destructive)] -mt-3">{errors.icon}</p>}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded border-0" />
              <span className="text-sm text-[var(--muted-foreground)]">{color}</span>
            </div>
          </div>

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
