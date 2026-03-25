import { RecurringTransaction } from "@/types";

export function calcNextDueDate(
  frequency: RecurringTransaction["frequency"],
  fromDate?: string
): string {
  const base = fromDate ? new Date(fromDate) : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If the base date is in the future, return it
  const baseNorm = new Date(base);
  baseNorm.setHours(0, 0, 0, 0);
  if (baseNorm >= today) return base.toISOString().split("T")[0];

  // Roll forward from base until we reach today or future
  const d = new Date(base);
  while (d < today) {
    switch (frequency) {
      case "daily": d.setDate(d.getDate() + 1); break;
      case "weekly": d.setDate(d.getDate() + 7); break;
      case "monthly": d.setMonth(d.getMonth() + 1); break;
      case "yearly": d.setFullYear(d.getFullYear() + 1); break;
    }
  }
  return d.toISOString().split("T")[0];
}

export function advanceDueDate(
  frequency: RecurringTransaction["frequency"],
  currentDue: string
): string {
  const d = new Date(currentDue);
  switch (frequency) {
    case "daily": d.setDate(d.getDate() + 1); break;
    case "weekly": d.setDate(d.getDate() + 7); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "yearly": d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split("T")[0];
}

export function isDueToday(nextDue?: string): boolean {
  if (!nextDue) return false;
  return nextDue === new Date().toISOString().split("T")[0];
}

export function isOverdue(nextDue?: string): boolean {
  if (!nextDue) return false;
  return nextDue < new Date().toISOString().split("T")[0];
}

export function daysUntilDue(nextDue?: string): number | null {
  if (!nextDue) return null;
  const diff = new Date(nextDue).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const TAG_COLORS: Record<string, string> = {
  subscription: "#8b5cf6",
  bill: "#f59e0b",
  income: "#22c55e",
  other: "#6b7280",
};

export const TAG_LABELS: Record<string, string> = {
  subscription: "Subscription",
  bill: "Bill",
  income: "Income",
  other: "Other",
};
