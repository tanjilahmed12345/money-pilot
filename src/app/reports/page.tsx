"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useShallowStore } from "@/hooks/useShallowStore";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import {
  formatCurrency, getTotalIncome, getTotalExpense,
  getCategoryExpenses, getTopCategories, getMonthName, getSavingsRate,
} from "@/utils";

type ViewMode = "month" | "year";
type ExportFormat = "pdf" | "png" | "jpg" | "webp";

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
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

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
    const allExpenses = getCategoryExpenses(filtered);
    const categoryCount = Object.keys(allExpenses).length;
    const expenses = filtered.filter((t) => t.type === "expense");
    const biggest = expenses.length > 0
      ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])
      : null;
    const txCount = filtered.length;
    const avgPerTx = expenses.length > 0 ? expense / expenses.length : 0;

    return { income, expense, savings, savingsRate, topCategories, biggest, txCount, categoryCount, avgPerTx };
  }, [filtered]);

  const periodLabel = mode === "month" ? getMonthName(selectedMonth) : selectedYear;
  const fileName = `MoneyPilot-Report-${mode === "month" ? selectedMonth : selectedYear}`;

  const handleExport = useCallback(async (format: ExportFormat) => {
    if (!reportRef.current) return;
    setExporting(true);
    setExportMenuOpen(false);
    try {
      const { toPng, toJpeg } = await import("html-to-image");

      const options = {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      };

      if (format === "pdf") {
        const dataUrl = await toPng(reportRef.current, options);

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jspdfMod: any = await import("jspdf");
        const JsPDF = jspdfMod.jsPDF || jspdfMod.default;

        const imgWidth = 210; // A4 mm
        const imgHeight = (img.height * imgWidth) / img.width;
        const pdf = new JsPDF("p", "mm", "a4");
        const pageHeight = 297;

        if (imgHeight <= pageHeight) {
          pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
        } else {
          let position = 0;
          while (position < imgHeight) {
            if (position > 0) pdf.addPage();
            pdf.addImage(dataUrl, "PNG", 0, -position, imgWidth, imgHeight);
            position += pageHeight;
          }
        }
        pdf.save(`${fileName}.pdf`);
      } else if (format === "jpg") {
        const dataUrl = await toJpeg(reportRef.current, options);
        downloadDataUrl(dataUrl, `${fileName}.jpg`);
      } else if (format === "webp") {
        // html-to-image doesn't have toWebp, so capture as PNG canvas then convert
        const dataUrl = await toPng(reportRef.current, options);
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const webpUrl = canvas.toDataURL("image/webp", 0.92);
        downloadDataUrl(webpUrl, `${fileName}.webp`);
      } else {
        const dataUrl = await toPng(reportRef.current, options);
        downloadDataUrl(dataUrl, `${fileName}.png`);
      }

      toast(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("Export error:", err);
      toast("Export failed. Please try again.", "error");
    }
    setExporting(false);
  }, [fileName, toast]);

  function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const monthOptions = months.length > 0
    ? months.map((m) => ({ value: m, label: getMonthName(m) }))
    : [{ value: currentMonth, label: getMonthName(currentMonth) }];

  const yearOptions = years.length > 0
    ? years.map((y) => ({ value: y, label: y }))
    : [{ value: currentYear, label: currentYear }];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-end">
        {/* Export dropdown */}
        <div ref={exportMenuRef} className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            disabled={exporting || filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {exporting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </>
            )}
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]">
              <p className="px-3 py-2 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide border-b border-[var(--border)]">
                Export as
              </p>
              {([
                { format: "pdf" as ExportFormat, label: "PDF Document", icon: "📄" },
                { format: "png" as ExportFormat, label: "PNG Image", icon: "🖼️" },
                { format: "jpg" as ExportFormat, label: "JPG Image", icon: "📸" },
                { format: "webp" as ExportFormat, label: "WebP Image", icon: "🌐" },
              ]).map(({ format, label, icon }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                  <span className="ml-auto text-[11px] font-medium text-[var(--muted-foreground)] uppercase">.{format}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
          {(["month", "year"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
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

      {/* Quick stat cards */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Total Income</p>
            <p className="mt-1 text-xl font-bold text-[var(--success)] tabular-nums truncate">{formatCurrency(report.income, currency)}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Total Expenses</p>
            <p className="mt-1 text-xl font-bold text-[var(--destructive)] tabular-nums truncate">{formatCurrency(report.expense, currency)}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Net Savings</p>
            <p className={`mt-1 text-xl font-bold tabular-nums truncate ${report.savings >= 0 ? "text-[var(--success)]" : "text-[var(--destructive)]"}`}>
              {report.savings < 0 ? "-" : ""}{formatCurrency(Math.abs(report.savings), currency)}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Savings Rate</p>
            <p className={`mt-1 text-xl font-bold ${report.savingsRate >= 0 ? "text-[var(--success)]" : "text-[var(--destructive)]"}`}>
              {report.savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Exportable report content */}
      <div
        ref={reportRef}
        className="bg-white text-gray-900 rounded-xl border border-[var(--border)] overflow-hidden"
        style={{ colorScheme: "light" }}
      >
        {/* Report header */}
        <div className="px-6 sm:px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg">
                M
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Financial Report</h2>
                <p className="text-sm text-gray-500">{periodLabel}</p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-400">
              <p>{report.txCount} transactions</p>
              <p>Generated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-8 py-20 text-center">
            <svg className="mx-auto mb-3 text-gray-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
            </svg>
            <p className="text-gray-400 font-medium">No transactions for this period</p>
            <p className="text-gray-300 text-sm mt-1">Select a different month or year</p>
          </div>
        ) : (
          <div className="px-6 sm:px-8 py-6 space-y-8">
            {/* Summary grid */}
            <div id="key-metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg bg-green-50 p-4" id="total-income">
                <p className="text-[11px] font-semibold text-green-600/70 uppercase tracking-wide">Income</p>
                <p className="mt-1.5 text-lg sm:text-xl font-bold text-green-700 tabular-nums truncate">{formatCurrency(report.income, currency)}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4" id="total-expenses">
                <p className="text-[11px] font-semibold text-red-600/70 uppercase tracking-wide">Expenses</p>
                <p className="mt-1.5 text-lg sm:text-xl font-bold text-red-700 tabular-nums truncate">{formatCurrency(report.expense, currency)}</p>
              </div>
              <div className={`rounded-lg p-4 ${report.savings >= 0 ? "bg-emerald-50" : "bg-orange-50"}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${report.savings >= 0 ? "text-emerald-600/70" : "text-orange-600/70"}`}>
                  {report.savings >= 0 ? "Savings" : "Deficit"}
                </p>
                <p className={`mt-1.5 text-lg sm:text-xl font-bold tabular-nums truncate ${report.savings >= 0 ? "text-emerald-700" : "text-orange-700"}`}>
                  {formatCurrency(Math.abs(report.savings), currency)}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-[11px] font-semibold text-blue-600/70 uppercase tracking-wide">Avg / Expense</p>
                <p className="mt-1.5 text-lg sm:text-xl font-bold text-blue-700 tabular-nums truncate">{formatCurrency(report.avgPerTx, currency)}</p>
              </div>
            </div>

            {/* Income vs Expense bar */}
            <div id="income-vs-expenses">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Income vs Expenses</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span className="font-medium">Income</span>
                    <span className="font-semibold text-gray-700 tabular-nums">{formatCurrency(report.income, currency)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500" style={{ width: `${report.income > 0 ? 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span className="font-medium">Expenses</span>
                    <span className="font-semibold text-gray-700 tabular-nums">{formatCurrency(report.expense, currency)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500" style={{ width: `${report.income > 0 ? Math.min((report.expense / report.income) * 100, 100) : 100}%` }} />
                  </div>
                </div>
                {report.savings > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span className="font-medium">Saved</span>
                      <span className="font-semibold text-gray-700 tabular-nums">{formatCurrency(report.savings, currency)} ({report.savingsRate.toFixed(1)}%)</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500" style={{ width: `${Math.min(report.savingsRate, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top spending categories */}
            <div id="top-categories">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Top Spending Categories</h3>
              {report.topCategories.length === 0 ? (
                <p className="text-sm text-gray-400">No expense data</p>
              ) : (
                <div className="space-y-3">
                  {report.topCategories.map(({ categoryId, amount }, i) => {
                    const cat = catMap[categoryId];
                    const pct = report.expense > 0 ? (amount / report.expense) * 100 : 0;
                    return (
                      <div key={categoryId} className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: `${cat?.color || "#6b7280"}15` }}>
                          {cat?.icon || "📦"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-800">{cat?.name || categoryId}</span>
                            <div className="text-right">
                              <span className="text-sm font-bold text-gray-900 tabular-nums">{formatCurrency(amount, currency)}</span>
                              <span className="ml-2 text-[11px] text-gray-400">{pct.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: cat?.color || "#6b7280" }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Biggest single expense */}
            {report.biggest && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Biggest Single Expense</h3>
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg text-lg" style={{ backgroundColor: `${catMap[report.biggest.category]?.color || "#6b7280"}15` }}>
                      {catMap[report.biggest.category]?.icon || "📦"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{report.biggest.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(report.biggest.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" · "}{catMap[report.biggest.category]?.name || report.biggest.category}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-red-600 tabular-nums shrink-0 ml-3">
                    {formatCurrency(report.biggest.amount, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-gray-200 bg-gray-50/80">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>MoneyPilot · Personal Finance Dashboard</span>
            <span>{periodLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
