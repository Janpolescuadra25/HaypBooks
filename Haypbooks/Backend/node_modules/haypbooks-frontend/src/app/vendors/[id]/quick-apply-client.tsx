"use client"
import { useEffect, useMemo, useState } from 'react'
import Amount from '@/components/Amount'

type Bill = { id: string; number: string; vendorId: string; status: string; total: number; balance: number }
type VC = { id: string; number: string; remaining: number }

export default function QuickApplyVendorCredits({ vendorId }: { vendorId: string }) {
  const [bills, setBills] = useState<Bill[]>([])
  const [credits, setCredits] = useState<VC[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useMemo(() => async () => {
    setError(null)
    try {
      const billsRes = await fetch(`/api/bills?status=open&limit=200`, { cache: 'no-store' })
      const billsData = billsRes.ok ? await billsRes.json() : { bills: [] }
      const allBills: Bill[] = (billsData.bills || []).filter((b: Bill) => b.vendorId === vendorId && b.balance > 0)
      setBills(allBills)
      const vcRes = await fetch(`/api/vendor-credits?vendorId=${encodeURIComponent(vendorId)}`, { cache: 'no-store' })
      const vcData = vcRes.ok ? await vcRes.json() : { vendorCredits: [] }
      setCredits((vcData.vendorCredits || []).filter((v: VC) => v.remaining > 0))
    } catch (e: any) {
      setError(e?.message || 'Failed to load data')
    }
  }, [vendorId])

  useEffect(() => { load() }, [load])

  const onApply = useMemo(() => async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const billId = (form.elements.namedItem('billId') as HTMLSelectElement)?.value
    const vcId = (form.elements.namedItem('vcId') as HTMLSelectElement)?.value
    const amt = Number((form.elements.namedItem('amount') as HTMLInputElement)?.value)
    if (!billId || !vcId || !(amt > 0)) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/vendor-credits/${vcId}/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ billId, amount: amt }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Apply failed')
      await load()
      form.reset()
    } catch (e: any) {
      setError(e?.message || 'Apply failed')
    } finally {
      setSubmitting(false)
    }
  }, [load])

  if (bills.length === 0 || credits.length === 0) return null
  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-slate-900 mb-2">Quick-apply credit to open bill</div>
      {error && <div role="alert" className="text-sm text-rose-700 mb-2">{error}</div>}
      <form onSubmit={onApply} className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-slate-700" htmlFor="billId">Bill</label>
        <select id="billId" name="billId" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm">
          {bills.map(b => (
            <option key={b.id} value={b.id}>{b.number} · bal <Amount value={Number(b.balance)} /></option>
          ))}
        </select>
        <label className="text-sm text-slate-700" htmlFor="vcId">Credit</label>
        <select id="vcId" name="vcId" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm">
          {credits.map(vc => (
            <option key={vc.id} value={vc.id}>{vc.number} · rem <Amount value={Number(vc.remaining)} /></option>
          ))}
        </select>
        <input id="amount" name="amount" type="number" step="0.01" placeholder="Amount" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" />
        <button disabled={submitting} className="btn-secondary text-sm" type="submit">{submitting ? 'Applying…' : 'Apply'}</button>
      </form>
    </div>
  )
}
