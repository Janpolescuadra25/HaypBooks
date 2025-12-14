"use client"
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toHref from '@/lib/route'
import BackBar from '@/components/BackBar'
import { BackButton } from '@/components/BackButton'
import { calculateDueDate, TERMS_OPTIONS } from '@/lib/terms'

type Bill = {
  id: string
  number: string
  vendor: string // name or id (server accepts either via 'vendor' fallback)
  status: 'open'|'scheduled'|'paid'|'partial'|'overdue'|'void'|'pending_approval'|'approved'|'rejected'
  total: number
  billDate?: string
  dueDate: string
  terms?: string
  items: Array<{ description: string; amount: number }>
}

export default function EditBillPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id
  const [bill, setBill] = useState<Bill | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([])
  const [closedThrough, setClosedThrough] = useState<string | null>(null)
  const isBlocked = useMemo(() => {
    if (!bill?.billDate || !closedThrough) return false
    return bill.billDate.slice(0,10) <= closedThrough
  }, [bill?.billDate, closedThrough])

  useEffect(() => {
    let alive = true
    async function load() {
      const res = await fetch(`/api/bills/${id}`, { cache: 'no-store' })
      const data = await res.json()
      if (alive) {
        const b: Bill = data.bill
        // Ensure billDate/terms defaults for legacy records
        if (!b.billDate) b.billDate = (b.dueDate || new Date().toISOString()).slice(0,10)
        if (!b.terms) b.terms = 'Due on receipt'
        setBill(b)
      }
    }
    async function loadVendors() {
      try {
        const r = await fetch('/api/vendors', { cache: 'no-store' })
        if (r.ok) {
          const d = await r.json()
          if (alive) setVendors(d.vendors || [])
        }
      } catch {}
    }
    async function loadClosed() {
      try {
        const r = await fetch('/api/periods', { cache: 'no-store' })
        if (r.ok) {
          const d = await r.json()
          if (alive) setClosedThrough(d?.closedThrough || null)
        }
      } catch {}
    }
    load(); loadVendors(); loadClosed(); return () => { alive = false }
  }, [id])

  async function onSubmit(e: React.FormEvent) {
    if (!bill) return
    setSaving(true)
    setError(null)
    try {
      const b = bill!
      const res = await fetch(`/api/bills/${id}`, { method: 'PUT', body: JSON.stringify({ number: b.number, vendor: b.vendor, billDate: b.billDate, terms: b.terms, dueDate: b.dueDate, items: b.items }) })
      if (!res.ok) throw new Error('Failed to update bill')
      router.push(toHref(`/bills/${id}`))
    } catch (e: any) {
      setError(e.message)
    } finally { setSaving(false) }
  }

  // Auto recompute due date when billDate/terms change (only if user hasn't manually set a different date after change?)
  useEffect(() => {
    if (!bill) return
    if (bill.billDate && bill.terms) {
      const nextDue = calculateDueDate(bill.billDate, bill.terms)
      // only update if current due aligns with previous base or is missing
      if (nextDue.slice(0,10) !== bill.dueDate.slice(0,10)) {
        setBill({ ...bill, dueDate: nextDue })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bill?.billDate, bill?.terms])

  if (!bill) return <div className="glass-card">Loading…</div>

  return (
    <div className="glass-card max-w-2xl">
      <BackBar href={toHref(`/bills/${id}`)} />
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Edit Bill</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="bill-number" className="block text-sm font-medium text-slate-700">Bill #</label>
            <input id="bill-number" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={bill.number} onChange={(e) => setBill({ ...bill!, number: e.target.value })} />
          </div>
          <div>
            <label htmlFor="bill-date" className="block text-sm font-medium text-slate-700">Bill date</label>
            <input id="bill-date" type="date" className="w-full rounded-xl bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 px-3 py-2"
              value={(bill.billDate || '').slice(0,10)}
              onChange={(e) => setBill({ ...bill!, billDate: e.target.value })}
            />
            {isBlocked && (
              <p className="text-xs mt-1 text-amber-700">
                Date is in a closed period (closed through {closedThrough}). Choose a later date or ask an admin to reopen.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="bill-due" className="block text-sm font-medium text-slate-700">Due date</label>
            <input id="bill-due" type="date" className="w-full rounded-xl bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 px-3 py-2" value={bill.dueDate.slice(0,10)} onChange={(e) => setBill({ ...bill!, dueDate: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="bill-terms" className="block text-sm font-medium text-slate-700">Terms</label>
            <select id="bill-terms" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              value={bill.terms || 'Due on receipt'}
              onChange={(e) => setBill({ ...bill!, terms: e.target.value })}
            >
              {TERMS_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <p className="text-slate-500 text-xs mt-1">Due date updates when Bill date or Terms change.</p>
          </div>
        </div>
        <div>
          <label htmlFor="bill-vendor" className="block text-sm font-medium text-slate-700">Vendor</label>
          {vendors.length > 0 ? (
            <select id="bill-vendor" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={bill.vendor}
              onChange={(e) => setBill({ ...bill!, vendor: e.target.value })}
            >
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          ) : (
            <input id="bill-vendor" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={bill.vendor} onChange={(e) => setBill({ ...bill!, vendor: e.target.value })} />
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Items</span>
            <button type="button" className="btn-secondary" onClick={() => setBill({ ...bill!, items: [...bill.items, { description: '', amount: 0 }] })}>+ Add item</button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2" /></tr></thead>
              <tbody className="text-slate-800">
                {bill.items.map((it, i) => (
                  <tr key={i} className="border-t border-slate-200">
                    <td className="px-3 py-2"><input aria-label={`Description ${i+1}`} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={it.description} onChange={(e) => setBill({ ...bill!, items: bill.items.map((x, idx) => idx===i ? { ...x, description: e.target.value } : x) })} /></td>
                    <td className="px-3 py-2 text-right"><input aria-label={`Amount ${i+1}`} type="number" step="0.01" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right" value={it.amount} onChange={(e) => setBill({ ...bill!, items: bill.items.map((x, idx) => idx===i ? { ...x, amount: Number(e.target.value) } : x) })} /></td>
                    <td className="px-3 py-2 text-right"><button type="button" className="btn-secondary" onClick={() => setBill({ ...bill!, items: bill.items.filter((_, idx) => idx !== i) })} disabled={bill.items.length<=1}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button className="btn-primary" type="submit" disabled={saving || isBlocked}>{saving ? 'Saving…' : 'Save Changes'}</button>
         <BackButton ariaLabel="Back to Bill" fallback={`/bills/${id}`} disabled={saving}>Cancel</BackButton>
        </div>
      </form>
    </div>
  )
}
