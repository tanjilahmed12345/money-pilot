import { Category, Settings } from "@/types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-food", name: "Food", color: "#f97316", icon: "🍔" },
  { id: "cat-transport", name: "Transport", color: "#3b82f6", icon: "🚗" },
  { id: "cat-shopping", name: "Shopping", color: "#a855f7", icon: "🛍️" },
  { id: "cat-salary", name: "Salary", color: "#22c55e", icon: "💰" },
  { id: "cat-entertainment", name: "Entertainment", color: "#ec4899", icon: "🎬" },
  { id: "cat-bills", name: "Bills", color: "#ef4444", icon: "📄" },
  { id: "cat-health", name: "Health", color: "#14b8a6", icon: "🏥" },
  { id: "cat-education", name: "Education", color: "#6366f1", icon: "📚" },
  { id: "cat-others", name: "Others", color: "#6b7280", icon: "📦" },
];

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  currency: "৳",
};

export const CURRENCY_OPTIONS = [
  { value: "৳", label: "৳ BDT" },
  { value: "$", label: "$ USD" },
  { value: "€", label: "€ EUR" },
] as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/transactions", label: "Transactions", icon: "ArrowLeftRight" },
  { href: "/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/budget", label: "Budget", icon: "Wallet" },
  { href: "/recurring", label: "Recurring", icon: "Repeat" },
  { href: "/goals", label: "Goals", icon: "Target" },
  { href: "/net-worth", label: "Net Worth", icon: "TrendingUp" },
  { href: "/calendar", label: "Calendar", icon: "CalendarDays" },
  { href: "/reports", label: "Reports", icon: "FileText" },
  { href: "/import", label: "Import CSV", icon: "Upload" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;
