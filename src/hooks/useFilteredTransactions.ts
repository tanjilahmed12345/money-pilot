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
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    if (filters.type !== "all") {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.category) {
      result = result.filter((t) => t.category === filters.category);
    }

    if (filters.dateFrom) {
      result = result.filter((t) => t.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      result = result.filter((t) => t.date <= filters.dateTo);
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
