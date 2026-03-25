"use client";

import { useState, useRef, useCallback } from "react";
import { useStore } from "@/store";
import { useShallowStore } from "@/hooks/useShallowStore";
import { TransactionType } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/utils";
import { parseCsv, csvRowsToTransactions, CsvRow } from "@/lib/csv-import";

type Step = "upload" | "preview" | "done";

export default function ImportPage() {
  const { categories, currency } = useShallowStore((s) => ({
    categories: s.categories,
    currency: s.settings.currency,
  }));
  const transactions = useStore((s) => s.transactions);
  const importTransactions = useStore((s) => s.importTransactions);
  const merchantMap = useStore((s) => s.merchantMap);
  const { toast } = useToast();

  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const categoryOptions = categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }));
  const typeOptions: { value: TransactionType; label: string }[] = [
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
    { value: "transfer", label: "Transfer" },
  ];

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setFileName(file.name);
    try {
      const parsed = await parseCsv(file, categories, transactions, merchantMap);
      if (parsed.length === 0) {
        toast("No valid rows found in CSV", "error");
        setParsing(false);
        return;
      }
      setRows(parsed);
      setStep("preview");
    } catch {
      toast("Failed to parse CSV file", "error");
    }
    setParsing(false);
    if (fileRef.current) fileRef.current.value = "";
  }, [categories, transactions, merchantMap, toast]);

  const toggleRow = (id: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const toggleAll = () => {
    const nonDuplicates = rows.filter((r) => !r.isDuplicate);
    const allSelected = nonDuplicates.every((r) => r.selected);
    setRows((prev) => prev.map((r) => r.isDuplicate ? r : { ...r, selected: !allSelected }));
  };

  const updateRowCategory = (id: string, categoryId: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, categoryId } : r));
  };

  const updateRowType = (id: string, type: TransactionType) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, type } : r));
  };

  const handleImport = () => {
    const selected = rows.filter((r) => r.selected);
    if (selected.length === 0) {
      toast("No rows selected", "error");
      return;
    }

    const txData = csvRowsToTransactions(rows);
    // importTransactions expects full Transaction objects with id
    const txWithIds = txData.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
    }));
    importTransactions(txWithIds);
    toast(`${selected.length} transaction${selected.length !== 1 ? "s" : ""} imported`);
    setStep("done");
  };

  const reset = () => {
    setStep("upload");
    setRows([]);
    setFileName("");
  };

  const selectedCount = rows.filter((r) => r.selected).length;
  const duplicateCount = rows.filter((r) => r.isDuplicate).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Import Transactions</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Import transactions from a CSV bank statement
        </p>
      </div>

      {step === "upload" && (
        <Card>
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] py-16 px-4 text-center transition-colors hover:border-[var(--primary)]/50 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <span className="text-4xl mb-3">📄</span>
            <p className="text-sm font-medium text-[var(--foreground)]">
              {parsing ? "Parsing..." : "Click to upload a CSV file"}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Accepts .csv files from most banks
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-3 max-w-md">
              Expected columns: Date, Description/Merchant, Amount. Columns are auto-detected by header names.
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="hidden"
          />
        </Card>
      )}

      {step === "preview" && (
        <>
          {/* Summary bar */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">File</p>
                  <p className="text-sm font-medium text-[var(--foreground)]">{fileName}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Rows</p>
                  <p className="text-sm font-medium text-[var(--foreground)]">{rows.length}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Selected</p>
                  <p className="text-sm font-medium text-[var(--success)]">{selectedCount}</p>
                </div>
                {duplicateCount > 0 && (
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Duplicates</p>
                    <p className="text-sm font-medium text-[var(--warning)]">{duplicateCount}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={reset}>Cancel</Button>
                <Button onClick={handleImport} disabled={selectedCount === 0}>
                  Import {selectedCount} Transaction{selectedCount !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          </Card>

          {/* Preview table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={rows.filter((r) => !r.isDuplicate).every((r) => r.selected)}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Description</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const cat = catMap[row.categoryId];
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-[var(--border)] transition-colors ${
                          row.isDuplicate ? "opacity-50" : row.selected ? "bg-[var(--card)]" : "opacity-60"
                        }`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => toggleRow(row.id)}
                            disabled={row.isDuplicate}
                            className="rounded"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-[var(--card-foreground)]">
                          {formatDate(row.date)}
                        </td>
                        <td className="px-3 py-2 text-[var(--card-foreground)] max-w-[200px] truncate" title={row.description}>
                          {row.description}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold whitespace-nowrap"
                          style={{ color: row.type === "transfer" ? "var(--primary)" : row.type === "income" ? "var(--success)" : "var(--destructive)" }}
                        >
                          {row.type === "transfer" ? "↔ " : row.type === "income" ? "+" : "-"}{formatCurrency(row.amount, currency)}
                        </td>
                        <td className="px-3 py-2">
                          {!row.isDuplicate ? (
                            <select
                              value={row.type}
                              onChange={(e) => updateRowType(row.id, e.target.value as TransactionType)}
                              className="rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)]"
                            >
                              {typeOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-[var(--muted-foreground)]">{row.type}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {!row.isDuplicate ? (
                            <select
                              value={row.categoryId}
                              onChange={(e) => updateRowCategory(row.id, e.target.value)}
                              className="rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)]"
                            >
                              {categoryOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {cat?.icon} {cat?.name}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {row.isDuplicate ? (
                            <Badge color="#f59e0b">Duplicate</Badge>
                          ) : row.selected ? (
                            <Badge color="#22c55e">Ready</Badge>
                          ) : (
                            <Badge color="#6b7280">Skipped</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {step === "done" && (
        <Card>
          <EmptyState
            icon="✅"
            title="Import complete!"
            description={`${selectedCount} transaction${selectedCount !== 1 ? "s" : ""} imported successfully`}
            action={{ label: "Import Another", onClick: reset }}
          />
        </Card>
      )}
    </div>
  );
}
