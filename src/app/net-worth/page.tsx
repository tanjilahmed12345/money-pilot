"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/store";
import { Asset, Liability, AssetType, LiabilityType } from "@/types";
import { Card, CardTitle, CardValue } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, getCurrentMonth, getMonthName } from "@/utils";
import { useToast } from "@/components/ui/Toast";

const NetWorthChart = dynamic(
  () => import("@/components/charts/NetWorthChart").then((m) => m.NetWorthChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-lg" /> }
);

const ASSET_ICONS: Record<AssetType, string> = {
  bank: "🏦", investment: "📈", property: "🏠", cash: "💵", other: "📦",
};
const LIABILITY_ICONS: Record<LiabilityType, string> = {
  loan: "📋", credit_card: "💳", mortgage: "🏠", other: "📦",
};

const ASSET_OPTIONS: { value: AssetType; label: string }[] = [
  { value: "bank", label: "Bank Account" },
  { value: "investment", label: "Investment" },
  { value: "property", label: "Property" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];
const LIABILITY_OPTIONS: { value: LiabilityType; label: string }[] = [
  { value: "loan", label: "Loan" },
  { value: "credit_card", label: "Credit Card" },
  { value: "mortgage", label: "Mortgage" },
  { value: "other", label: "Other" },
];

export default function NetWorthPage() {
  const {
    assets, liabilities, netWorthSnapshots,
    addAsset, updateAsset, deleteAsset,
    addLiability, updateLiability, deleteLiability,
    takeSnapshot, settings,
  } = useStore();
  const currency = settings.currency;
  const { toast } = useToast();

  const [assetModal, setAssetModal] = useState(false);
  const [liabilityModal, setLiabilityModal] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [editLiability, setEditLiability] = useState<Liability | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("bank");
  const [liabilityType, setLiabilityType] = useState<LiabilityType>("loan");

  const totalAssets = useMemo(() => assets.reduce((s, a) => s + a.amount, 0), [assets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((s, l) => s + l.amount, 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;

  // Auto-snapshot on 1st of month (or if no snapshot exists for current month)
  useEffect(() => {
    if (assets.length === 0 && liabilities.length === 0) return;
    const currentMonth = getCurrentMonth();
    const hasSnapshot = netWorthSnapshots.some((s) => s.month === currentMonth);
    if (!hasSnapshot) {
      takeSnapshot(currentMonth);
    }
  }, [assets, liabilities, netWorthSnapshots, takeSnapshot]);

  const openAddAsset = () => {
    setEditAsset(null); setName(""); setAmount(""); setAssetType("bank");
    setAssetModal(true);
  };
  const openEditAsset = (a: Asset) => {
    setEditAsset(a); setName(a.name); setAmount(String(a.amount)); setAssetType(a.type);
    setAssetModal(true);
  };
  const saveAsset = () => {
    if (!name.trim() || !amount || Number(amount) <= 0) return;
    const data = { name: name.trim(), amount: Number(amount), type: assetType, icon: ASSET_ICONS[assetType] };
    if (editAsset) {
      updateAsset(editAsset.id, data);
      toast("Asset updated");
    } else {
      addAsset(data);
      toast("Asset added");
    }
    setAssetModal(false);
    takeSnapshot(getCurrentMonth());
  };

  const openAddLiability = () => {
    setEditLiability(null); setName(""); setAmount(""); setLiabilityType("loan");
    setLiabilityModal(true);
  };
  const openEditLiability = (l: Liability) => {
    setEditLiability(l); setName(l.name); setAmount(String(l.amount)); setLiabilityType(l.type);
    setLiabilityModal(true);
  };
  const saveLiability = () => {
    if (!name.trim() || !amount || Number(amount) <= 0) return;
    const data = { name: name.trim(), amount: Number(amount), type: liabilityType, icon: LIABILITY_ICONS[liabilityType] };
    if (editLiability) {
      updateLiability(editLiability.id, data);
      toast("Liability updated");
    } else {
      addLiability(data);
      toast("Liability added");
    }
    setLiabilityModal(false);
    takeSnapshot(getCurrentMonth());
  };

  const handleDeleteAsset = (id: string) => {
    deleteAsset(id);
    toast("Asset deleted");
    takeSnapshot(getCurrentMonth());
  };

  const handleDeleteLiability = (id: string) => {
    deleteLiability(id);
    toast("Liability deleted");
    takeSnapshot(getCurrentMonth());
  };

  const hasData = assets.length > 0 || liabilities.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Net Worth</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Track your assets, liabilities, and overall wealth</p>
      </div>

      {/* Summary */}
      {hasData && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <Card>
            <CardTitle>Total Assets</CardTitle>
            <CardValue className="mt-2">
              <span className="text-[var(--success)] tabular-nums">{formatCurrency(totalAssets, currency)}</span>
            </CardValue>
          </Card>
          <Card>
            <CardTitle>Total Liabilities</CardTitle>
            <CardValue className="mt-2">
              <span className="text-[var(--destructive)] tabular-nums">{formatCurrency(totalLiabilities, currency)}</span>
            </CardValue>
          </Card>
          <Card>
            <CardTitle>Net Worth</CardTitle>
            <CardValue className="mt-2">
              <span style={{ color: netWorth >= 0 ? "var(--success)" : "var(--destructive)" }} className="tabular-nums">
                {formatCurrency(Math.abs(netWorth), currency)}
                {netWorth < 0 && " (negative)"}
              </span>
            </CardValue>
          </Card>
        </div>
      )}

      {/* Chart */}
      {netWorthSnapshots.length > 1 && (
        <Card>
          <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Net Worth Over Time</h2>
          <NetWorthChart />
        </Card>
      )}

      {!hasData && (
        <EmptyState
          icon="💰"
          title="Track your net worth"
          description="Add your assets and liabilities to see your financial picture"
          action={{ label: "Add Asset", onClick: openAddAsset }}
        />
      )}

      {/* Assets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Assets</h2>
          <Button size="sm" onClick={openAddAsset}>+ Add Asset</Button>
        </div>
        {assets.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--muted-foreground)] text-center py-4">No assets added yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {assets.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 sm:px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--card-foreground)]">{a.name}</p>
                    <Badge color="#22c55e">{ASSET_OPTIONS.find((o) => o.value === a.type)?.label || a.type}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--success)] tabular-nums">
                    {formatCurrency(a.amount, currency)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => openEditAsset(a)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(a.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Liabilities */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Liabilities</h2>
          <Button size="sm" variant="secondary" onClick={openAddLiability}>+ Add Liability</Button>
        </div>
        {liabilities.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--muted-foreground)] text-center py-4">No liabilities added yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {liabilities.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 sm:px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{l.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--card-foreground)]">{l.name}</p>
                    <Badge color="#ef4444">{LIABILITY_OPTIONS.find((o) => o.value === l.type)?.label || l.type}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--destructive)] tabular-nums">
                    {formatCurrency(l.amount, currency)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => openEditLiability(l)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteLiability(l.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset Modal */}
      <Modal open={assetModal} onClose={() => setAssetModal(false)} title={editAsset ? "Edit Asset" : "Add Asset"}>
        <div className="space-y-4">
          <Input label="Name" id="asset-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Savings Account" />
          <Input label="Value" id="asset-amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          <Select label="Type" id="asset-type" value={assetType} onChange={(e) => setAssetType(e.target.value as AssetType)} options={ASSET_OPTIONS} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAssetModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveAsset} className="flex-1">{editAsset ? "Update" : "Add"} Asset</Button>
          </div>
        </div>
      </Modal>

      {/* Liability Modal */}
      <Modal open={liabilityModal} onClose={() => setLiabilityModal(false)} title={editLiability ? "Edit Liability" : "Add Liability"}>
        <div className="space-y-4">
          <Input label="Name" id="liability-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Car Loan" />
          <Input label="Amount Owed" id="liability-amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          <Select label="Type" id="liability-type" value={liabilityType} onChange={(e) => setLiabilityType(e.target.value as LiabilityType)} options={LIABILITY_OPTIONS} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setLiabilityModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveLiability} className="flex-1">{editLiability ? "Update" : "Add"} Liability</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
