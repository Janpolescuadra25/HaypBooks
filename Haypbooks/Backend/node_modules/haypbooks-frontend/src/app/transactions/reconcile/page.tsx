"use client"
import ReconcileWorkbench from '@/components/ReconcileWorkbench'
import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Amount from '@/components/Amount'
import { formatDateTimeLocal } from '@/lib/date'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'

function RecentSessions() {
  const [sessions, setSessions] = React.useState<Array<{ id: string; accountId: string; periodEnd: string; endingBalance: number; serviceCharge?: number; interestEarned?: number; clearedIds: string[]; createdAt: string }>>([])
  const [accountId, setAccountId] = React.useState<string>("")
  const [accounts, setAccounts] = React.useState<Array<{ id: string; number: string; name: string }>>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [statusById, setStatusById] = React.useState<Record<string, 'ok' | 'discrepancy' | 'unknown'>>({})

  // Try to pick an account to filter by using the accounts API
  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/accounts', { cache: 'no-store' })
        const d = r.ok ? await r.json() : null
        const list = Array.isArray(d?.accounts) ? d.accounts : []
        if (!alive) return
        setAccounts(list)
        if (list[0]?.id) setAccountId(list[0].id)
      } catch {}
    })()
    return () => { alive = false }
  }, [])

  const load = React.useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const qs = new URLSearchParams()
      if (accountId) qs.set('accountId', accountId)
      const r = await fetch(`/api/reconciliation/sessions?${qs.toString()}`, { cache: 'no-store' })
      if (!r.ok) throw new Error('Failed to load sessions')
      const d = await r.json()
      const list = Array.isArray(d.sessions) ? d.sessions : []
      setSessions(list)
      // After sessions load, probe for discrepancies per session (lightweight)
      try {
        const entries = await Promise.all(list.map(async (s: any) => {
          try {
            const res = await fetch(`/api/reconciliation/discrepancies?sessionId=${encodeURIComponent(s.id)}`, { cache: 'no-store' })
            if (!res.ok) return [s.id, 'unknown'] as const
            const data = await res.json()
            const has = Array.isArray(data?.discrepancies) && data.discrepancies.length > 0
            return [s.id, has ? 'discrepancy' : 'ok'] as const
          } catch {
            return [s.id, 'unknown'] as const
          }
        }))
        const next: Record<string, 'ok' | 'discrepancy' | 'unknown'> = {}
        for (const [id, st] of entries) next[id] = st
        setStatusById(next)
      } catch {}
    } catch (e: any) { setError(e.message || 'Load failed') } finally { setLoading(false) }
  }, [accountId])

  React.useEffect(() => { load() }, [load])

  const undo = async (id: string) => {
    if (!confirm('Undo this reconciliation session?')) return
    try {
      const r = await fetch(`/api/reconciliation/sessions/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error((await r.json().catch(()=>({})))?.error || 'Undo failed')
      await load()
      alert('Reconciliation undone. Transactions were unreconciled.')
    } catch (e: any) { alert(e.message || 'Failed to undo') }
  }

  return (
    <div className="glass-card p-4" aria-label="Recent reconciliation sessions">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium">Recent reconciliation sessions</div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Filter by account"
            className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm"
            value={accountId}
            onChange={(e)=>setAccountId(e.target.value)}
          >
            <option value="">All accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.number} · {a.name}</option>
            ))}
          </select>
          <button className="btn-secondary !px-2 !py-1 text-xs" onClick={load} disabled={loading}>Refresh</button>
        </div>
      </div>
      <div className="mb-2 text-xs text-slate-600">Finished sessions appear here. Export reports, check discrepancies, or undo if needed.</div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {loading ? <div>Loading…</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="px-2 py-1">Created</th>
                <th className="px-2 py-1">Period end</th>
                <th className="px-2 py-1">Ending balance</th>
                <th className="px-2 py-1">Cleared count</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-2 py-1 whitespace-nowrap">{formatDateTimeLocal(s.createdAt)}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{s.periodEnd}</td>
                  <td className="px-2 py-1 whitespace-nowrap tabular-nums"><Amount value={s.endingBalance} /></td>
                  <td className="px-2 py-1">{s.clearedIds.length}</td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    {statusById[s.id] === 'discrepancy' ? (
                      <a
                        href={`/reports/reconciliation-discrepancy?sessionId=${encodeURIComponent(s.id)}`}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-[2px] text-[11px] font-medium text-amber-800 hover:bg-amber-200"
                        title="Changes detected since this session was finished — view discrepancy report"
                        aria-label="Discrepancy detected. View discrepancy report"
                      >
                        Discrepancy
                      </a>
                    ) : statusById[s.id] === 'ok' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-[2px] text-[11px] font-medium text-emerald-800" title="No discrepancies detected">OK</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-[2px] text-[11px] font-medium text-slate-700" title="Status unknown">—</span>
                    )}
                  </td>
                  <td className="px-2 py-1 text-right">
                    <div className="inline-flex items-center gap-2">
                      <a
                        className="btn-secondary py-1 px-2 text-xs"
                        href={`/api/reconciliation/sessions/${encodeURIComponent(s.id)}/export?csv=latest`}
                        title="Download reconciliation report (CSV)"
                        aria-label="Download reconciliation report (CSV)"
                      >Export CSV</a>
                      <a
                        className="btn-secondary py-1 px-2 text-xs"
                        href={`/reports/reconciliation-discrepancy?sessionId=${encodeURIComponent(s.id)}`}
                        title="Open discrepancy report for this session"
                        aria-label="Open discrepancy report for this session"
                      >Discrepancies</a>
                      {hasPermission(getRoleFromCookies(), 'journal:write') ? (
                        <button className="btn-secondary py-1 px-2 text-xs" onClick={()=>undo(s.id)} title="Undo this reconciliation (unreconciles the cleared items)">Undo</button>
                      ) : (
                        <button className="btn-secondary py-1 px-2 text-xs opacity-50 cursor-not-allowed" disabled title="You don't have permission to undo">Undo</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!sessions.length && (
                <tr>
                  <td className="px-2 py-3 text-slate-500" colSpan={6}>No recent sessions.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ReconcilePageInner() {
  const sp = useSearchParams()
  const hasParams = Boolean(sp.get('accountId') && sp.get('endingBalance') && sp.get('periodEnd'))
  return (
    <div className="space-y-4">
      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Reconcile</div>
          <div className="text-slate-600 text-sm">Start a new reconciliation or continue where you left off.</div>
        </div>
        <a className="btn-primary" href="/transactions/reconcile/start">Start new</a>
      </div>
      {hasParams ? (<ReconcileWorkbench />) : null}
      <RecentSessions />
    </div>
  )
}

export default function ReconcilePage() {
  return (
    <Suspense fallback={<div className="glass-card" aria-busy="true">Loading…</div>}>
      <ReconcilePageInner />
    </Suspense>
  )
}
