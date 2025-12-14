"use client"
import { useEffect, useMemo, useState } from 'react'
import Amount from '@/components/Amount'

type VC = { id: string; number: string; vendorId: string; vendor?: string; date: string; total: number; remaining: number }

export default function VendorCreditsClient({ billId, vendorId }: { billId: string; vendorId: string }) {
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<VC[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`/api/vendor-credits?vendorId=${encodeURIComponent(vendorId)}`, { cache: 'no-store' })
        const data = res.ok ? await res.json() : { vendorCredits: [] }
        if (!active) return
        setList((data.vendorCredits || []).filter((v: VC) => v.remaining > 0))
      } catch (e: any) {
        if (active) setError(e?.message || 'Error loading credits')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [vendorId])

  const onApply = useMemo(() => async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const vcId = (form.elements.namedItem('vcId') as HTMLSelectElement)?.value
    const amtStr = (form.elements.namedItem('amount') as HTMLInputElement)?.value
    const amt = Number(amtStr)
    if (!vcId || !(amt > 0)) return
    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null
    if (btn) btn.disabled = true
    try {
      const res = await fetch(`/api/vendor-credits/${vcId}/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ billId, amount: amt }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to apply credit')
      // Refresh list after apply
      const refresh = await fetch(`/api/vendor-credits?vendorId=${encodeURIComponent(vendorId)}`)
      const d2 = refresh.ok ? await refresh.json() : { vendorCredits: [] }
      setList((d2.vendorCredits || []).filter((v: VC) => v.remaining > 0))
      form.reset()
    } catch (e: any) {
      setError(e?.message || 'Failed to apply credit')
    } finally {
      if (btn) btn.disabled = false
    }
  }, [billId, vendorId])

  if (loading) return null
  if (list.length === 0) return null
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Vendor credits</h2>
      {error && <div role="alert" className="text-sm text-rose-700 mb-2">{error}</div>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Number</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Remaining</th></tr></thead>
          <tbody className="text-slate-800">
            {list.map(vc => (
              <tr key={vc.id} className="border-t border-slate-200">
                <td className="px-3 py-2">{vc.number}</td>
                <td className="px-3 py-2">{vc.date.slice(0,10)}</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(vc.remaining)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={onApply} className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-sm text-slate-700" htmlFor="vcId">Apply credit</label>
        <select id="vcId" name="vcId" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm">
          {list.map(vc => (
            <option key={vc.id} value={vc.id}>{vc.number} · remaining <Amount value={Number(vc.remaining)} /></option>
          ))}
        </select>
        <input name="amount" id="amount" type="number" step="0.01" placeholder="Amount" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" />
        <button type="submit" className="btn-secondary text-sm">Apply</button>
      </form>
    </div>
  )
}
