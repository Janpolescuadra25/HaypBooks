"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";

type Account = { id: string; number: string; name: string; type: string; reconcilable?: boolean; openingBalanceDate?: string; parentId?: string; parentNumber?: string; detailType?: string };

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");
  const [isPending, startTransition] = useTransition();
  const [account, setAccount] = useState<Account | null>(null);
  const [form, setForm] = useState({ number: "", name: "", type: "", reconcilable: false, openingBalance: "", openingBalanceDate: "", parentNumber: "", detailType: "" });
  const [error, setError] = useState<string | null>(null);

  // Brand-neutral suggestions for detail types by account type
  const detailTypeOptions: Record<string, string[]> = {
    Asset: ['Bank', 'Cash on Hand', 'Accounts Receivable', 'Other Current Asset', 'Fixed Asset', 'Accumulated Depreciation', 'Other Asset'],
    Liability: ['Accounts Payable', 'Credit Card', 'Other Current Liability', 'Long Term Liability', 'Payroll Liabilities', 'Sales Tax Payable'],
    Equity: ['Retained Earnings', "Owner's Equity", 'Paid-in Capital', 'Draws/Distributions'],
    Income: ['Product Sales', 'Service Income', 'Interest Income', 'Other Income'],
    Expense: ['Cost of Goods Sold', 'Office Expenses', 'Bank Charges', 'Payroll Expenses', 'Rent Expense', 'Utilities', 'Travel', 'Meals', 'Other Expense'],
  }
  const listId = form.type ? `detail-types-${form.type}` : 'detail-types-generic'

  useEffect(() => {
    let on = true;
    const run = async () => {
      try {
        const res = await fetch(`/api/accounts?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        const found: Account | undefined = data?.items?.find((a: Account) => a.id === id) || data?.item || null;
        if (on && found) {
          setAccount(found);
          setForm({ number: found.number, name: found.name, type: found.type, reconcilable: !!found.reconcilable, openingBalance: "", openingBalanceDate: found.openingBalanceDate || "", parentNumber: found.parentNumber || "", detailType: found.detailType || "" });
        }
      } catch (e) {
        // ignore
      }
    };
    if (id) run();
    return () => { on = false; };
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          number: form.number,
          name: form.name,
          type: form.type,
          reconcilable: form.reconcilable,
          // openingBalance/edit only allowed when no reconciliations exist; server enforces; client just forwards when filled
          openingBalance: form.openingBalance !== "" ? Number(form.openingBalance) : undefined,
          openingBalanceDate: form.openingBalanceDate || undefined,
          parentNumber: form.parentNumber || "",
          detailType: form.detailType || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      startTransition(() => router.push("/accounts"));
    } catch (err: any) {
      setError(err.message || "Failed to update account");
    }
  };

  const destroy = async () => {
    if (!confirm("Delete this account?")) return;
    try {
      const res = await fetch(`/api/accounts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      startTransition(() => router.push("/accounts"));
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-lg font-semibold">Edit Account</h1>
        <div className="flex gap-2">
          <button onClick={destroy} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700">Delete</button>
          <BackButton fallback="/accounts" className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm" ariaLabel="Cancel and go back">Cancel</BackButton>
          <button form="account-form" type="submit" className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50" disabled={isPending}>Save</button>
        </div>
      </div>
      <form id="account-form" className="max-w-xl space-y-4" onSubmit={submit}>
        {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">{error}</div>}
        {!account ? (
          <div className="text-slate-500">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Quick account metadata chips */}
            <div className="sm:col-span-2 flex flex-wrap items-center gap-2 text-xs">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] ${account?.reconcilable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`} title="Whether this account can be reconciled">
                {account?.reconcilable ? 'Reconcilable: Yes' : 'Reconcilable: No'}
              </span>
              {account?.openingBalanceDate ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 px-2 py-[2px]" title="Opening balance date">
                  Opening Balance Date: {String(account.openingBalanceDate).slice(0,10)}
                </span>
              ) : null}
            </div>
            <div>
              <label htmlFor="number" className="block text-sm text-slate-600">Number</label>
              <input id="number" className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm" required value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm text-slate-600">Name</label>
              <input id="name" className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm text-slate-600">Type</label>
              <select id="type" className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm" required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="">Select…</option>
                <option>Asset</option>
                <option>Liability</option>
                <option>Equity</option>
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
            <div>
              <label htmlFor="parentNumber" className="block text-sm text-slate-600">Parent number (optional)</label>
              <input id="parentNumber" placeholder="e.g. 4000" className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm" value={form.parentNumber} onChange={e => setForm(f => ({ ...f, parentNumber: e.target.value }))} />
              <div className="mt-1 text-xs text-slate-500">Clear to remove parent. Parent type must match.</div>
            </div>
            <div>
              <label htmlFor="detailType" className="block text-sm text-slate-600">Detail type (optional)</label>
              <>
                <input id="detailType" list={listId} placeholder="e.g. Product Sales" className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm" value={form.detailType} onChange={e => setForm(f => ({ ...f, detailType: e.target.value }))} />
                <datalist id={listId}>
                  {(detailTypeOptions as any)[form.type]?.map((opt: string) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </>
            </div>
            {(form.type === 'Asset' || form.type === 'Liability') && (
              <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-white/80 p-3">
                <label className="text-sm text-slate-700 flex items-center gap-2">
                  <input type="checkbox" checked={!!form.reconcilable} onChange={e => setForm(f => ({ ...f, reconcilable: e.target.checked }))} />
                  Reconcilable account (appears on Reconcile Start)
                </label>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-sm text-slate-700">Opening balance (optional)</div>
                    <input type="number" inputMode="decimal" step="0.01" className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm" value={form.openingBalance} onChange={e => setForm(f => ({ ...f, openingBalance: e.target.value }))} placeholder="0.00" />
                  </label>
                  <label className="block">
                    <div className="text-sm text-slate-700">Opening balance date (optional)</div>
                    <input type="date" className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm" value={form.openingBalanceDate} onChange={e => setForm(f => ({ ...f, openingBalanceDate: e.target.value }))} />
                  </label>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  If this account has prior reconciliation sessions, you cannot change the opening balance. To adjust, undo the prior reconciliation first.
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
