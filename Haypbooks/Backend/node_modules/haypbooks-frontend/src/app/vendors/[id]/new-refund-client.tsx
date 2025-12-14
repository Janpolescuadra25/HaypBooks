"use client"
import { useMemo, useState } from 'react'

export default function NewVendorRefundForm({ vendorId }: { vendorId: string }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = useMemo(() => async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const date = (form.elements.namedItem('date') as HTMLInputElement)?.value
    const method = (form.elements.namedItem('method') as HTMLInputElement)?.value
    const reference = (form.elements.namedItem('reference') as HTMLInputElement)?.value
    const vendorCreditId = (form.elements.namedItem('vendorCreditId') as HTMLSelectElement)?.value
    const amount = Number((form.elements.namedItem('amount') as HTMLInputElement)?.value)
    if (!(amount > 0)) { setError('Amount must be positive'); return }
    setSubmitting(true)
    setError(null)
    try {
      const payload: any = { vendorId, amount }
      if (date) payload.date = date
      if (method) payload.method = method
      if (reference) payload.reference = reference
      if (vendorCreditId) payload.vendorCreditId = vendorCreditId
  const res = await fetch(`/api/vendors/${encodeURIComponent(vendorId)}/refunds`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to record refund')
      form.reset()
      // Simple reload to refresh list
      window.location.reload()
    } catch (e: any) {
      setError(e?.message || 'Failed to record refund')
    } finally {
      setSubmitting(false)
    }
  }, [vendorId])

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-sm font-medium text-slate-900 mb-2">Record a refund from vendor</div>
      {error && <div role="alert" className="text-sm text-rose-700 mb-2">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
        <div>
          <label className="block text-xs text-slate-600" htmlFor="date">Date</label>
          <input id="date" name="date" type="date" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-600" htmlFor="amount">Amount</label>
          <input id="amount" name="amount" type="number" step="0.01" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-xs text-slate-600" htmlFor="method">Method</label>
          <input id="method" name="method" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" placeholder="cash/check/other" />
        </div>
        <div>
          <label className="block text-xs text-slate-600" htmlFor="reference">Reference</label>
          <input id="reference" name="reference" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" placeholder="Note or #" />
        </div>
        <div>
          <label className="block text-xs text-slate-600" htmlFor="vendorCreditId">Apply to credit (optional)</label>
          <VendorCreditsSelect vendorId={vendorId} />
        </div>
      </div>
      <div className="mt-3">
        <button type="submit" className="btn-secondary text-sm" disabled={submitting}>{submitting ? 'Recording…' : 'Record refund'}</button>
      </div>
    </form>
  )
}

function VendorCreditsSelect({ vendorId }: { vendorId: string }) {
  const [options, setOptions] = useState<Array<{ id: string; number: string; remaining: number }>>([])
  const [loaded, setLoaded] = useState(false)
  useMemo(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch(`/api/vendor-credits?vendorId=${encodeURIComponent(vendorId)}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const rows = (data.vendorCredits || []) as Array<{ id: string; number: string; remaining: number }>
        if (mounted) setOptions(rows.filter(r => (r.remaining ?? 0) > 0))
      } catch {
        /* noop */
      } finally {
        if (mounted) setLoaded(true)
      }
    }
    load()
    return () => { mounted = false }
  }, [vendorId])
  return (
    <select id="vendorCreditId" name="vendorCreditId" className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm">
      <option value="">— None —</option>
      {options.map(o => (
        <option key={o.id} value={o.id}>{o.number} ({(o.remaining ?? 0).toFixed(2)} remaining)</option>
      ))}
    </select>
  )
}
