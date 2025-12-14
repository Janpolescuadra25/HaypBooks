"use client"
import { useEffect, useMemo, useState } from 'react'

type Account = { id: string; number: string; name: string; type: 'Asset'|'Liability'|'Equity'|'Income'|'Expense'; active?: boolean }

export function AccountMergeButton({ sourceId, sourceType, onDone }: { sourceId: string; sourceType: Account['type']; onDone?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [targetId, setTargetId] = useState('')
  const disable = loading

  useEffect(() => {
    if (!open) return
    ;(async () => {
      setError(null)
      try {
        const res = await fetch(`/api/accounts?includeInactive=1`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load accounts')
        const data = await res.json()
        setAccounts((data.accounts || []) as Account[])
      } catch (e: any) {
        setError(e?.message || 'Failed to load accounts')
      }
    })()
  }, [open])

  const eligible = useMemo(() => accounts.filter(a => a.id !== sourceId && a.type === sourceType && a.active !== false), [accounts, sourceId, sourceType])

  async function handleMerge() {
    if (!targetId) { setError('Select a target account'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/accounts/merge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceId, targetId, strategy: 'inactivate' }) })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Merge failed (${res.status})`)
      }
      setOpen(false)
      setTargetId('')
      onDone?.()
    } catch (e: any) {
      setError(e?.message || 'Merge failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-block">
      <button type="button" className="text-amber-700 hover:underline disabled:opacity-50" disabled={disable} onClick={() => setOpen(v => !v)}>
        Merge
      </button>
      {open && (
        <div className="mt-2 rounded border border-slate-200 bg-white p-3 shadow-lg">
          <div className="mb-2 text-sm font-medium">Merge into target account</div>
          <div className="mb-2 text-xs text-slate-600">Only accounts of the same type are eligible. The source will be marked inactive after merge.</div>
          <div className="mb-3">
            <label htmlFor="merge-target" className="mb-1 block text-xs text-slate-700">Target account</label>
            <select id="merge-target" className="w-[36ch] rounded border border-slate-300 px-2 py-1 text-sm" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
              <option value="">Select target account…</option>
              {eligible.map(a => (
                <option key={a.id} value={a.id}>{`${a.number} · ${a.name}`}</option>
              ))}
            </select>
          </div>
          {error && <div className="mb-2 text-xs text-red-600">{error}</div>}
          <div className="flex items-center gap-2">
            <button type="button" className="rounded border border-slate-200 bg-white px-2 py-1 text-sm disabled:opacity-50" onClick={() => setOpen(false)} disabled={loading}>Cancel</button>
            <button type="button" className="btn-primary px-3 py-1 text-sm disabled:opacity-50" onClick={handleMerge} disabled={loading || !targetId}>{loading ? 'Merging…' : 'Merge'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
