"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";

// Searchable index: every user-visible section mapped to its page
const SEARCH_INDEX = [
  // Dashboard
  { label: "Budget Alerts", page: "Dashboard", href: "/dashboard" },
  { label: "Spending Anomaly Alerts", page: "Dashboard", href: "/dashboard" },
  { label: "Total Balance", page: "Dashboard", href: "/dashboard" },
  { label: "Monthly Income", page: "Dashboard", href: "/dashboard" },
  { label: "Monthly Expenses", page: "Dashboard", href: "/dashboard" },
  { label: "Savings Rate", page: "Dashboard", href: "/dashboard" },
  { label: "Total Transactions", page: "Dashboard", href: "/dashboard" },
  { label: "Avg. Daily Spend", page: "Dashboard", href: "/dashboard" },
  { label: "Projected Monthly", page: "Dashboard", href: "/dashboard" },
  { label: "Highest Expense", page: "Dashboard", href: "/dashboard" },
  { label: "Recent Transactions", page: "Dashboard", href: "/dashboard" },
  { label: "Month vs Last Month", page: "Dashboard", href: "/dashboard" },
  { label: "Top Spending", page: "Dashboard", href: "/dashboard" },
  { label: "AI Spending Insight", page: "Dashboard", href: "/dashboard" },
  { label: "Spending Breakdown", page: "Dashboard", href: "/dashboard" },

  // Transactions
  { label: "Transactions", page: "Transactions", href: "/transactions" },
  { label: "Transaction Filters", page: "Transactions", href: "/transactions" },
  { label: "Add Transaction", page: "Transactions", href: "/transactions" },
  { label: "Edit Transaction", page: "Transactions", href: "/transactions" },

  // Analytics
  { label: "Analytics Overview", page: "Analytics", href: "/analytics" },
  { label: "Spending Anomalies", page: "Analytics", href: "/analytics" },
  { label: "Category-wise Expenses", page: "Analytics", href: "/analytics" },
  { label: "Monthly Overview", page: "Analytics", href: "/analytics" },
  { label: "Spending Trend", page: "Analytics", href: "/analytics" },
  { label: "Category Spending Trends", page: "Analytics", href: "/analytics" },
  { label: "Categories Above Average", page: "Analytics", href: "/analytics" },

  // Budget
  { label: "Budget", page: "Budget", href: "/budget" },
  { label: "Total Budget", page: "Budget", href: "/budget" },
  { label: "Total Spent", page: "Budget", href: "/budget" },
  { label: "Set Budget", page: "Budget", href: "/budget" },
  { label: "Copy Last Month Budget", page: "Budget", href: "/budget" },

  // Recurring
  { label: "Recurring Transactions", page: "Recurring", href: "/recurring" },
  { label: "Est. Monthly Cost", page: "Recurring", href: "/recurring" },
  { label: "Add Recurring Template", page: "Recurring", href: "/recurring" },

  // Goals
  { label: "Savings Goals", page: "Goals", href: "/goals" },
  { label: "Total Saved", page: "Goals", href: "/goals" },
  { label: "Total Target", page: "Goals", href: "/goals" },
  { label: "Overall Progress", page: "Goals", href: "/goals" },
  { label: "Avg Monthly Savings", page: "Goals", href: "/goals" },
  { label: "Add Funds", page: "Goals", href: "/goals" },
  { label: "Withdraw Funds", page: "Goals", href: "/goals" },
  { label: "New Savings Goal", page: "Goals", href: "/goals" },

  // Net Worth
  { label: "Net Worth", page: "Net Worth", href: "/net-worth" },
  { label: "Total Assets", page: "Net Worth", href: "/net-worth" },
  { label: "Total Liabilities", page: "Net Worth", href: "/net-worth" },
  { label: "Net Worth Over Time", page: "Net Worth", href: "/net-worth" },
  { label: "Assets", page: "Net Worth", href: "/net-worth" },
  { label: "Liabilities", page: "Net Worth", href: "/net-worth" },
  { label: "Add Asset", page: "Net Worth", href: "/net-worth" },
  { label: "Add Liability", page: "Net Worth", href: "/net-worth" },

  // Calendar
  { label: "Calendar", page: "Calendar", href: "/calendar" },
  { label: "Daily Expense Calendar", page: "Calendar", href: "/calendar" },

  // Reports
  { label: "Reports", page: "Reports", href: "/reports" },
  { label: "Total Income", page: "Reports", href: "/reports" },
  { label: "Total Expenses", page: "Reports", href: "/reports" },
  { label: "Savings Rate", page: "Reports", href: "/reports" },
  { label: "Top Spending Categories", page: "Reports", href: "/reports" },
  { label: "Biggest Single Expense", page: "Reports", href: "/reports" },
  { label: "Income vs Expenses", page: "Reports", href: "/reports" },
  { label: "Export PDF", page: "Reports", href: "/reports" },

  // Import
  { label: "Import Transactions", page: "Import CSV", href: "/import" },
  { label: "CSV Upload", page: "Import CSV", href: "/import" },
  { label: "Duplicate Detection", page: "Import CSV", href: "/import" },

  // Settings
  { label: "Settings", page: "Settings", href: "/settings" },
  { label: "Appearance", page: "Settings", href: "/settings" },
  { label: "Theme", page: "Settings", href: "/settings" },
  { label: "Currency", page: "Settings", href: "/settings" },
  { label: "Categories", page: "Settings", href: "/settings" },
  { label: "Data Management", page: "Settings", href: "/settings" },
  { label: "Export JSON", page: "Settings", href: "/settings" },
  { label: "Export CSV", page: "Settings", href: "/settings" },
  { label: "Import JSON", page: "Settings", href: "/settings" },
  { label: "Danger Zone", page: "Settings", href: "/settings" },
  { label: "Reset All Data", page: "Settings", href: "/settings" },

  // Cross-page items (present on multiple pages)
  { label: "Savings Rate", page: "Dashboard", href: "/dashboard" },
  { label: "Monthly Expenses", page: "Reports", href: "/reports" },
  { label: "Spending Breakdown", page: "Analytics", href: "/analytics" },
];

