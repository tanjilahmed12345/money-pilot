import type {
  Transaction,
  Category,
  Budget,
  RecurringTransaction,
  SavingsGoal,
  Asset,
  Liability,
  NetWorthSnapshot,
  Settings,
  LendBorrowTransaction,
} from "@/types";

const BASE = "/api";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

// ─── Bulk Data (hydration) ─────────────────────────────────

export interface AllData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  savingsGoals: SavingsGoal[];
  assets: Asset[];
  liabilities: Liability[];
  netWorthSnapshots: NetWorthSnapshot[];
  merchantMap: Record<string, string>;
  settings: Settings;
  aiSummary: { text: string; generatedAt: string; transactionCount: number } | null;
  lendBorrowTransactions: LendBorrowTransaction[];
}

export const api = {
  // ─── Hydration ────────────────────────────────────────────
  fetchAll: () => request<AllData>("/data"),

  // ─── Transactions ─────────────────────────────────────────
  transactions: {
    list: () => request<Transaction[]>("/transactions"),
    create: (data: Transaction) =>
      request<Transaction>("/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Transaction>) =>
      request<Transaction>(`/transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/transactions/${id}`, { method: "DELETE" }),
    clear: () => request("/transactions", { method: "DELETE" }),
    import: (transactions: Transaction[]) =>
      request<{ count: number }>("/transactions/import", {
        method: "POST",
        body: JSON.stringify(transactions),
      }),
  },

  // ─── Categories ───────────────────────────────────────────
  categories: {
    list: () => request<Category[]>("/categories"),
    create: (data: Category) =>
      request<Category>("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Category>) =>
      request<Category>(`/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/categories/${id}`, { method: "DELETE" }),
    reset: () =>
      request<Category[]>("/categories/reset", { method: "POST" }),
  },

  // ─── Budgets ──────────────────────────────────────────────
  budgets: {
    list: () => request<Budget[]>("/budgets"),
    set: (category: string, amount: number, month: string) =>
      request<Budget>("/budgets", {
        method: "POST",
        body: JSON.stringify({ category, amount, month }),
      }),
    delete: (id: string) =>
      request(`/budgets/${id}`, { method: "DELETE" }),
    clear: () => request("/budgets", { method: "DELETE" }),
  },

  // ─── Recurring Transactions ───────────────────────────────
  recurring: {
    list: () => request<RecurringTransaction[]>("/recurring"),
    create: (data: RecurringTransaction) =>
      request<RecurringTransaction>("/recurring", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<RecurringTransaction>) =>
      request<RecurringTransaction>(`/recurring/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/recurring/${id}`, { method: "DELETE" }),
  },

  // ─── Savings Goals ────────────────────────────────────────
  savingsGoals: {
    list: () => request<SavingsGoal[]>("/savings-goals"),
    create: (data: SavingsGoal) =>
      request<SavingsGoal>("/savings-goals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<SavingsGoal>) =>
      request<SavingsGoal>(`/savings-goals/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/savings-goals/${id}`, { method: "DELETE" }),
  },

  // ─── Assets ───────────────────────────────────────────────
  assets: {
    list: () => request<Asset[]>("/assets"),
    create: (data: Asset) =>
      request<Asset>("/assets", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Asset>) =>
      request<Asset>(`/assets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/assets/${id}`, { method: "DELETE" }),
  },

  // ─── Liabilities ──────────────────────────────────────────
  liabilities: {
    list: () => request<Liability[]>("/liabilities"),
    create: (data: Liability) =>
      request<Liability>("/liabilities", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Liability>) =>
      request<Liability>(`/liabilities/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/liabilities/${id}`, { method: "DELETE" }),
  },

  // ─── Net Worth Snapshots ──────────────────────────────────
  netWorthSnapshots: {
    list: () => request<NetWorthSnapshot[]>("/net-worth-snapshots"),
    take: (data: { month: string; assets: number; liabilities: number; netWorth: number }) =>
      request<NetWorthSnapshot>("/net-worth-snapshots", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // ─── Merchant Map ─────────────────────────────────────────
  merchantMap: {
    list: () => request<Record<string, string>>("/merchant-map"),
    set: (merchant: string, categoryId: string) =>
      request("/merchant-map", {
        method: "POST",
        body: JSON.stringify({ merchant, categoryId }),
      }),
    delete: (merchant: string) =>
      request("/merchant-map", {
        method: "DELETE",
        body: JSON.stringify({ merchant }),
      }),
  },

  // ─── Settings ─────────────────────────────────────────────
  settings: {
    get: () => request<Settings>("/settings"),
    update: (data: Partial<Settings>) =>
      request<Settings>("/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // ─── AI Summary ───────────────────────────────────────────
  aiSummary: {
    get: () => request<{ text: string; generatedAt: string; transactionCount: number } | null>("/ai-summary"),
    save: (data: { text: string; generatedAt: string; transactionCount: number }) =>
      request("/ai-summary", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    clear: () => request("/ai-summary", { method: "DELETE" }),
  },

  // ─── Lend & Borrow ────────────────────────────────────────
  lendBorrow: {
    list: () => request<LendBorrowTransaction[]>("/lend-borrow"),
    create: (data: LendBorrowTransaction) =>
      request<LendBorrowTransaction>("/lend-borrow", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<LendBorrowTransaction>) =>
      request<LendBorrowTransaction>(`/lend-borrow/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/lend-borrow/${id}`, { method: "DELETE" }),
  },

  // ─── Reset ────────────────────────────────────────────────
  resetAll: () => request("/reset", { method: "POST" }),
};
