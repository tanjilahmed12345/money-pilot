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
import { api } from "@/lib/api";

// Fire-and-forget helper — logs errors but doesn't block the UI
function sync(fn: () => Promise<unknown>) {
  fn().catch((err) => console.error("[sync]", err));
}

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

interface MerchantMapSlice {
  merchantMap: Record<string, string>;
  setMerchantCategory: (merchant: string, categoryId: string) => void;
  deleteMerchantMapping: (merchant: string) => void;
}

interface AiSummarySlice {
  aiSummary: {
    text: string;
    generatedAt: string;
    transactionCount: number;
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

interface HydrationSlice {
  _dbHydrated: boolean;
  hydrateFromDb: () => Promise<void>;
}

type Store = TransactionSlice &
  CategorySlice &
  BudgetSlice &
  RecurringSlice &
  SavingsSlice &
  NetWorthSlice &
  MerchantMapSlice &
  AiSummarySlice &
  SettingsSlice &
  HydrationSlice & {
    resetAll: () => void;
  };

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // ─── DB Hydration ───────────────────────────────────────
      _dbHydrated: false,
      hydrateFromDb: async () => {
        try {
          const data = await api.fetchAll();
          set({
            transactions: data.transactions,
            categories: data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES,
            budgets: data.budgets,
            recurringTransactions: data.recurringTransactions,
            savingsGoals: data.savingsGoals,
            assets: data.assets,
            liabilities: data.liabilities,
            netWorthSnapshots: data.netWorthSnapshots,
            merchantMap: data.merchantMap,
            settings: data.settings ?? DEFAULT_SETTINGS,
            aiSummary: data.aiSummary,
            _dbHydrated: true,
          });
        } catch (err) {
          console.error("[hydrateFromDb] Failed, using local data:", err);
          set({ _dbHydrated: true });
        }
      },

      // ─── Transactions ──────────────────────────────────────
      transactions: [],
      addTransaction: (t) => {
        const id = uuidv4();
        const tx = { ...t, id };
        set((state) => ({ transactions: [tx, ...state.transactions] }));
        sync(() => api.transactions.create(tx));
      },
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
        sync(() => api.transactions.update(id, updates));
      },
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        sync(() => api.transactions.delete(id));
      },
      clearTransactions: () => {
        set({ transactions: [] });
        sync(() => api.transactions.clear());
      },
      importTransactions: (transactions) => {
        set((state) => ({
          transactions: [...transactions, ...state.transactions],
        }));
        sync(() => api.transactions.import(transactions));
      },

      // ─── Categories ────────────────────────────────────────
      categories: DEFAULT_CATEGORIES,
      addCategory: (c) => {
        const id = uuidv4();
        const cat = { ...c, id };
        set((state) => ({ categories: [...state.categories, cat] }));
        sync(() => api.categories.create(cat));
      },
      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
        sync(() => api.categories.update(id, updates));
      },
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        sync(() => api.categories.delete(id));
      },
      resetCategories: () => {
        set({ categories: DEFAULT_CATEGORIES });
        sync(() => api.categories.reset());
      },

      // ─── Budgets ───────────────────────────────────────────
      budgets: [],
      setBudget: (category, amount, month) => {
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
        });
        sync(() => api.budgets.set(category, amount, month));
      },
      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
        sync(() => api.budgets.delete(id));
      },
      clearBudgets: () => {
        set({ budgets: [] });
        sync(() => api.budgets.clear());
      },

      // ─── Recurring Transactions ────────────────────────────
      recurringTransactions: [],
      addRecurring: (r) => {
        const id = uuidv4();
        const rec = { ...r, id };
        set((state) => ({
          recurringTransactions: [...state.recurringTransactions, rec],
        }));
        sync(() => api.recurring.create(rec));
      },
      updateRecurring: (id, updates) => {
        set((state) => ({
          recurringTransactions: state.recurringTransactions.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
        sync(() => api.recurring.update(id, updates));
      },
      deleteRecurring: (id) => {
        set((state) => ({
          recurringTransactions: state.recurringTransactions.filter(
            (r) => r.id !== id
          ),
        }));
        sync(() => api.recurring.delete(id));
      },

      // ─── Savings Goals ─────────────────────────────────────
      savingsGoals: [],
      addSavingsGoal: (g) => {
        const id = uuidv4();
        const goal = { ...g, id };
        set((state) => ({
          savingsGoals: [...state.savingsGoals, goal],
        }));
        sync(() => api.savingsGoals.create(goal));
      },
      updateSavingsGoal: (id, updates) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));
        sync(() => api.savingsGoals.update(id, updates));
      },
      deleteSavingsGoal: (id) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        }));
        sync(() => api.savingsGoals.delete(id));
      },
      addToSavings: (id, amount) => {
        const goal = get().savingsGoals.find((g) => g.id === id);
        if (!goal) return;
        const newAmount = goal.savedAmount + amount;
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, savedAmount: newAmount } : g
          ),
        }));
        sync(() => api.savingsGoals.update(id, { savedAmount: newAmount }));
      },
      withdrawFromSavings: (id, amount) => {
        const goal = get().savingsGoals.find((g) => g.id === id);
        if (!goal) return;
        const newAmount = Math.max(0, goal.savedAmount - amount);
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, savedAmount: newAmount } : g
          ),
        }));
        sync(() => api.savingsGoals.update(id, { savedAmount: newAmount }));
      },

      // ─── Net Worth ─────────────────────────────────────────
      assets: [],
      liabilities: [],
      netWorthSnapshots: [],
      addAsset: (a) => {
        const id = uuidv4();
        const asset = { ...a, id };
        set((state) => ({ assets: [...state.assets, asset] }));
        sync(() => api.assets.create(asset));
      },
      updateAsset: (id, updates) => {
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
        sync(() => api.assets.update(id, updates));
      },
      deleteAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        }));
        sync(() => api.assets.delete(id));
      },
      addLiability: (l) => {
        const id = uuidv4();
        const liability = { ...l, id };
        set((state) => ({ liabilities: [...state.liabilities, liability] }));
        sync(() => api.liabilities.create(liability));
      },
      updateLiability: (id, updates) => {
        set((state) => ({
          liabilities: state.liabilities.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        }));
        sync(() => api.liabilities.update(id, updates));
      },
      deleteLiability: (id) => {
        set((state) => ({
          liabilities: state.liabilities.filter((l) => l.id !== id),
        }));
        sync(() => api.liabilities.delete(id));
      },
      takeSnapshot: (month) => {
        const state = get();
        const totalAssets = state.assets.reduce((s, a) => s + a.amount, 0);
        const totalLiabilities = state.liabilities.reduce(
          (s, l) => s + l.amount,
          0
        );
        const snapshot: NetWorthSnapshot = {
          month,
          assets: totalAssets,
          liabilities: totalLiabilities,
          netWorth: totalAssets - totalLiabilities,
        };
        set((state) => {
          const existing = state.netWorthSnapshots.findIndex(
            (s) => s.month === month
          );
          if (existing >= 0) {
            const updated = [...state.netWorthSnapshots];
            updated[existing] = snapshot;
            return { netWorthSnapshots: updated };
          }
          return {
            netWorthSnapshots: [...state.netWorthSnapshots, snapshot].sort(
              (a, b) => a.month.localeCompare(b.month)
            ),
          };
        });
        sync(() => api.netWorthSnapshots.take(snapshot));
      },

      // ─── Merchant Map ──────────────────────────────────────
      merchantMap: {},
      setMerchantCategory: (merchant, categoryId) => {
        const key = merchant.toLowerCase().trim();
        set((state) => ({
          merchantMap: { ...state.merchantMap, [key]: categoryId },
        }));
        sync(() => api.merchantMap.set(merchant, categoryId));
      },
      deleteMerchantMapping: (merchant) => {
        const key = merchant.toLowerCase().trim();
        set((state) => {
          const next = { ...state.merchantMap };
          delete next[key];
          return { merchantMap: next };
        });
        sync(() => api.merchantMap.delete(merchant));
      },

      // ─── AI Summary ────────────────────────────────────────
      aiSummary: null,
      setAiSummary: (summary) => {
        set({ aiSummary: summary });
        sync(() => api.aiSummary.save(summary));
      },
      clearAiSummary: () => {
        set({ aiSummary: null });
        sync(() => api.aiSummary.clear());
      },

      // ─── Settings ──────────────────────────────────────────
      settings: DEFAULT_SETTINGS,
      setTheme: (theme) => {
        set((state) => ({ settings: { ...state.settings, theme } }));
        sync(() => api.settings.update({ theme }));
      },
      setCurrency: (currency) => {
        set((state) => ({ settings: { ...state.settings, currency } }));
        sync(() => api.settings.update({ currency }));
      },
      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
        sync(() => api.settings.update(DEFAULT_SETTINGS));
      },

      // ─── Reset All ─────────────────────────────────────────
      resetAll: () => {
        set({
          transactions: [],
          categories: DEFAULT_CATEGORIES,
          budgets: [],
          recurringTransactions: [],
          savingsGoals: [],
          assets: [],
          liabilities: [],
          netWorthSnapshots: [],
          merchantMap: {},
          aiSummary: null,
          settings: DEFAULT_SETTINGS,
        });
        sync(() => api.resetAll());
      },
    }),
    {
      name: "money-pilot-storage",
    }
  )
);