// Deduplicate: group by label to find items on multiple pages
function searchIndex(query: string) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  // Find all matches
  const matches = SEARCH_INDEX.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.page.toLowerCase().includes(q)
  );

  // Group by label+href to deduplicate, then group by label to show multi-page
  const seen = new Map<string, { label: string; locations: { page: string; href: string }[] }>();
  for (const m of matches) {
    const key = m.label;
    if (!seen.has(key)) {
      seen.set(key, { label: m.label, locations: [] });
    }
    const entry = seen.get(key)!;
    if (!entry.locations.some((l) => l.href === m.href)) {
      entry.locations.push({ page: m.page, href: m.href });
    }
  }

  return Array.from(seen.values()).slice(0, 8);
}

function useIsDark() {
  const theme = useStore((s) => s.settings.theme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(mql.matches);
      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    setIsDark(theme === "dark");
  }, [theme]);

  return isDark;
}

export function Header() {
  const isDark = useIsDark();
  const setTheme = useStore((s) => s.setTheme);
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = searchIndex(query);

  // Ctrl+K shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      setQuery("");
      setOpen(false);
      setActiveIndex(-1);
    },
    [router]
  );

  // Flatten results for keyboard navigation
  const flatItems = results.flatMap((r) =>
    r.locations.map((loc) => ({ label: r.label, ...loc }))
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0 && flatItems[activeIndex]) {
      e.preventDefault();
      navigate(flatItems[activeIndex].href);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm">
      {/* Search Bar */}
      <div ref={dropdownRef} className="relative flex-1 max-w-md">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => query && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search features..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 pl-9 pr-16 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
            Ctrl K
          </kbd>
        </div>

        {/* Results Dropdown */}
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden">
            {(() => {
              let flatIndex = -1;
              return results.map((result) => (
                <div key={result.label}>
                  {result.locations.map((loc) => {
                    flatIndex++;
                    const idx = flatIndex;
                    return (
                      <button
                        key={`${result.label}-${loc.href}`}
                        onClick={() => navigate(loc.href)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm transition-colors ${
                          idx === activeIndex
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "hover:bg-[var(--accent)]"
                        }`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0 opacity-50"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                        <span className="flex-1 truncate">
                          <span className="font-medium">{result.label}</span>
                        </span>
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
                            idx === activeIndex
                              ? "bg-white/20 text-[var(--primary-foreground)]"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          {loc.page}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        )}

        {/* No results */}
        {open && query.trim() && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg p-4 text-center text-sm text-[var(--muted-foreground)]">
            No features found for &ldquo;{query}&rdquo;
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        style={{ backgroundColor: isDark ? "var(--primary)" : "var(--muted)" }}
      >
        <span
          className="pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ transform: isDark ? "translateX(22px)" : "translateX(4px)" }}
        >
          {isDark ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </span>
      </button>
    </header>
  );
}
