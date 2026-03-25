"use client";

import { useStore } from "@/store";
import { FilterState } from "@/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface TransactionFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const categories = useStore((s) => s.categories);

  const update = (partial: Partial<FilterState>) =>
    onChange({ ...filters, ...partial });

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ];

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search transactions..."
        value={filters.search}
        onChange={(e) => update({ search: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <Select
          value={filters.type}
          onChange={(e) => update({ type: e.target.value as FilterState["type"] })}
          options={[
            { value: "all", label: "All types" },
            { value: "income", label: "Income" },
            { value: "expense", label: "Expense" },
            { value: "transfer", label: "Transfer" },
          ]}
        />
        <Select
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
          options={categoryOptions}
        />
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update({ dateFrom: e.target.value })}
          placeholder="From"
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update({ dateTo: e.target.value })}
          placeholder="To"
        />
        <Select
          value={filters.sortBy}
          onChange={(e) => update({ sortBy: e.target.value as "date" | "amount" })}
          options={[
            { value: "date", label: "Sort by date" },
            { value: "amount", label: "Sort by amount" },
          ]}
        />
        <Select
          value={filters.sortOrder}
          onChange={(e) => update({ sortOrder: e.target.value as "asc" | "desc" })}
          options={[
            { value: "desc", label: "Descending" },
            { value: "asc", label: "Ascending" },
          ]}
        />
      </div>
    </div>
  );
}
