"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/BackButton";

export default function NewAccountPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ number: "", name: "", type: "", reconcilable: false, openingBalance: "", openingBalanceDate: "", parentNumber: "", detailType: "" });
  const [error, setError] = useState<string | null>(null);

  // Lightweight, brand-neutral detail type suggestions per account type
  const detailTypeOptions: Record<string, string[]> = {
    Asset: ['Bank', 'Cash on Hand', 'Accounts Receivable', 'Other Current Asset', 'Fixed Asset', 'Accumulated Depreciation', 'Other Asset'],
    Liability: ['Accounts Payable', 'Credit Card', 'Other Current Liability', 'Long Term Liability', 'Payroll Liabilities', 'Sales Tax Payable'],
    Equity: ['Retained Earnings', "Owner's Equity", 'Paid-in Capital', 'Draws/Distributions'],
    Income: ['Product Sales', 'Service Income', 'Interest Income', 'Other Income'],
    Expense: ['Cost of Goods Sold', 'Office Expenses', 'Bank Charges', 'Payroll Expenses', 'Rent Expense', 'Utilities', 'Travel', 'Meals', 'Other Expense'],
  }
  const listId = form.type ? `detail-types-${form.type}` : 'detail-types-generic'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: form.number,
          name: form.name,
          type: form.type,
          reconcilable: form.reconcilable,
          openingBalance: form.openingBalance !== "" ? Number(form.openingBalance) : undefined,
          openingBalanceDate: form.openingBalanceDate || undefined,
          parentNumber: form.parentNumber || undefined,
          detailType: form.detailType || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      startTransition(() => router.push("/accounts"));
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    }
  };

  return (
    <div className="p-4">
      <form id="account-form" className="max-w-2xl space-y-4" onSubmit={submit}>
        {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">{error}</div>}
        <div
          role="group"
          aria-label="New account details"
          className="glass-formbar floating px-3 py-3 transition-all duration-200"
        >
          {/* Title and actions inside the bar */}
          <div className="mb-3 flex items-center justify-between gap-2 print:hidden">
            <h1 className="text-lg font-semibold">New Account</h1>
            <div className="flex gap-2">
              <BackButton fallback="/accounts" className="btn-secondary btn-sm" ariaLabel="Cancel and go back">Cancel</BackButton>
              <button type="submit" className="btn-primary btn-sm disabled:opacity-50" disabled={isPending}>Save</button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700">Number</span>
              <input id="number" className="w-[28ch] rounded-md border border-slate-200 bg-white px-2 py-1 text-sm" required value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700">Name</span>
              <input id="name" className="w-[32ch] rounded-md border border-slate-200 bg-white px-2 py-1 text-sm" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </label>
            <label className="flex items-center justify-between gap-3 sm:col-span-2">
              <span className="text-sm text-slate-700">Type</span>
              <select id="type" className="w-[28ch] rounded-md border border-slate-200 bg-white px-2 py-1 text-sm" required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="">Select…</option>
                <option>Asset</option>
                <option>Liability</option>
                <option>Equity</option>
                <option>Income</option>
                <option>Expense</option>
              </select>
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700">Parent number (optional)</span>
              <input id="parentNumber" placeholder="e.g. 4000" className="w-[20ch] rounded-md border border-slate-200 bg-white px-2 py-1 text-sm" value={form.parentNumber} onChange={e => setForm(f => ({ ...f, parentNumber: e.target.value }))} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700">Detail type (optional)</span>
              <>
                <input id="detailType" list={listId} placeholder="e.g. Product Sales" className="w-[28ch] rounded-md border border-slate-200 bg-white px-2 py-1 text-sm" value={form.detailType} onChange={e => setForm(f => ({ ...f, detailType: e.target.value }))} />
                {/* Datalist provides suggestions while allowing custom entries */}
                <datalist id={listId}>
                  {(detailTypeOptions as any)[form.type]?.map((opt: string) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </>
            </label>
            {(form.type === 'Asset' || form.type === 'Liability') && (
              <>
                <label className="flex items-center justify-between gap-3 sm:col-span-2">
                  <span className="text-sm text-slate-700">Reconcilable</span>
                  <input aria-label="Reconcilable account" type="checkbox" className="h-4 w-4" checked={form.reconcilable} onChange={e => setForm(f => ({ ...f, reconcilable: e.target.checked }))} />
                </label>
                <label className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700">Opening balance (optional)</span>
                  <input type="number" inputMode="decimal" step="0.01" className="w-[20ch] rounded-md border border-slate-200 bg-white px-2 py-1 text-sm" value={form.openingBalance} onChange={e => setForm(f => ({ ...f, openingBalance: e.target.value }))} placeholder="0.00" />
                </label>
                <label className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700">Opening balance date (optional)</span>
                  <input type="date" className="w-[20ch] rounded-md border border-slate-200 bg-white px-2 py-1 text-sm" value={form.openingBalanceDate} onChange={e => setForm(f => ({ ...f, openingBalanceDate: e.target.value }))} />
                </label>
                <div className="sm:col-span-2 rounded-md bg-white/60 px-3 py-2 text-xs text-slate-600">
                  Tip: Use your bank statement balance on your start date. For migrations, use the ending balance from your prior system as the opening balance. Don’t force reconciliation—fix underlying transactions instead.
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
