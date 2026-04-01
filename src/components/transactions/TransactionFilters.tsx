"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { FilterState } from "@/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface TransactionFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  defaultFilters: FilterState;
}

export function TransactionFilters({ filters, onChange, defaultFilters }: TransactionFiltersProps) {
  const categories = useStore((s) => s.categories);
  const [expanded, setExpanded] = useState(false);

  const update = (partial: Partial<FilterState>) =>
    onChange({ ...filters, ...partial });

  const toggleCategory = (catId: string) => {
    const current = filters.categories;
    const next = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId];
    update({ categories: next, category: "" });
  };

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.categories.length > 0 ||
    filters.category !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.amountMin !== "" ||
    filters.amountMax !== "" ||
    filters.source !== "all";

  const activeFilterCount = [
    filters.type !== "all",
    filters.categories.length > 0 || filters.category !== "",
    filters.dateFrom !== "" || filters.dateTo !== "",
    filters.amountMin !== "" || filters.amountMax !== "",
    filters.source !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search bar + toggle */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            placeholder="Search by merchant name..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors"
          />
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            expanded || hasActiveFilters
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced filter panel */}
      {expanded && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
          {/* Type filter */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-2 block">Type</label>
            <div className="flex gap-2">
              {(["all", "income", "expense", "transfer"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update({ type: t })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    filters.type === t
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category multi-select */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-2 block">
              Categories {filters.categories.length > 0 && `(${filters.categories.length})`}
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = filters.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      active
                        ? "ring-2 ring-offset-1"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor: `${cat.color}20`,
                      color: cat.color,
                      ...(active ? { ringColor: cat.color } : {}),
                    }}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                    {active && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date range */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-2 block">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
          </div>

          {/* Amount range */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-2 block">Amount Range</label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={filters.amountMin}
                onChange={(e) => update({ amountMin: e.target.value })}
                placeholder="Min amount"
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                value={filters.amountMax}
                onChange={(e) => update({ amountMax: e.target.value })}
                placeholder="Max amount"
              />
            </div>
          </div>

          {/* Source filter */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-2 block">Source</label>
            <div className="flex gap-2">
              {([
                { value: "all", label: "All" },
                { value: "regular", label: "Regular" },
                { value: "lend-borrow", label: "Lend & Borrow" },
              ] as const).map((s) => (
                <button
                  key={s.value}
                  onClick={() => update({ source: s.value })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    filters.source === s.value
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-2 block">Sort</label>
            <div className="grid grid-cols-2 gap-3">
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

          {/* Active filters summary + clear */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <div className="flex flex-wrap gap-1.5">
                {filters.type !== "all" && (
                  <Badge color="#2563eb">{filters.type}</Badge>
                )}
                {filters.categories.map((catId) => {
                  const cat = categories.find((c) => c.id === catId);
                  return cat ? <Badge key={catId} color={cat.color}>{cat.icon} {cat.name}</Badge> : null;
                })}
                {(filters.dateFrom || filters.dateTo) && (
                  <Badge color="#6b7280">
                    {filters.dateFrom || "..."} — {filters.dateTo || "..."}
                  </Badge>
                )}
                {(filters.amountMin || filters.amountMax) && (
                  <Badge color="#6b7280">
                    {filters.amountMin || "0"} — {filters.amountMax || "∞"}
                  </Badge>
                )}
                {filters.source !== "all" && (
                  <Badge color="#8b5cf6">
                    {filters.source === "lend-borrow" ? "Lend & Borrow" : "Regular"}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(defaultFilters)}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
