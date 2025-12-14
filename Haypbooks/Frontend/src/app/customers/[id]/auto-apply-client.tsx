"use client"
import { useEffect, useMemo, useState } from 'react'
import { useCurrency } from '@/components/CurrencyProvider'

export default function AutoApplyCustomerCredits({ customerId, canManage = true }: { customerId: string; canManage?: boolean }) {
  const { formatCurrency } = useCurrency()
  const [preview, setPreview] = useState<{ allocations: number; totalApplied: number; rows: { invoiceNumber: string; creditNumber: string; amount: number }[] } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [doneInfo, setDoneInfo] = useState<{ allocations: number; totalApplied: number } | null>(null)

  const run = useMemo(() => async (opts: { dryRun?: boolean }) => {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(customerId)}/credits/auto-apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: !!opts.dryRun })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Request failed')
      const rows = (data.results || []).map((r: any) => ({ invoiceNumber: r.invoiceNumber, creditNumber: r.creditNumber, amount: Number(r.amount) }))
      const payload = { allocations: Number(data.ok||0), totalApplied: Number(data.totalApplied||0), rows }
      if (opts.dryRun) setPreview(payload)
      else setDoneInfo({ allocations: payload.allocations, totalApplied: payload.totalApplied })
    } catch (e: any) {
      setError(e?.message || 'Operation failed')
    } finally {
      setBusy(false)
    }
  }, [customerId])

  useEffect(() => { setPreview(null); setDoneInfo(null); setError(null) }, [customerId])

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <button className="btn-secondary text-sm" disabled={!canManage || busy} onClick={() => run({ dryRun: true })}>
          {busy ? 'Checking…' : 'Preview auto-apply'}
        </button>
        <button
          className="btn-primary text-sm"
          disabled={!canManage || busy || !preview || preview.allocations === 0}
          onClick={() => {
            if (!preview) return
            const ok = window.confirm(`Apply ${preview.allocations} allocation${preview.allocations===1?'':'s'} totaling ${formatCurrency(preview.totalApplied)}?`)
            if (!ok) return
            run({ dryRun: false })
          }}
        >
          {busy ? 'Applying…' : 'Apply credits'}
        </button>
        {!canManage && <span className="text-xs text-slate-500">You don’t have permission.</span>}
      </div>
      <p className="text-xs text-slate-600 mt-1">Allocations are non-posting and use the credit date for as-of reporting.</p>
      {error && <div role="alert" className="mt-2 text-sm text-rose-700">{error}</div>}
      {preview && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white">
          <div className="px-3 py-2 text-sm text-slate-700">Preview: {preview.allocations} allocation{preview.allocations===1?'':'s'} totaling {formatCurrency(preview.totalApplied)}</div>
          {preview.rows.length > 0 && (
            <table className="min-w-full text-sm">
              <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Invoice</th><th className="px-3 py-2 text-left">Credit</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
              <tbody className="text-slate-800">
                {preview.rows.map((r, i) => (
                  <tr key={i} className="border-t border-slate-200"><td className="px-3 py-2">{r.invoiceNumber}</td><td className="px-3 py-2">{r.creditNumber}</td><td className="px-3 py-2 text-right tabular-nums">{formatCurrency(r.amount)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {doneInfo && (
        <div className="mt-3 text-sm text-emerald-700">Applied {doneInfo.allocations} allocation{doneInfo.allocations===1?'':'s'} totaling {formatCurrency(doneInfo.totalApplied)}.</div>
      )}
    </div>
  )
}
