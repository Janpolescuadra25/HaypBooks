"use client"
import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HelpPopover from '@/components/HelpPopover'

function ReconcileStartPageInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const [accounts, setAccounts] = React.useState<Array<{ id: string; number: string; name: string }>>([])
  const [accountId, setAccountId] = React.useState<string>('')
  const [periodEnd, setPeriodEnd] = React.useState<string>('')
  const [beginningBalance, setBeginningBalance] = React.useState<string>('')
  const [endingBalance, setEndingBalance] = React.useState<string>('')
  const [serviceCharge, setServiceCharge] = React.useState<string>('')
  const [interestEarned, setInterestEarned] = React.useState<string>('')
  const [hint, setHint] = React.useState<string>('')
  const [beginLocked, setBeginLocked] = React.useState<boolean>(false)
  const [minPeriodEnd, setMinPeriodEnd] = React.useState<string>('')

  // Prefill from query if returning to edit
  React.useEffect(() => {
    const aid = sp.get('accountId') || ''
    const pe = sp.get('periodEnd') || ''
    const bb = sp.get('beginningBalance') || ''
    const eb = sp.get('endingBalance') || ''
    const sc = sp.get('serviceCharge') || ''
    const ie = sp.get('interestEarned') || ''
    if (aid) setAccountId(aid)
    if (pe) setPeriodEnd(pe)
    if (bb) setBeginningBalance(bb)
    if (eb) setEndingBalance(eb)
    if (sc) setServiceCharge(sc)
    if (ie) setInterestEarned(ie)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        // Request only reconcilable accounts with balances; server already filters by active
        const r = await fetch('/api/accounts?includeBalances=1&reconcilable=1', { cache: 'no-store' })
        const d = r.ok ? await r.json() : null
        let list = Array.isArray(d?.accounts) ? d.accounts : []
        if (!alive) return
        setAccounts(list)
      } catch {
        if (!alive) return
        setAccounts([])
      }
    })()
    return () => { alive = false }
  }, [accountId])

  // Prefer defaulting to the most recently reconciled account when none selected
  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (accountId) return // user or query already chose an account
        if (!accounts.length) return
        const r = await fetch('/api/reconciliation/sessions', { cache: 'no-store' })
        const d = r.ok ? await r.json() : null
        const sessions: Array<{ accountId: string; periodEnd?: string; createdAt?: string }> = Array.isArray(d?.sessions) ? d.sessions : []
        if (!alive) return
        if (sessions.length) {
          const lastAcct = sessions[0].accountId
          if (accounts.some(a => a.id === lastAcct)) {
            setAccountId(lastAcct)
            return
          }
        }
        // fallback to first account
        if (accounts[0]?.id) setAccountId(accounts[0].id)
      } catch { /* noop */ }
    })()
    return () => { alive = false }
  }, [accountId, accounts])

  // Auto-prefill beginning balance from last session or account balance
  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (!accountId) return
        const sres = await fetch(`/api/reconciliation/sessions?accountId=${encodeURIComponent(accountId)}`, { cache: 'no-store' })
        const sj = sres.ok ? await sres.json() : { sessions: [] }
        const sessions: Array<{ id: string; endingBalance: number; periodEnd?: string }> = Array.isArray(sj.sessions) ? sj.sessions : []
        let bb: number | undefined
        let src = ''
        // Small helpers to compute period-end defaults
        const pad = (n: number) => String(n).padStart(2, '0')
        const toIsoLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
        const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0)
        const nextMonthEndFromIso = (iso: string) => {
          const dt = new Date(`${iso}T00:00:00`)
          // compute end of the month following dt
          const next = new Date(dt.getFullYear(), dt.getMonth() + 2, 0)
          return toIsoLocal(next)
        }
        if (sessions.length) {
          bb = Number(sessions[0].endingBalance || 0)
          src = sessions[0].periodEnd ? `from last reconciliation (${sessions[0].periodEnd})` : 'from last reconciliation'
          if (!beginLocked) setBeginLocked(true)
          if (sessions[0].periodEnd) setMinPeriodEnd(sessions[0].periodEnd)
          // Prefill statement period end to the next month-end after the last session
          if (!periodEnd) {
            const fallback = sessions[0].periodEnd ? nextMonthEndFromIso(sessions[0].periodEnd) : toIsoLocal(endOfMonth(new Date()))
            setPeriodEnd(fallback)
          }
        } else {
          const acc = (accounts as any[]).find(a => a.id === accountId)
          if (acc && typeof acc.balance === 'number') { bb = Number(acc.balance || 0); src = 'from current account balance' }
          if (beginLocked) setBeginLocked(false)
          setMinPeriodEnd('')
          // No prior session: default to current month-end if user hasn't chosen
          if (!periodEnd) {
            const today = new Date()
            setPeriodEnd(toIsoLocal(endOfMonth(today)))
          }
        }
        if (!alive) return
        if (typeof bb === 'number' && !Number.isNaN(bb)) {
          setBeginningBalance(prev => prev || String(bb))
          setHint(src)
        }
      } catch { /* noop */ }
    })()
    return () => { alive = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, periodEnd, accounts])

  const start = (e: React.FormEvent) => {
    e.preventDefault()
    const qs = new URLSearchParams({ accountId, periodEnd, beginningBalance, endingBalance })
    if (serviceCharge) qs.set('serviceCharge', serviceCharge)
    if (interestEarned) qs.set('interestEarned', interestEarned)
    router.push(`/transactions/reconcile?${qs.toString()}`)
  }

  return (
    <div className="space-y-4">

      <form onSubmit={start} className="glass-card p-4 space-y-4" aria-label="Start reconciliation">
        <div className="flex items-start justify-between gap-2">
          <div className="text-lg font-semibold">Start reconciliation</div>
          <HelpPopover ariaLabel="Reconciliation prep" buttonAriaLabel="What you'll need" storageKey="reconcile-start-help">
            <div className="mb-1 font-medium">What you’ll need</div>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li>Your bank statement with the ending date and balance.</li>
              <li>The correct opening balance for this period.</li>
              <li>Any statement-only items (fees, interest) to record at Finish.</li>
            </ul>
            <div className="mt-2 text-sm text-slate-700">Pick the account, set the period end, confirm balances, then Start. You can edit these later from the workbench.</div>
          </HelpPopover>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block" htmlFor="recon-account">
            <div className="text-sm text-slate-700 mb-1">Account</div>
            <select id="recon-account" className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              value={accountId}
              onChange={(e)=>setAccountId(e.target.value)}
              required
              autoFocus={!accountId}
            >
              <option value="" disabled>Select an account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.number} · {a.name}</option>
              ))}
            </select>
            <div className="mt-1 text-xs text-slate-500">Only accounts with real statements appear here (for example, cash, cards, loans).</div>
          </label>
          <label className="block" htmlFor="recon-periodEnd">
            <div className="text-sm text-slate-700 mb-1">Statement period end</div>
            <input id="recon-periodEnd" type="date" className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              value={periodEnd} onChange={(e)=>setPeriodEnd(e.target.value)} required min={minPeriodEnd || undefined} />
            {minPeriodEnd ? (
              <div className="mt-1 text-xs text-slate-500">Must be on or after your last reconciliation end date: {minPeriodEnd}.</div>
            ) : null}
          </label>
          <label className="block" htmlFor="recon-begin">
            <div className="text-sm text-slate-700 mb-1">Beginning balance</div>
            <input id="recon-begin" type="number" step="0.01" inputMode="decimal" className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 disabled:opacity-60"
              value={beginningBalance}
              onChange={(e)=>setBeginningBalance(e.target.value)}
              placeholder="0.00"
              disabled={beginLocked}
              title={beginLocked ? 'Beginning balance is locked to the last reconciliation ending balance' : undefined}
            />
            {hint ? (
              <div className="mt-1 text-xs text-slate-500">
                Beginning balance auto-filled {hint}.
                {beginLocked ? ' This amount is locked. To change it, adjust the prior reconciliation.' : ''}
              </div>
            ) : null}
            {!beginLocked ? (
              <div className="mt-1 text-xs text-slate-600">
                First time reconciling this account? Use the opening balance from your bank statement on your start date. If you’re migrating, use the ending balance from the prior system as your opening balance. Don’t force a mismatch—fix underlying transactions instead.
              </div>
            ) : null}
          </label>
          <label className="block" htmlFor="recon-end">
            <div className="text-sm text-slate-700 mb-1">Statement ending balance</div>
            <input id="recon-end" type="number" step="0.01" inputMode="decimal" className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              value={endingBalance} onChange={(e)=>setEndingBalance(e.target.value)} placeholder="0.00" required autoFocus={!!accountId && !endingBalance} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm text-slate-700 mb-1">Service charge (optional)</div>
            <input type="number" step="0.01" inputMode="decimal" className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              value={serviceCharge} onChange={(e)=>setServiceCharge(e.target.value)} placeholder="0.00" />
          </label>
          <label className="block">
            <div className="text-sm text-slate-700 mb-1">Interest earned (optional)</div>
            <input type="number" step="0.01" inputMode="decimal" className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              value={interestEarned} onChange={(e)=>setInterestEarned(e.target.value)} placeholder="0.00" />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2">
          <a className="btn-secondary" href="/transactions/reconcile">Cancel</a>
          <button type="submit" className="btn-primary">Start reconciling</button>
        </div>
      </form>
    </div>
  )
}

export default function ReconcileStartPage() {
  return (
    <Suspense fallback={<div className="glass-card" aria-busy="true">Loading…</div>}>
      <ReconcileStartPageInner />
    </Suspense>
  )
}
