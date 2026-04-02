"use client";

import { useState } from "react";
import { useShallowStore } from "@/hooks/useShallowStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, getDaysInMonth, getFirstDayOfMonth, formatDate } from "@/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { transactions, categories, currency } = useShallowStore((s) => ({
    transactions: s.transactions,
    categories: s.categories,
    currency: s.settings.currency,
  }));

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const yearMonth = `${year}-${String(month).padStart(2, "0")}`;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const txByDay: Record<number, typeof transactions> = {};
  transactions
    .filter((t) => t.date.startsWith(yearMonth))
    .forEach((t) => {
      const day = new Date(t.date).getDate();
      if (!txByDay[day]) txByDay[day] = [];
      txByDay[day].push(t);
    });

  const expByDay: Record<number, number> = {};
  const dominantColorByDay: Record<number, string> = {};
  Object.entries(txByDay).forEach(([day, txs]) => {
    const expenses = txs.filter((t) => t.type === "expense");
    expByDay[Number(day)] = expenses.reduce((sum, t) => sum + t.amount, 0);
    // Find the category with the highest spend for this day
    const catTotals: Record<string, number> = {};
    expenses.forEach((t) => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      dominantColorByDay[Number(day)] = catMap[topCat[0]]?.color || "#6b7280";
    }
  });

  const prev = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const next = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const monthName = new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const selectedTx = selectedDate
    ? transactions.filter((t) => t.date === selectedDate)
    : [];

  return (
    <div className="space-y-6">
      <Card id="calendar-view">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={prev}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Button>
          <h2 className="text-lg font-semibold text-[var(--card-foreground)]">{monthName}</h2>
          <Button variant="ghost" onClick={next}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-[var(--muted-foreground)]">
              {d}
            </div>
          ))}

          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${yearMonth}-${String(day).padStart(2, "0")}`;
            const exp = expByDay[day] || 0;
            const hasTx = txByDay[day] && txByDay[day].length > 0;
            const isToday =
              day === now.getDate() &&
              month === now.getMonth() + 1 &&
              year === now.getFullYear();

            return (
              <button
                key={day}
                onClick={() => hasTx && setSelectedDate(dateStr)}
                className={`relative flex flex-col items-center rounded-lg p-1 sm:p-2 text-xs sm:text-sm transition-colors ${
                  isToday
                    ? "bg-[var(--primary)]/10 font-bold text-[var(--primary)]"
                    : "hover:bg-[var(--accent)]"
                } ${hasTx ? "cursor-pointer" : "cursor-default"}`}
              >
                <span>{day}</span>
                {exp > 0 && (
                  <span className="mt-0.5 text-[10px] font-medium text-[var(--destructive)]">
                    {currency}{exp >= 1000 ? `${(exp / 1000).toFixed(1)}k` : exp.toFixed(0)}
                  </span>
                )}
                {hasTx && (
                  <span
                    className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: dominantColorByDay[day] || "var(--primary)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Modal
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? `Transactions - ${formatDate(selectedDate)}` : ""}
      >
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {selectedTx.map((t) => {
            const cat = catMap[t.category];
            return (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                    style={{ backgroundColor: `${cat?.color || "#6b7280"}15` }}
                  >
                    {cat?.icon || "📦"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--card-foreground)]">{t.title}</p>
                    {cat && <Badge color={cat.color}>{cat.name}</Badge>}
                  </div>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: t.type === "transfer" ? "var(--primary)" : t.type === "income" ? "var(--success)" : "var(--destructive)" }}
                >
                  {t.type === "transfer" ? "↔ " : t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, currency)}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
