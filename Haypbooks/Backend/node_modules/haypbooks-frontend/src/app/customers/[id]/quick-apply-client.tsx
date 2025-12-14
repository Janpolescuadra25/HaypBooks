"use client"
import { useEffect, useMemo, useState } from 'react'
import { useCurrency } from '@/components/CurrencyProvider'

type Invoice = { id: string; number: string; customerId: string; status: string; total: number; balance: number }
type CreditMemo = { id: string; number: string; remaining: number }

export default function QuickApplyCustomerCredits({ customerId, canManage = true }: { customerId: string; canManage?: boolean }) {
  const { formatCurrency } = useCurrency()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [credits, setCredits] = useState<CreditMemo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useMemo(() => async () => {
    setError(null)
    try {
      const invRes = await fetch(`/api/invoices?status=open&limit=200`, { cache: 'no-store' })
      const invData = invRes.ok ? await invRes.json() : { invoices: [] }
      const allInv: Invoice[] = (invData.invoices || []).filter((i: Invoice) => i.customerId === customerId && i.balance > 0)
      setInvoices(allInv)
      const cmRes = await fetch(`/api/credit-memos?customerId=${encodeURIComponent(customerId)}`, { cache: 'no-store' })
      const cmData = cmRes.ok ? await cmRes.json() : { creditMemos: [] }
      setCredits((cmData.creditMemos || []).filter((c: CreditMemo) => c.remaining > 0))
    } catch (e: any) {
      setError(e?.message || 'Failed to load data')
    }
  }, [customerId])

  useEffect(() => { load() }, [load])

  const onApply = useMemo(() => async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const invoiceId = (form.elements.namedItem('invoiceId') as HTMLSelectElement)?.value
    const creditMemoId = (form.elements.namedItem('creditMemoId') as HTMLSelectElement)?.value
    const amt = Number((form.elements.namedItem('amount') as HTMLInputElement)?.value)
    if (!invoiceId || !creditMemoId || !(amt > 0)) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}/apply-credit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creditMemoId, amount: amt }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Apply failed')
      await load()
      form.reset()
    } catch (e: any) {
      setError(e?.message || 'Apply failed')
    } finally {
      setSubmitting(false)
    }
  }, [load])

  if (invoices.length === 0 || credits.length === 0) return null
  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-slate-900 mb-2">Quick-apply credit to open invoice</div>
      {error && <div role="alert" className="text-sm text-rose-700 mb-2">{error}</div>}
  <form onSubmit={onApply} className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-slate-700" htmlFor="invoiceId">Invoice</label>
        <select id="invoiceId" name="invoiceId" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" disabled={!canManage}>
          {invoices.map(inv => (
            <option key={inv.id} value={inv.id}>{`${inv.number} · bal ${formatCurrency(Number(inv.balance))}`}</option>
          ))}
        </select>
        <label className="text-sm text-slate-700" htmlFor="creditMemoId">Credit</label>
        <select id="creditMemoId" name="creditMemoId" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" disabled={!canManage}>
          {credits.map(cm => (
            <option key={cm.id} value={cm.id}>{`${cm.number} · rem ${formatCurrency(Number(cm.remaining))}`}</option>
          ))}
        </select>
        <label className="text-sm text-slate-700" htmlFor="amount">Amount</label>
        <input id="amount" name="amount" type="number" step="0.01" placeholder="Amount" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" disabled={!canManage} />
        <button disabled={submitting || !canManage} className="btn-secondary text-sm" type="submit">{submitting ? 'Applying…' : 'Apply'}</button>
        {!canManage && <span className="text-xs text-slate-500" role="note">You don’t have permission to apply credits.</span>}
      </form>
    </div>
  )
}
