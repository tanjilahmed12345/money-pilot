"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import {
  Transaction,
  Category,
  Budget,
  Settings,
  Currency,
  ThemeMode,
  RecurringTransaction,
  SavingsGoal,
  Asset,
  Liability,
  NetWorthSnapshot,
} from "@/types";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "@/lib/constants";

interface TransactionSlice {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;
  importTransactions: (t: Transaction[]) => void;
}

interface CategorySlice {
  categories: Category[];
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  resetCategories: () => void;
}

interface BudgetSlice {
  budgets: Budget[];
  setBudget: (category: string, amount: number, month: string) => void;
  deleteBudget: (id: string) => void;
  clearBudgets: () => void;
}

interface RecurringSlice {
  recurringTransactions: RecurringTransaction[];
  addRecurring: (r: Omit<RecurringTransaction, "id">) => void;
  updateRecurring: (id: string, r: Partial<RecurringTransaction>) => void;
  deleteRecurring: (id: string) => void;
}

interface SavingsSlice {
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (g: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (id: string, g: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addToSavings: (id: string, amount: number) => void;
  withdrawFromSavings: (id: string, amount: number) => void;
}

interface NetWorthSlice {
  assets: Asset[];
  liabilities: Liability[];
  netWorthSnapshots: NetWorthSnapshot[];
  addAsset: (a: Omit<Asset, "id">) => void;
  updateAsset: (id: string, a: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  addLiability: (l: Omit<Liability, "id">) => void;
  updateLiability: (id: string, l: Partial<Liability>) => void;
  deleteLiability: (id: string) => void;
  takeSnapshot: (month: string) => void;
}

interface AiSummarySlice {
  aiSummary: {
    text: string;
    generatedAt: string; // ISO date
    transactionCount: number; // tx count at generation time
  } | null;
  setAiSummary: (summary: { text: string; generatedAt: string; transactionCount: number }) => void;
  clearAiSummary: () => void;
}

interface SettingsSlice {
  settings: Settings;
  setTheme: (theme: ThemeMode) => void;
  setCurrency: (currency: Currency) => void;
  resetSettings: () => void;
}

type Store = TransactionSlice & CategorySlice & BudgetSlice & RecurringSlice & SavingsSlice & NetWorthSlice & AiSummarySlice & SettingsSlice & {
  resetAll: () => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Transactions
      transactions: [],
      addTransaction: (t) =>
        set((state) => ({
          transactions: [{ ...t, id: uuidv4() }, ...state.transactions],
        })),
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      clearTransactions: () => set({ transactions: [] }),
      importTransactions: (transactions) =>
        set((state) => ({
          transactions: [...transactions, ...state.transactions],
        })),

      // Categories
      categories: DEFAULT_CATEGORIES,
      addCategory: (c) =>
        set((state) => ({
          categories: [...state.categories, { ...c, id: uuidv4() }],
        })),
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
      resetCategories: () => set({ categories: DEFAULT_CATEGORIES }),

      // Budgets
      budgets: [],
      setBudget: (category, amount, month) =>
        set((state) => {
          const existing = state.budgets.find(
            (b) => b.category === category && b.month === month
          );
          if (existing) {
            return {
              budgets: state.budgets.map((b) =>
                b.id === existing.id ? { ...b, amount } : b
              ),
            };
          }
          return {
            budgets: [...state.budgets, { id: uuidv4(), category, amount, month }],
          };
        }),
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),
      clearBudgets: () => set({ budgets: [] }),

      // Recurring Transactions
      recurringTransactions: [],
      addRecurring: (r) =>
        set((state) => ({
          recurringTransactions: [...state.recurringTransactions, { ...r, id: uuidv4() }],
        })),
      updateRecurring: (id, updates) =>
        set((state) => ({
          recurringTransactions: state.recurringTransactions.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
      deleteRecurring: (id) =>
        set((state) => ({
          recurringTransactions: state.recurringTransactions.filter((r) => r.id !== id),
        })),

      // Savings Goals
      savingsGoals: [],
      addSavingsGoal: (g) =>
        set((state) => ({
          savingsGoals: [...state.savingsGoals, { ...g, id: uuidv4() }],
        })),
      updateSavingsGoal: (id, updates) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),
      deleteSavingsGoal: (id) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        })),
      addToSavings: (id, amount) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g
          ),
        })),
      withdrawFromSavings: (id, amount) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, savedAmount: Math.max(0, g.savedAmount - amount) } : g
          ),
        })),

      // Net Worth
      assets: [],
      liabilities: [],
      netWorthSnapshots: [],
      addAsset: (a) =>
        set((state) => ({ assets: [...state.assets, { ...a, id: uuidv4() }] })),
      updateAsset: (id, updates) =>
        set((state) => ({ assets: state.assets.map((a) => a.id === id ? { ...a, ...updates } : a) })),
      deleteAsset: (id) =>
        set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),
      addLiability: (l) =>
        set((state) => ({ liabilities: [...state.liabilities, { ...l, id: uuidv4() }] })),
      updateLiability: (id, updates) =>
        set((state) => ({ liabilities: state.liabilities.map((l) => l.id === id ? { ...l, ...updates } : l) })),
      deleteLiability: (id) =>
        set((state) => ({ liabilities: state.liabilities.filter((l) => l.id !== id) })),
      takeSnapshot: (month) =>
        set((state) => {
          const totalAssets = state.assets.reduce((s, a) => s + a.amount, 0);
          const totalLiabilities = state.liabilities.reduce((s, l) => s + l.amount, 0);
          const snapshot: NetWorthSnapshot = {
            month,
            assets: totalAssets,
            liabilities: totalLiabilities,
            netWorth: totalAssets - totalLiabilities,
          };
          const existing = state.netWorthSnapshots.findIndex((s) => s.month === month);
          if (existing >= 0) {
            const updated = [...state.netWorthSnapshots];
            updated[existing] = snapshot;
            return { netWorthSnapshots: updated };
          }
          return { netWorthSnapshots: [...state.netWorthSnapshots, snapshot].sort((a, b) => a.month.localeCompare(b.month)) };
        }),

      // AI Summary
      aiSummary: null,
      setAiSummary: (summary) => set({ aiSummary: summary }),
      clearAiSummary: () => set({ aiSummary: null }),

      // Settings
      settings: DEFAULT_SETTINGS,
      setTheme: (theme) =>
        set((state) => ({ settings: { ...state.settings, theme } })),
      setCurrency: (currency) =>
        set((state) => ({ settings: { ...state.settings, currency } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      // Reset all
      resetAll: () =>
        set({
          transactions: [],
          categories: DEFAULT_CATEGORIES,
          budgets: [],
          recurringTransactions: [],
          savingsGoals: [],
          assets: [],
          liabilities: [],
          netWorthSnapshots: [],
          aiSummary: null,
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: "money-pilot-storage",
    }
  )
);
