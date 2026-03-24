"use client";

import { useState, useRef } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Currency, ThemeMode, Category } from "@/types";
import { CURRENCY_OPTIONS } from "@/lib/constants";
import { transactionsToCSV, downloadFile } from "@/utils";

export default function SettingsPage() {
  const {
    settings, setTheme, setCurrency, resetAll,
    transactions, importTransactions, budgets,
    categories, addCategory, updateCategory, deleteCategory, resetCategories,
  } = useStore();

  const [confirmReset, setConfirmReset] = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#3b82f6");
  const [catIcon, setCatIcon] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const data = { transactions, categories, budgets, settings };
    downloadFile(JSON.stringify(data, null, 2), "money-pilot-data.json", "application/json");
  };

  const handleExportCSV = () => {
    downloadFile(transactionsToCSV(transactions), "transactions.csv", "text/csv");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.transactions && Array.isArray(data.transactions)) {
          importTransactions(data.transactions);
        }
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAddCat = () => {
    setEditCat(null);
    setCatName("");
    setCatColor("#3b82f6");
    setCatIcon("");
    setCatModal(true);
  };

  const openEditCat = (cat: Category) => {
    setEditCat(cat);
    setCatName(cat.name);
    setCatColor(cat.color);
    setCatIcon(cat.icon);
    setCatModal(true);
  };

  const saveCat = () => {
    if (!catName.trim() || !catIcon.trim()) return;
    if (editCat) {
      updateCategory(editCat.id, { name: catName.trim(), color: catColor, icon: catIcon.trim() });
    } else {
      addCategory({ name: catName.trim(), color: catColor, icon: catIcon.trim() });
    }
    setCatModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Customize your experience</p>
      </div>

      {/* Appearance */}
      <Card>
        <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Appearance</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Theme"
            id="theme"
            value={settings.theme}
            onChange={(e) => setTheme(e.target.value as ThemeMode)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
          <Select
            label="Currency"
            id="currency"
            value={settings.currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            options={CURRENCY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
          />
        </div>
      </Card>

      {/* Categories */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--card-foreground)]">Categories</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={resetCategories}>
              Reset
            </Button>
            <Button size="sm" onClick={openAddCat}>
              Add
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  {cat.icon}
                </span>
                <span className="text-sm font-medium text-[var(--card-foreground)]">{cat.name}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEditCat(cat)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteCategory(cat.id)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Data Management</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleExportJSON}>
            Export JSON
          </Button>
          <Button variant="secondary" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-[var(--destructive)]/30">
        <h2 className="text-lg font-semibold text-[var(--destructive)] mb-4">Danger Zone</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          This will permanently delete all your data including transactions, budgets, and settings.
        </p>
        <Button variant="danger" onClick={() => setConfirmReset(true)}>
          Reset All Data
        </Button>
      </Card>

      {/* Category Modal */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title={editCat ? "Edit Category" : "Add Category"}>
        <div className="space-y-4">
          <Input
            label="Name"
            id="cat-name"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="e.g., Groceries"
          />
          <Input
            label="Icon (emoji)"
            id="cat-icon"
            value={catIcon}
            onChange={(e) => setCatIcon(e.target.value)}
            placeholder="e.g., 🛒"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={catColor}
                onChange={(e) => setCatColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border-0"
              />
              <span className="text-sm text-[var(--muted-foreground)]">{catColor}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCatModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={saveCat} className="flex-1">
              {editCat ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirm Modal */}
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Confirm Reset">
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Are you sure you want to reset all data? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setConfirmReset(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetAll();
              setConfirmReset(false);
            }}
            className="flex-1"
          >
            Reset Everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}
