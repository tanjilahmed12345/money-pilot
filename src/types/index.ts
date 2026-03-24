export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO date string
  notes: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Budget {
  id: string;
  category: string; // category id or "overall"
  amount: number;
  month: string; // YYYY-MM
}

export type Currency = "৳" | "$" | "€";
export type ThemeMode = "light" | "dark";

export interface Settings {
  theme: ThemeMode;
  currency: Currency;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  notes: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  color: string;
  icon: string;
  deadline: string; // ISO date string
}

export interface FilterState {
  search: string;
  type: TransactionType | "all";
  category: string;
  dateFrom: string;
  dateTo: string;
  sortBy: "date" | "amount";
  sortOrder: "asc" | "desc";
}
