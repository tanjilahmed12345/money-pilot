import { Transaction, Currency } from "@/types";

export function formatCurrency(amount: number, currency: Currency): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency}${formatted}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthName(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpense(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getThisMonthTransactions(
  transactions: Transaction[]
): Transaction[] {
  const currentMonth = getCurrentMonth();
  return transactions.filter((t) => t.date.startsWith(currentMonth));
}

export function getThisMonthExpense(transactions: Transaction[]): number {
  return getTotalExpense(getThisMonthTransactions(transactions));
}

export function getCategoryExpenses(
  transactions: Transaction[]
): Record<string, number> {
  const expenses: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenses[t.category] = (expenses[t.category] || 0) + t.amount;
    });
  return expenses;
}

export function getMonthlyData(
  transactions: Transaction[]
): { month: string; income: number; expense: number }[] {
  const map: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((t) => {
    if (t.type === "transfer") return;
    const month = t.date.substring(0, 7);
    if (!map[month]) map[month] = { income: 0, expense: 0 };
    map[month][t.type] += t.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
}

export function getDailyExpenses(
  transactions: Transaction[],
  yearMonth: string
): Record<number, number> {
  const daily: Record<number, number> = {};
  transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(yearMonth))
    .forEach((t) => {
      const day = new Date(t.date).getDate();
      daily[day] = (daily[day] || 0) + t.amount;
    });
  return daily;
}

export function getLastMonthTransactions(
  transactions: Transaction[]
): Transaction[] {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prefix = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
  return transactions.filter((t) => t.date.startsWith(prefix));
}

export function getPercentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

export function getMonthlyIncome(transactions: Transaction[]): number {
  return getTotalIncome(getThisMonthTransactions(transactions));
}

export function getLastMonthIncome(transactions: Transaction[]): number {
  return getTotalIncome(getLastMonthTransactions(transactions));
}

export function getLastMonthExpense(transactions: Transaction[]): number {
  return getTotalExpense(getLastMonthTransactions(transactions));
}

export function getSavingsRate(income: number, expense: number): number {
  if (income <= 0) return 0;
  return ((income - expense) / income) * 100;
}

export function getTopCategories(
  transactions: Transaction[],
  limit: number = 5
): { categoryId: string; amount: number }[] {
  const expenses = getCategoryExpenses(transactions);
  return Object.entries(expenses)
    .map(([categoryId, amount]) => ({ categoryId, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function getStats(transactions: Transaction[]) {
  const expenses = transactions.filter((t) => t.type === "expense");
  const thisMonth = getThisMonthTransactions(transactions).filter((t) => t.type === "expense");

  const daysInCurrentMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const currentDay = new Date().getDate();

  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const monthExpense = thisMonth.reduce((s, t) => s + t.amount, 0);
  const avgDaily = currentDay > 0 ? monthExpense / currentDay : 0;
  const highestExpense = expenses.length > 0
    ? expenses.reduce((max, t) => (t.amount > max.amount ? t : max), expenses[0])
    : null;

  return {
    totalTransactions: transactions.length,
    totalExpenseCount: expenses.length,
    avgDailySpend: avgDaily,
    projectedMonthly: avgDaily * daysInCurrentMonth,
    highestExpense,
  };
}

export function transactionsToCSV(transactions: Transaction[]): string {
  const header = "ID,Title,Amount,Type,Category,Date,Notes";
  const rows = transactions.map(
    (t) =>
      `"${t.id}","${t.title}",${t.amount},"${t.type}","${t.category}","${t.date}","${t.notes.replace(/"/g, '""')}"`
  );
  return [header, ...rows].join("\n");
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}
