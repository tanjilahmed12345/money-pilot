"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useStore } from "@/store";
import { useShallowStore } from "@/hooks/useShallowStore";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import {
  formatCurrency, getTotalIncome, getTotalExpense,
  getCategoryExpenses, getTopCategories, getMonthName, getSavingsRate,
} from "@/utils";

type ViewMode = "month" | "year";

function getAvailableMonths(dates: string[]): string[] {
  const set = new Set(dates.map((d) => d.substring(0, 7)));
  return Array.from(set).sort().reverse();
}

function getAvailableYears(dates: string[]): string[] {
  const set = new Set(dates.map((d) => d.substring(0, 4)));
  return Array.from(set).sort().reverse();
}

export default function ReportsPage() {
  const { transactions, categories, currency } = useShallowStore((s) => ({
    transactions: s.transactions,
    categories: s.categories,
    currency: s.settings.currency,
  }));
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = String(now.getFullYear());

  const [mode, setMode] = useState<ViewMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [exporting, setExporting] = useState(false);

  const dates = useMemo(() => transactions.map((t) => t.date), [transactions]);
  const months = useMemo(() => getAvailableMonths(dates), [dates]);
  const years = useMemo(() => getAvailableYears(dates), [dates]);

  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );

  const filtered = useMemo(() => {
    const prefix = mode === "month" ? selectedMonth : selectedYear;
    return transactions.filter((t) => t.date.startsWith(prefix));
  }, [transactions, mode, selectedMonth, selectedYear]);

  const report = useMemo(() => {
    const income = getTotalIncome(filtered);
    const expense = getTotalExpense(filtered);
    const savings = income - expense;
    const savingsRate = getSavingsRate(income, expense);
    const topCategories = getTopCategories(filtered, 5);
    const expenses = filtered.filter((t) => t.type === "expense");
    const biggest = expenses.length > 0
      ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])
      : null;
    const txCount = filtered.length;

    return { income, expense, savings, savingsRate, topCategories, biggest, txCount };
  }, [filtered]);

  const periodLabel = mode === "month"
    ? getMonthName(selectedMonth)
    : selectedYear;

  const handleExportPdf = useCallback(async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#ffffff",
        useCORS: true,
      } as Parameters<typeof html2canvas>[1]);

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`MoneyPilot-Report-${mode === "month" ? selectedMonth : selectedYear}.pdf`);
      toast("Report exported as PDF");
    } catch {
      toast("Failed to export PDF", "error");
    }
    setExporting(false);
  }, [mode, selectedMonth, selectedYear, toast]);

  const monthOptions = months.length > 0
    ? months.map((m) => ({ value: m, label: getMonthName(m) }))
    : [{ value: currentMonth, label: getMonthName(currentMonth) }];

  const yearOptions = years.length > 0
    ? years.map((y) => ({ value: y, label: y }))
    : [{ value: currentYear, label: currentYear }];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Reports</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Financial summaries and PDF export</p>
        </div>
        <Button onClick={handleExportPdf} disabled={exporting || filtered.length === 0}>
          {exporting ? "Exporting..." : "Export PDF"}
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1">
          {(["month", "year"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {m === "month" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
        {mode === "month" ? (
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} options={monthOptions} />
        ) : (
          <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} options={yearOptions} />
        )}
      </div>

      {/* Report content — print-friendly, white bg, no shadows */}
      <div
        ref={reportRef}
        className="bg-white text-gray-900 rounded-lg border border-[var(--border)] overflow-hidden"
        style={{ colorScheme: "light" }}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">MoneyPilot Financial Report</h2>
              <p className="text-sm text-gray-500 mt-1">{periodLabel} · {report.txCount} transactions</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-gray-400">No transactions for this period</p>
          </div>
        ) : (
          <div className="px-8 py-6 space-y-8">
            {/* Key metrics */}
            <div id="key-metrics" className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              <div id="total-income">
                <p className="text-xs font-medium text-gray-500 uppercase">Total Income</p>
                <p className="mt-1 text-lg sm:text-2xl font-bold text-green-600 tabular-nums truncate">
                  {formatCurrency(report.income, currency)}
                </p>
              </div>
              <div id="total-expenses">
                <p className="text-xs font-medium text-gray-500 uppercase">Total Expenses</p>
                <p className="mt-1 text-lg sm:text-2xl font-bold text-red-600 tabular-nums truncate">
                  {formatCurrency(report.expense, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Savings</p>
                <p className={`mt-1 text-lg sm:text-2xl font-bold tabular-nums truncate ${report.savings >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(Math.abs(report.savings), currency)}
                  {report.savings < 0 && " (deficit)"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Savings Rate</p>
                <p className={`mt-1 text-lg sm:text-2xl font-bold ${report.savingsRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {report.savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Top 5 spending categories */}
            <div id="top-categories">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Top Spending Categories</h3>
              {report.topCategories.length === 0 ? (
                <p className="text-sm text-gray-400">No expense data</p>
              ) : (
                <div className="space-y-3">
                  {report.topCategories.map(({ categoryId, amount }, i) => {
                    const cat = catMap[categoryId];
                    const pct = report.expense > 0 ? (amount / report.expense) * 100 : 0;
                    return (
                      <div key={categoryId} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                        <span className="text-lg">{cat?.icon || "📦"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-800">
                              {cat?.name || categoryId}
                            </span>
                            <span className="text-sm font-bold text-gray-900 tabular-nums">
                              {formatCurrency(amount, currency)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: cat?.color || "#6b7280" }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{pct.toFixed(1)}% of expenses</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Biggest transaction */}
            {report.biggest && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Biggest Single Expense</h3>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{catMap[report.biggest.category]?.icon || "📦"}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{report.biggest.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(report.biggest.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}
                        {catMap[report.biggest.category]?.name || report.biggest.category}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-red-600 tabular-nums">
                    {formatCurrency(report.biggest.amount, currency)}
                  </span>
                </div>
              </div>
            )}

            {/* Income vs Expense summary bar */}
            <div id="income-vs-expenses">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Income vs Expenses</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Income</span>
                    <span className="tabular-nums">{formatCurrency(report.income, currency)}</span>
                  </div>
                  <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${report.income > 0 ? 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Expenses</span>
                    <span className="tabular-nums">{formatCurrency(report.expense, currency)}</span>
                  </div>
                  <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: `${report.income > 0 ? Math.min((report.expense / report.income) * 100, 100) : 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            MoneyPilot · Personal Finance Dashboard · {periodLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
