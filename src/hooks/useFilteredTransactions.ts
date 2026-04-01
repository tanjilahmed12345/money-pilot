"use client";

import { useMemo } from "react";
import { Transaction, FilterState } from "@/types";

export function useFilteredTransactions(
  transactions: Transaction[],
  filters: FilterState
) {
  return useMemo(() => {
    let result = [...transactions];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)
      );
    }

    if (filters.source === "lend-borrow") {
      result = result.filter((t) => t.notes.includes("(Lend & Borrow)"));
    } else if (filters.source === "regular") {
      result = result.filter((t) => !t.notes.includes("(Lend & Borrow)"));
    }

    if (filters.type !== "all") {
      result = result.filter((t) => t.type === filters.type);
    }

    // Multi-category filter (takes precedence over single category)
    if (filters.categories.length > 0) {
      const catSet = new Set(filters.categories);
      result = result.filter((t) => catSet.has(t.category));
    } else if (filters.category) {
      result = result.filter((t) => t.category === filters.category);
    }

    if (filters.dateFrom) {
      result = result.filter((t) => t.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      result = result.filter((t) => t.date <= filters.dateTo);
    }

    if (filters.amountMin) {
      const min = Number(filters.amountMin);
      if (!isNaN(min)) result = result.filter((t) => t.amount >= min);
    }

    if (filters.amountMax) {
      const max = Number(filters.amountMax);
      if (!isNaN(max)) result = result.filter((t) => t.amount <= max);
    }

    result.sort((a, b) => {
      const order = filters.sortOrder === "asc" ? 1 : -1;
      if (filters.sortBy === "date") {
        return (a.date.localeCompare(b.date)) * order;
      }
      return (a.amount - b.amount) * order;
    });

    return result;
  }, [transactions, filters]);
}
