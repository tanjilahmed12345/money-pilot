import { Transaction, Category } from "@/types";
import { getCurrentMonth } from "@/utils";

export interface SpendingAnomaly {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  currentSpend: number;
  avgSpend: number;
  percentAbove: number;
}

/**
 * Detect spending anomalies: categories where current month spending
 * is more than 30% above the 3-month average.
 * Runs reactively whenever transactions change (zustand subscription).
 */
export function detectAnomalies(
  transactions: Transaction[],
  categories: Category[]
): SpendingAnomaly[] {
  const currentMonth = getCurrentMonth();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  // Get the 3 previous months
  const prevMonths: string[] = [];
  const now = new Date();
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    prevMonths.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  // Current month spending by category
  const currentByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
    .forEach((t) => {
      currentByCategory[t.category] = (currentByCategory[t.category] || 0) + t.amount;
    });

  // Average of previous 3 months by category
  const prevByCategory: Record<string, number[]> = {};
  for (const month of prevMonths) {
    const monthExpenses: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(month))
      .forEach((t) => {
        monthExpenses[t.category] = (monthExpenses[t.category] || 0) + t.amount;
      });
    // Record each category's total for this month
    for (const catId of Object.keys({ ...monthExpenses, ...currentByCategory })) {
      if (!prevByCategory[catId]) prevByCategory[catId] = [];
      prevByCategory[catId].push(monthExpenses[catId] || 0);
    }
  }

  const anomalies: SpendingAnomaly[] = [];

  for (const [catId, currentSpend] of Object.entries(currentByCategory)) {
    const prevAmounts = prevByCategory[catId] || [];
    if (prevAmounts.length === 0) continue; // No history to compare

    const avg = prevAmounts.reduce((s, v) => s + v, 0) / prevAmounts.length;
    if (avg === 0) continue; // Can't calculate % above zero

    const percentAbove = ((currentSpend - avg) / avg) * 100;

    if (percentAbove > 30) {
      const cat = catMap[catId];
      anomalies.push({
        categoryId: catId,
        categoryName: cat?.name || catId,
        categoryIcon: cat?.icon || "📦",
        categoryColor: cat?.color || "#6b7280",
        currentSpend,
        avgSpend: avg,
        percentAbove,
      });
    }
  }

  return anomalies.sort((a, b) => b.percentAbove - a.percentAbove);
}

/**
 * Get per-category spending for each of the last N months.
 * Returns data shaped for a multi-line chart.
 */
export function getCategoryMonthlyTrends(
  transactions: Transaction[],
  categories: Category[],
  monthCount: number = 12
): { months: string[]; series: { catId: string; name: string; color: string; data: number[] }[] } {
  const now = new Date();
  const months: string[] = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  // Aggregate expenses per category per month
  const data: Record<string, Record<string, number>> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const month = t.date.substring(0, 7);
      if (!months.includes(month)) return;
      if (!data[t.category]) data[t.category] = {};
      data[t.category][month] = (data[t.category][month] || 0) + t.amount;
    });

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  // Only include categories with at least some spending
  const series = Object.entries(data)
    .filter(([, monthData]) => Object.values(monthData).some((v) => v > 0))
    .map(([catId, monthData]) => ({
      catId,
      name: catMap[catId]?.name || catId,
      color: catMap[catId]?.color || "#6b7280",
      data: months.map((m) => monthData[m] || 0),
    }))
    .sort((a, b) => {
      const totalA = a.data.reduce((s, v) => s + v, 0);
      const totalB = b.data.reduce((s, v) => s + v, 0);
      return totalB - totalA;
    });

  return { months, series };
}
