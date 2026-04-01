"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store";

// ─── Search Index ────────────────────────────────────────────
const SEARCH_INDEX = [
  { label: "Budget Alerts", page: "Dashboard", href: "/dashboard#budget-alerts" },
  { label: "Spending Anomaly Alerts", page: "Dashboard", href: "/dashboard#spending-anomalies" },
  { label: "Total Balance", page: "Dashboard", href: "/dashboard#stat-cards" },
  { label: "Monthly Income", page: "Dashboard", href: "/dashboard#stat-cards" },
  { label: "Monthly Expenses", page: "Dashboard", href: "/dashboard#stat-cards" },
  { label: "Savings Rate", page: "Dashboard", href: "/dashboard#stat-cards" },
  { label: "Recent Transactions", page: "Dashboard", href: "/dashboard#recent-transactions" },
  { label: "AI Spending Insight", page: "Dashboard", href: "/dashboard#ai-insight" },
  { label: "Spending Breakdown", page: "Dashboard", href: "/dashboard#spending-breakdown" },
  { label: "Transactions", page: "Transactions", href: "/transactions" },
  { label: "Transaction Filters", page: "Transactions", href: "/transactions#transaction-filters" },
  { label: "Analytics Overview", page: "Analytics", href: "/analytics" },
  { label: "Category-wise Expenses", page: "Analytics", href: "/analytics#category-expenses" },
  { label: "Spending Trend", page: "Analytics", href: "/analytics#spending-trend" },
  { label: "Budget", page: "Budget", href: "/budget" },
  { label: "Recurring Transactions", page: "Recurring", href: "/recurring" },
  { label: "Savings Goals", page: "Goals", href: "/goals" },
  { label: "Net Worth", page: "Net Worth", href: "/net-worth" },
  { label: "Calendar", page: "Calendar", href: "/calendar" },
  { label: "Reports", page: "Reports", href: "/reports" },
  { label: "Export PDF", page: "Reports", href: "/reports" },
  { label: "Import Transactions", page: "Import CSV", href: "/import" },
  { label: "Settings", page: "Settings", href: "/settings" },
  { label: "Theme", page: "Settings", href: "/settings#appearance" },
  { label: "Currency", page: "Settings", href: "/settings#appearance" },
  { label: "Categories", page: "Settings", href: "/settings#categories-section" },
  { label: "Data Management", page: "Settings", href: "/settings#data-management" },
];

function searchIndex(query: string) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const matches = SEARCH_INDEX.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.page.toLowerCase().includes(q)
  );
  const seen = new Map<string, { label: string; locations: { page: string; href: string }[] }>();
  for (const m of matches) {
    if (!seen.has(m.label)) seen.set(m.label, { label: m.label, locations: [] });
    const entry = seen.get(m.label)!;
    if (!entry.locations.some((l) => l.href === m.href)) {
      entry.locations.push({ page: m.page, href: m.href });
    }
  }
  return Array.from(seen.values()).slice(0, 8);
}

// ─── Page title from path ────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/analytics": "Analytics",
  "/budget": "Budget",
  "/recurring": "Recurring",
  "/goals": "Goals",
  "/net-worth": "Net Worth",
  "/calendar": "Calendar",
  "/reports": "Reports",
  "/import": "Import CSV",
  "/settings": "Settings",
};

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

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const isDark = useIsDark();
  const setTheme = useStore((s) => s.setTheme);
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const results = searchIndex(query);
  const pageTitle = PAGE_TITLES[pathname] || "MoneyPilot";

  // Fetch user info
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.user && setUser(d.user))
      .catch(() => {});
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setUserMenuOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const [path, hash] = href.split("#");
      router.push(path);
      setQuery("");
      setOpen(false);
      setActiveIndex(-1);
      if (hash) {
        const scrollToHash = () => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.style.outline = "2px solid var(--primary)";
            el.style.outlineOffset = "4px";
            el.style.borderRadius = "12px";
            el.style.transition = "outline-color 1.5s ease";
            setTimeout(() => {
              el.style.outlineColor = "transparent";
              setTimeout(() => { el.style.outline = ""; el.style.outlineOffset = ""; el.style.borderRadius = ""; el.style.transition = ""; }, 500);
            }, 1500);
          }
        };
        setTimeout(scrollToHash, 100);
        setTimeout(scrollToHash, 300);
      }
    },
    [router]
  );

  const flatItems = results.flatMap((r) =>
    r.locations.map((loc) => ({ label: r.label, ...loc }))
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && activeIndex >= 0 && flatItems[activeIndex]) { e.preventDefault(); navigate(flatItems[activeIndex].href); }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-20 flex items-center h-16 px-4 sm:px-6 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-lg">
      {/* Left: Mobile menu + Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden shrink-0 p-2 -ml-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-[var(--foreground)] truncate">{pageTitle}</h1>
      </div>

      {/* Center: Search */}
      <div ref={dropdownRef} className="relative flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1); }}
            onFocus={() => query && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 py-2 pl-9 pr-20 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/40 focus:bg-[var(--card)] transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
            Ctrl K
          </kbd>
        </div>

        {/* Search Results */}
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-[var(--border)]">
              <p className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Results</p>
            </div>
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-40">
                          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <span className="flex-1 truncate font-medium">{result.label}</span>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          idx === activeIndex
                            ? "bg-white/20 text-[var(--primary-foreground)]"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                        }`}>
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

        {open && query.trim() && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl p-4 text-center text-sm text-[var(--muted-foreground)]">
            No results for &ldquo;{query}&rdquo;
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        {/* Mobile search trigger */}
        <button
          onClick={() => { inputRef.current?.focus(); setOpen(true); }}
          className="sm:hidden p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
          aria-label="Search"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </button>

        {/* User menu */}
        <div ref={userMenuRef} className="relative ml-1">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--accent)] transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white text-xs font-semibold">
              {initials}
            </div>
            <span className="hidden md:block text-sm font-medium text-[var(--foreground)] max-w-[120px] truncate">
              {user?.name || "Account"}
            </span>
            <svg className="hidden md:block text-[var(--muted-foreground)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl overflow-hidden animate-[fadeIn_0.15s_ease-out]">
              {/* User info */}
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user?.name || "User"}</p>
                <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{user?.email || ""}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => { setUserMenuOpen(false); router.push("/settings"); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Settings
                </button>

                <div className="my-1 border-t border-[var(--border)]" />

                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/auth";
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
