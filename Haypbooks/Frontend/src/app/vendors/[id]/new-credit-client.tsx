"use client"
import { useMemo, useState } from 'react'

export default function NewVendorCreditForm({ vendorId }: { vendorId: string }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const onSubmit = useMemo(() => async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const number = (form.elements.namedItem('number') as HTMLInputElement)?.value
    const date = (form.elements.namedItem('date') as HTMLInputElement)?.value
    const desc = (form.elements.namedItem('desc') as HTMLInputElement)?.value
    const amount = Number((form.elements.namedItem('amount') as HTMLInputElement)?.value)
    if (!(amount > 0)) { setError('Amount must be positive'); return }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/vendor-credits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: number || undefined, vendorId, date: date || undefined, lines: [{ description: desc || 'Credit', amount }] }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create credit')
      form.reset()
      // Simple reload to reflect new credit listing
      window.location.reload()
    } catch (e: any) {
      setError(e?.message || 'Failed to create credit')
    } finally {
      setSubmitting(false)
    }
  }, [vendorId])
  return (
    <form onSubmit={onSubmit} className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-sm font-medium text-slate-900 mb-2">New vendor credit</div>
      {error && <div role="alert" className="text-sm text-rose-700 mb-2">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
        <div>
          <label className="block text-xs text-slate-600" htmlFor="number">Number</label>
          <input id="number" name="number" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" placeholder="VC-1002" />
        </div>
        <div>
          <label className="block text-xs text-slate-600" htmlFor="date">Date</label>
          <input id="date" name="date" type="date" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-600" htmlFor="desc">Description</label>
          <input id="desc" name="desc" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" placeholder="Return/Allowance" />
        </div>
        <div>
          <label className="block text-xs text-slate-600" htmlFor="amount">Amount</label>
          <input id="amount" name="amount" type="number" step="0.01" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" placeholder="0.00" />
        </div>
      </div>
      <div className="mt-3">
        <button type="submit" className="btn-secondary text-sm" disabled={submitting}>{submitting ? 'Saving…' : 'Save credit'}</button>
      </div>
    </form>
  )
}
