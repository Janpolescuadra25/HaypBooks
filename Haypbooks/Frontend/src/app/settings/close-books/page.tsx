"use client"
import { useEffect, useState } from 'react'

type Settings = { accountingMethod: 'accrual'|'cash'; baseCurrency?: string; closeDate?: string|null; allowBackdated?: boolean }

export default function CloseBooksPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<string>('')
  const [reconWarn, setReconWarn] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' })
        const j = await res.json()
        setSettings(j.settings)
        setDate(j.settings?.closeDate || '')
        // fetch latest reconciliation summary for a quick guard (mock: cash account)
        try {
          const r = await fetch('/api/reports/reconciliation/summary', { cache: 'no-store' })
          const d = await r.json()
          if (Number(d?.difference || 0) !== 0) {
            setReconWarn('Latest reconciliation shows a non-zero difference. Review before closing.')
          }
        } catch {}
      } catch (e: any) { setError(e?.message || 'Failed to load settings') }
    })()
  }, [])

  async function closeThrough() {
    if (!date) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/settings/close-period', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date }) })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Failed to close')
      setSettings(s => s ? { ...s, closeDate: j.closed } : s)
      setDate(j.closed || '')
    } catch (e: any) { setError(e?.message || 'Close failed') } finally { setBusy(false) }
  }

  async function reopenBooks() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/settings/reopen-period', { method: 'POST' })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Failed to reopen')
      setSettings(s => s ? { ...s, closeDate: null } : s)
      setDate('')
    } catch (e: any) { setError(e?.message || 'Reopen failed') } finally { setBusy(false) }
  }

  if (!settings) return <div className="glass-card p-4">Loading close date…</div>

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 space-y-3">
        <h1 className="text-xl font-semibold">Close books</h1>
        {reconWarn && (
          <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 text-sm px-3 py-2">
            {reconWarn} <a className="underline" href="/bank-transactions/reconciliation">Open reconciliation</a>
          </div>
        )}
        {error && <div className="text-sm text-rose-500">{error}</div>}
        <div className="text-sm">Closed through: <span className="font-mono">{settings.closeDate || '—'}</span></div>
        <div className="flex flex-col md:flex-row md:items-end gap-2">
          <label className="flex flex-col">
            <span className="text-xs text-slate-500">Close through date (YYYY-MM-DD)</span>
            <input
              className="input"
              type="date"
              value={date || ''}
              onChange={(e) => setDate(e.target.value)}
              disabled={busy}
            />
          </label>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={closeThrough} disabled={busy || !date}>Set close date</button>
            <button className="btn-secondary" onClick={reopenBooks} disabled={busy || !settings.closeDate}>Reopen</button>
          </div>
        </div>
        <p className="text-xs text-neutral-500">When closed, transactions dated on or before the close date are blocked from changes. Use Reopen to clear the close date.</p>
      </div>
      <div className="glass-card p-4 space-y-2">
        <h2 className="font-medium">Notes</h2>
        <ul className="list-disc ml-5 text-sm text-slate-600">
          <li>You can still void or reverse transactions; reversal dates will adjust to the next open day as needed.</li>
          <li>Closing and reopening is recorded in the audit log.</li>
        </ul>
        <div className="mt-2"><a className="text-sky-700 hover:underline text-sm" href="/reports/closing-date">View Closing Date report</a></div>
      </div>
    </div>
  )
}
