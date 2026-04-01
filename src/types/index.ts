export type TransactionType = "income" | "expense" | "transfer";

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
export type ThemeMode = "light" | "dark" | "system";

export interface Settings {
  theme: ThemeMode;
  currency: Currency;
}

export type RecurringTag = "subscription" | "bill" | "income" | "other";

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  notes: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate?: string;
  nextDueDate?: string;
  paused?: boolean;
  tag?: RecurringTag;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  color: string;
  icon: string;
  deadline: string; // ISO date string
  category?: string; // linked savings category id
}

export type AssetType = "bank" | "investment" | "property" | "cash" | "other";
export type LiabilityType = "loan" | "credit_card" | "mortgage" | "other";

export interface Asset {
  id: string;
  name: string;
  amount: number;
  type: AssetType;
  icon: string;
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  type: LiabilityType;
  icon: string;
}

export interface NetWorthSnapshot {
  month: string; // YYYY-MM
  assets: number;
  liabilities: number;
  netWorth: number;
}

export type LendBorrowType = "lent" | "borrowed";

export interface LendBorrowTransaction {
  id: string;
  person: string;
  amount: number;
  type: LendBorrowType;
  method: string;
  date: string;
  note: string;
}

export interface FilterState {
  search: string;
  type: TransactionType | "all";
  category: string;
  categories: string[];
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  sortBy: "date" | "amount";
  sortOrder: "asc" | "desc";
  source: "all" | "regular" | "lend-borrow";
}
