"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HelpPopover from './HelpPopover'
import Amount from '@/components/Amount'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'

type Account = { id: string; number: string; name: string }
type Txn = { id: string; date: string; description: string; amount: number; accountId: string; bankStatus?: string; cleared?: boolean; reconciled?: boolean }

// Use shared Amount component for currency displays

export default function ReconcileWorkbench() {
  const sp = useSearchParams() ?? new URLSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const spString = useMemo(() => sp.toString(), [sp])
  const preferredAccountIdRef = useRef<string | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountId, setAccountId] = useState<string>("")
  const [periodEnd, setPeriodEnd] = useState<string>(new Date().toISOString().slice(0,10))
  const [beginningBalance, setBeginningBalance] = useState<string>("")
  const [endingBalance, setEndingBalance] = useState<string>("")
  const [serviceCharge, setServiceCharge] = useState<string>("")
  const [interestEarned, setInterestEarned] = useState<string>("")
  const [txns, setTxns] = useState<Txn[]>([])
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [txnTypeFilter, setTxnTypeFilter] = useState<'all'|'payments'|'deposits'>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { loading: permsLoading, has } = usePermissions()
  const [lastSessionId, setLastSessionId] = useState<string | null>(null)
  const [discrepancy, setDiscrepancy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [note, setNote] = useState<string>("")
  const [beginLocked, setBeginLocked] = useState<boolean>(false)
  const firstActionRef = useRef<HTMLInputElement | null>(null)
  const initialFocusDoneRef = useRef(false)
  // Live region for announcing important state changes (a11y)
  const [liveMessage, setLiveMessage] = useState<string>("")
  const prevZeroRef = useRef<boolean>(false)
  // Recent sessions are handled at the page level to avoid duplication

  useEffect(() => { (async () => {
    try {
      const res = await fetch('/api/accounts?q=1000', { cache: 'no-store' })
      const data = res.ok ? await res.json() : { accounts: [] }
      // fallback: if API requires RBAC, try without query
      const list = data?.accounts || []
      setAccounts(list)
      // Initialize account from captured URL or default to first
      const fromUrl = preferredAccountIdRef.current || ''
      if (fromUrl && list.some((a: any)=>a.id===fromUrl)) setAccountId(fromUrl)
      else if (list[0]?.id) setAccountId(list[0].id)
    } catch { setAccounts([]) }
  })() }, [])

  // Initialize from URL params (and react to URL changes)
  useEffect(() => {
    const params = new URLSearchParams(spString)
    const aid = params.get('accountId') || null; preferredAccountIdRef.current = aid
    const begin = params.get('beginningBalance'); if (begin !== null) setBeginningBalance(begin)
    const end = params.get('endingBalance'); if (end !== null) setEndingBalance(end)
    const pe = params.get('periodEnd'); if (pe) setPeriodEnd(pe)
    const fee = params.get('serviceCharge'); if (fee !== null) setServiceCharge(fee || '')
    const intv = params.get('interestEarned'); if (intv !== null) setInterestEarned(intv || '')
    // accountId handled after accounts load
  }, [spString])

  // No sessions loading here; page-level component owns it

  const loadTxns = useCallback(async () => {
    if (!accountId) return
    setLoading(true); setError(null)
    try {
      const qs = new URLSearchParams({ page: '1', limit: '500', accountId })
      const res = await fetch(`/api/transactions?${qs.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load transactions')
  const data = await res.json() as { transactions: Txn[] }
      setTxns(data.transactions)
  // start all unchecked; user will check items that appear on the statement
      setChecked({})
    } catch (e: any) { setError(e.message || 'Load failed') } finally { setLoading(false) }
  }, [accountId])

  useEffect(() => { loadTxns() }, [loadTxns])

  // Check for discrepancy on mount/account change by calling session detail and comparing fields client-side (thin check)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (!accountId) return
        const r = await fetch(`/api/reconciliation/sessions?accountId=${encodeURIComponent(accountId)}`, { cache: 'no-store' })
        if (!r.ok) return
        const d = await r.json()
        const sessions: Array<any> = Array.isArray(d.sessions) ? d.sessions : []
        if (!sessions.length) { if (alive) { setDiscrepancy(null); setBeginLocked(false) } return }
        const latest = sessions[0]
        // Enforce beginning balance to be locked to prior ending for this account in the workbench
        if (alive) {
          setBeginLocked(true)
          const enforced = Number(latest.endingBalance || 0)
          setBeginningBalance(String(enforced))
        }
        // Lightweight heuristic: if any currently reconciled transaction differs by id/date/amount vs snapshot, warn
        const detailRes = await fetch(`/api/reconciliation/sessions/${encodeURIComponent(latest.id)}`)
        if (!detailRes.ok) { if (alive) setDiscrepancy(null); return }
        const detail = await detailRes.json()
        const snap: Array<{ id: string; date: string; amount: number }> = detail.session?.snapshot || []
        if (!Array.isArray(snap) || !snap.length) { if (alive) setDiscrepancy(null); return }
        const byId = new Map<string, { date: string; amount: number }>()
        for (const s of snap) byId.set(s.id, { date: s.date, amount: Number(s.amount || 0) })
        let changed = false
        for (const t of txns) {
          if (!byId.has(t.id)) continue
          const s = byId.get(t.id)!
          const curDate = String(t.date || '').slice(0,10)
          const curAmt = Number(t.amount || 0)
          if (curDate !== s.date || Math.abs(curAmt - s.amount) > 0.0001) { changed = true; break }
        }
        if (alive) setDiscrepancy(changed ? 'Previously reconciled items have changed since the last reconciliation. Review prior periods.' : null)
      } catch { if (alive) setDiscrepancy(null) }
    })()
    return () => { alive = false }
  }, [accountId, txns])

  const clearedSet = useMemo(() => txns.filter(t => checked[t.id]), [txns, checked])
  const clearedDeposits = useMemo(() => clearedSet.filter(t => t.amount > 0), [clearedSet])
  const clearedPayments = useMemo(() => clearedSet.filter(t => t.amount < 0), [clearedSet])
  const clearedDepositsTotal = useMemo(() => clearedDeposits.reduce((s,t)=> s + t.amount, 0), [clearedDeposits])
  const clearedPaymentsTotalAbs = useMemo(() => clearedPayments.reduce((s,t)=> s + Math.abs(t.amount), 0), [clearedPayments])
  const adjTotal = (Number(serviceCharge||0) * -1) + Number(interestEarned||0)
  const clearedBalance = useMemo(() => {
    const begin = Number(beginningBalance || 0)
    // Cleared balance = beginning - payments + deposits + adjustments
    return begin - clearedPaymentsTotalAbs + clearedDepositsTotal + adjTotal
  }, [beginningBalance, clearedPaymentsTotalAbs, clearedDepositsTotal, adjTotal])
  const difference = useMemo(() => {
    const endBal = Number(endingBalance || 0)
    return endBal - clearedBalance
  }, [endingBalance, clearedBalance])

  // Announce when Difference reaches zero (ready to finish)
  useEffect(() => {
    const isZero = Math.abs(difference) < 0.0001
    if (isZero && !prevZeroRef.current) {
      setLiveMessage('Difference is zero. You are ready to finish reconciliation.')
      // clear after a short delay to avoid repeated announcements
      const t = window.setTimeout(() => setLiveMessage(''), 2000)
      return () => window.clearTimeout(t)
    }
    prevZeroRef.current = isZero
  }, [difference])

  // Memoized filtered txns (by period end and type) for rendering and focusing
  const filteredTxns = useMemo(() => {
    return txns
      .filter(t => String(t.date||'').slice(0,10) <= periodEnd)
      .filter(t => txnTypeFilter==='all' ? true : txnTypeFilter==='payments' ? t.amount < 0 : t.amount > 0)
  }, [txns, periodEnd, txnTypeFilter])

  // A11y: autofocus first actionable control (first row checkbox) on initial load
  useEffect(() => {
    if (initialFocusDoneRef.current) return
    if (loading) return
    if (filteredTxns.length === 0) return
    // Allow paint before focusing
    const id = window.setTimeout(() => {
      if (!initialFocusDoneRef.current) {
        firstActionRef.current?.focus()
        initialFocusDoneRef.current = true
      }
    }, 0)
    return () => window.clearTimeout(id)
  }, [filteredTxns, loading])

  const finishDisabled = !accountId || !periodEnd || endingBalance === '' || Math.abs(difference) > 0.0001 || (!permsLoading && !has('journal:write'))
  const finishDisabledReason = useMemo(() => {
    if (!accountId) return 'Select an account to reconcile.'
    if (!periodEnd) return 'Choose the statement period end.'
    if (endingBalance === '') return 'Enter the statement ending balance.'
    if (!permsLoading && !has('journal:write')) return 'You do not have permission to finish reconciliations.'
    if (Math.abs(difference) > 0.0001) return 'Difference must be zero to finish.'
    return ''
  }, [accountId, periodEnd, endingBalance, permsLoading, has, difference])

  return (
    <div className="space-y-4">
      {/* Screen reader live region for important updates */}
      <div className="sr-only" aria-live="polite">{liveMessage}</div>

      {/* Summary header: Ending vs Cleared vs Difference (single source of truth) */}
      <div className="glass-card p-4" aria-label="Reconciliation summary">
        {discrepancy ? (
          <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 text-amber-800 text-sm px-3 py-2" role="status">
            {discrepancy}
          </div>
        ) : null}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-slate-800">Summary</div>
          <div className="flex items-center gap-2">
            <HelpPopover ariaLabel="Reconciliation checklist" buttonAriaLabel="Show reconciliation checklist" storageKey="reconcile-checklist">
            <div className="mb-1 font-medium">Reconciliation checklist</div>
            <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1">
              <li>Confirm the beginning balance matches the prior ending balance.</li>
              <li>Check off items that appear on the statement; leave uncleared items unchecked.</li>
              <li>Record statement-only items (fees, interest) so totals align.</li>
              <li>Target <strong>Difference = 0.00</strong>. If not: look for missing lines, duplicates, or wrong amounts/dates.</li>
              <li>When Difference is zero, Finish to save a session. Then Export to download the reconciliation report.</li>
              <li>Need to undo? Use Recent sessions to revert a finished reconciliation.</li>
            </ol>
            <div className="mt-3 mb-1 font-medium">Troubleshooting (when Difference won’t reach zero)</div>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li><strong>Beginning balance off?</strong> Resolve prior-period changes first; reopened entries skew the current period.</li>
              <li><strong>Missing transactions:</strong> Add the statement lines not in the register, then mark them cleared.</li>
              <li><strong>Duplicates:</strong> Exclude extra copies (for example, manual + feed) to preserve the audit trail.</li>
              <li><strong>Typos:</strong> Correct amounts/dates to match the statement exactly.</li>
              <li><strong>Bank-only items:</strong> Record service charges and interest to align totals.</li>
              <li><strong>Odd cents:</strong> Check rounding, tax, or currency conversions; don’t force a mismatch.</li>
            </ul>
            </HelpPopover>
            {!permsLoading && !has('journal:write') && (
              <span className="text-xs text-amber-700" role="status">You don’t have permission to finish reconciliations.</span>
            )}
            <button
              className="btn-primary disabled:opacity-50"
              aria-label="Finish reconciliation"
              disabled={finishDisabled}
              onClick={async () => {
                try {
                  // Persist reconciliation session
                  const clearedIds = txns.filter(t => checked[t.id]).map(t => t.id)
                  const payload = {
                    accountId,
                    periodEnd,
                    endingBalance: Number(endingBalance),
                    // When locked, do not send beginningBalance; server will enforce from prior ending
                    beginningBalance: beginLocked ? undefined : (beginningBalance ? Number(beginningBalance) : undefined),
                    serviceCharge: serviceCharge ? Number(serviceCharge) : undefined,
                    interestEarned: interestEarned ? Number(interestEarned) : undefined,
                    clearedIds,
                    note: note || undefined,
                  }
                  const res = await fetch('/api/reconciliation/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                  if (!res.ok) {
                    const msg = (await res.json().catch(()=>({})))?.error || 'Failed to finalize reconciliation'
                    throw new Error(msg)
                  }
                  const created = await res.json().catch(()=>null) as any
                  const sessId = created?.session?.id
                  if (!sessId) throw new Error('Session created without id')
                  setLastSessionId(sessId)
                  // Refresh and show non-blocking notice
                  await loadTxns()
                  const qs = new URLSearchParams(sp.toString()); qs.set('notice', 'Reconciliation finalized')
                  router.replace(`${pathname}?${qs.toString()}` as any)
                } catch (e: any) {
                  const msg = e?.message || 'Failed to finalize reconciliation'
                  const qs = new URLSearchParams(sp.toString()); qs.set('notice', msg)
                  router.replace(`${pathname}?${qs.toString()}` as any)
                }
              }}
            >Finish</button>
            <button
              className="btn-secondary disabled:opacity-50"
              aria-label="Export reconciliation report"
              disabled={!lastSessionId}
              onClick={async () => {
                if (!lastSessionId) return
                try {
                  const exportRes = await fetch(`/api/reconciliation/sessions/${encodeURIComponent(lastSessionId)}/export?csv=latest`)
                  if (!exportRes.ok) throw new Error('Failed to download reconciliation report')
                  const blob = await exportRes.blob()
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  const disp = exportRes.headers.get('Content-Disposition') || ''
                  const m = /filename="?([^";]+)"?/i.exec(disp || '')
                  a.download = m?.[1] || `reconciliation-session-${periodEnd}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                } catch (e: any) {
                  const msg = e?.message || 'Failed to export reconciliation report'
                  const qs = new URLSearchParams(sp.toString()); qs.set('notice', msg)
                  router.replace(`${pathname}?${qs.toString()}` as any)
                }
              }}
            >Export report</button>
            {lastSessionId ? (
              <div className="ml-2 flex items-center gap-2 text-xs text-slate-600" aria-live="polite">
                <span>Ready to export last session</span>
                <button
                  className="underline hover:text-slate-800"
                  onClick={async () => {
                    try {
                      const origin = typeof window !== 'undefined' ? window.location.origin : ''
                      const link = `${origin}/api/reconciliation/sessions/${encodeURIComponent(lastSessionId)}/export?csv=latest`
                      if (navigator?.clipboard?.writeText) {
                        await navigator.clipboard.writeText(link)
                      }
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    } catch {
                      // no-op on copy failure
                    }
                  }}
                >Copy link</button>
                {copied && <span className="text-emerald-700">Copied</span>}
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-2">
          <label className="block text-xs text-slate-700 mb-1" htmlFor="recon-note">Notes (optional)</label>
          <textarea id="recon-note" className="w-full rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" rows={2} value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Statement ref, issues found, adjustments rationale" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg border border-slate-200 bg-white/80 p-3">
            <div className="text-slate-600">Statement ending balance</div>
            <div className="text-xl font-semibold text-slate-900"><Amount value={Number(endingBalance||0)} /></div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white/80 p-3">
            <div className="text-slate-600">Cleared balance</div>
            <div className="text-xl font-semibold text-slate-900"><Amount value={clearedBalance} /></div>
            <div className="mt-2 text-xs text-slate-600 flex flex-wrap gap-3">
              <span>
                Beginning:
                <span className="ml-1 font-medium text-slate-900"><Amount value={Number(beginningBalance||0)} /></span>
                {beginLocked && (
                  <span
                    className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-[2px] text-[10px] font-medium text-slate-700"
                    title="Beginning balance is locked to the prior ending balance. To change it, resolve prior periods first."
                    aria-label="Beginning balance locked to prior ending balance"
                  >
                    locked
                  </span>
                )}
              </span>
              <span>Payments: <span className="font-medium text-slate-900"><Amount value={clearedPaymentsTotalAbs} /></span> <span className="text-slate-500">({clearedPayments.length})</span></span>
              <span>Deposits: <span className="font-medium text-slate-900"><Amount value={clearedDepositsTotal} /></span> <span className="text-slate-500">({clearedDeposits.length})</span></span>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white/80 p-3">
            <div className="text-slate-600 flex items-center gap-2">
              Difference
              <HelpPopover ariaLabel="Difference help" buttonAriaLabel="Explain Difference" storageKey="reconcile-diff-help">
                <div className="mb-1 font-medium">How Difference is calculated</div>
                <div className="text-sm text-slate-700">Difference = Statement ending balance − Cleared balance.</div>
                <ul className="list-disc pl-5 text-sm text-slate-700 mt-2 space-y-1">
                  <li>Cleared balance = Beginning − Payments + Deposits ± Statement-only items.</li>
                  <li>Finish is enabled only when Difference is exactly 0.00.</li>
                  <li>If not zero, review missing lines, duplicates, dates, or amounts.</li>
                </ul>
              </HelpPopover>
            </div>
            <div className={`text-xl font-semibold ${Math.abs(difference) < 0.0001 ? 'text-emerald-600' : 'text-rose-800'}`}><Amount value={difference} /></div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <label className="rounded-lg border border-slate-200 bg-white/80 p-3 block">
            <div className="text-slate-600">Service charge (optional)</div>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white/80 px-2 py-1"
              value={serviceCharge}
              onChange={e => setServiceCharge(e.target.value)}
              aria-label="Service charge"
              placeholder="0.00"
              title="Bank fees on the statement that aren't yet in the register"
            />
          </label>
          <label className="rounded-lg border border-slate-200 bg-white/80 p-3 block">
            <div className="text-slate-600">Interest earned (optional)</div>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white/80 px-2 py-1"
              value={interestEarned}
              onChange={e => setInterestEarned(e.target.value)}
              aria-label="Interest earned"
              placeholder="0.00"
              title="Interest on the statement not yet recorded in the register"
            />
          </label>
          <div className="rounded-lg border border-slate-200 bg-white/80 p-3 text-xs text-slate-600">
            These statement-only items will be posted at Finish using the period end date.
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end">
          <a
            className="btn-secondary btn-xs"
            href={`/transactions/reconcile/start?${new URLSearchParams({
              accountId: accountId || '',
              periodEnd,
              // Don't forward beginningBalance when locked; Start page will lock and show the enforced amount
              ...(beginLocked ? {} as any : { beginningBalance: beginningBalance || '' }),
              endingBalance: endingBalance || '',
              serviceCharge: serviceCharge || '',
              interestEarned: interestEarned || ''
            }).toString()}`}
          >Edit info</a>
          {finishDisabled && finishDisabledReason ? (
            <span className="ml-3 text-xs text-slate-600" role="status" aria-live="polite">{finishDisabledReason}</span>
          ) : null}
          <button
            className="ml-2 btn-secondary btn-xs disabled:opacity-50"
            disabled={!lastSessionId}
            onClick={async () => {
              if (!lastSessionId) return
              try {
                const res = await fetch(`/api/reconciliation/sessions/${encodeURIComponent(lastSessionId)}/export?csv=discrepancy`)
                if (!res.ok) throw new Error('Failed to download discrepancy report')
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                const disp = res.headers.get('Content-Disposition') || ''
                const m = /filename="?([^";]+)"?/i.exec(disp || '')
                a.download = m?.[1] || `reconciliation-discrepancy-${periodEnd}.csv`
                a.click()
                URL.revokeObjectURL(url)
              } catch (e: any) {
                const msg = e?.message || 'Failed to export discrepancy report'
                const qs = new URLSearchParams(sp.toString()); qs.set('notice', msg)
                router.replace(`${pathname}?${qs.toString()}` as any)
              }
            }}
          >Discrepancy report</button>
        </div>
      </div>

      {/* Recent sessions are shown on the page, not here (avoid duplication) */}

      <div className="glass-card p-4" aria-label="Reconcile transactions">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {loading ? <div>Loading…</div> : (
          <div className="overflow-x-auto">
            {/* Hide transactions after the statement period end; show a small hint when any are hidden */}
            {(() => {
              const afterCount = txns.filter(t => String(t.date||'').slice(0,10) > periodEnd).length
              return afterCount > 0 ? (
                <div className="mb-2 text-xs text-slate-600" role="status">{afterCount} transaction(s) after {periodEnd} are hidden. Adjust the period end on Start if needed.</div>
              ) : null
            })()}
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-xs text-slate-600">Filter:</div>
              <div className="inline-flex rounded-md border border-slate-200 overflow-hidden">
                <button className={`px-2 py-1 text-xs ${txnTypeFilter==='all'?'bg-sky-50 text-sky-800':'bg-white/80 text-slate-700 hover:bg-white'}`} onClick={()=>setTxnTypeFilter('all')} aria-label="Show all transactions">All</button>
                <button className={`px-2 py-1 text-xs ${txnTypeFilter==='payments'?'bg-sky-50 text-sky-800':'bg-white/80 text-slate-700 hover:bg-white'}`} onClick={()=>setTxnTypeFilter('payments')} aria-label="Show payments (out)" >Payments</button>
                <button className={`px-2 py-1 text-xs ${txnTypeFilter==='deposits'?'bg-sky-50 text-sky-800':'bg-white/80 text-slate-700 hover:bg-white'}`} onClick={()=>setTxnTypeFilter('deposits')} aria-label="Show deposits (in)">Deposits</button>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary btn-xs" onClick={loadTxns}>Refresh</button>
                <a
                  className="btn-secondary btn-xs"
                  href="/bank-transactions"
                  title="Open bank feeds to pull and apply rules"
                  aria-label="Open bank feeds to pull and apply rules"
                >Open bank feeds</a>
              </div>
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-2 py-1">Clear</th>
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Description</th>
                  <th className="px-2 py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxns.map((t, idx) => {
                  const isReconciled = Boolean((t as any).reconciled)
                  return (
                    <tr key={t.id} className="border-t border-slate-100">
                      <td className="px-2 py-1">
                        <input
                          ref={idx === 0 ? firstActionRef : null}
                          type="checkbox"
                          checked={!!checked[t.id]}
                          onChange={(e)=>setChecked(p=>({...p,[t.id]:e.target.checked}))}
                          aria-label={`Clear ${t.description}`}
                          disabled={isReconciled}
                          title={isReconciled ? 'Already reconciled in a finished session. Undo that session to modify.' : undefined}
                          
                        />
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        {t.date.slice(0,10)}
                        {isReconciled ? (
                          <span
                            className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-[2px] text-[10px] font-medium text-slate-700"
                            title="This transaction is reconciled"
                            aria-label="Reconciled transaction"
                          >reconciled</span>
                        ) : null}
                      </td>
                      <td className="px-2 py-1 max-w-[32ch] truncate" title={t.description}>{t.description}</td>
                      <td className="px-2 py-1 text-right tabular-nums"><Amount value={t.amount} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Totals bar removed to avoid redundancy; summary above is the single source of truth. */}
    </div>
  )
}
