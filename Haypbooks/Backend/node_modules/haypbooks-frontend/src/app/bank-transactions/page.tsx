'use client'
import React, { Suspense, useEffect } from 'react'
import { DataTable } from '@/components/DataTable'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import HelpPopover from '@/components/HelpPopover'
import ActiveFilterBar from '@/components/ActiveFilterBar'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransactions } from '@/hooks/useTransactions'
import Notice from '@/components/Notice'
import DateRangeSelect from '@/components/DateRangeSelect'
import { flags } from '@/lib/flags'
import Amount from '@/components/Amount'

type Txn = { id: string; date: string; description: string; category: string; amount: number; accountId: string; bankStatus?: string; splits?: Array<{ accountId: string; amount: number; memo?: string; tags?: string[] }> }
type TxnWithMatch = Txn & { matchedKind?: 'invoice' | 'bill' | 'deposit' | 'transfer'; matchedId?: string; matchedCount?: number; matchedRef?: string }

function BankTransactionsContent() {
  const [canWrite, setCanWrite] = React.useState(false)
  const [showLinkBank, setShowLinkBank] = React.useState(false)
  const [uploadBusy, setUploadBusy] = React.useState(false)
  const [counts, setCounts] = React.useState<{ for_review: number; categorized: number; excluded: number }>({ for_review: 0, categorized: 0, excluded: 0 })
  const [selected, setSelected] = React.useState<string[]>([])
  const [matchPanel, setMatchPanel] = React.useState<{ txnId: string; items: Array<{ kind: 'invoice' | 'bill' | 'deposit' | 'transfer'; id: string; number: string; name: string; date: string; balance: number }> } | null>(null)
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null)
  const [bulkOpen, setBulkOpen] = React.useState(false)
  const [showCatFor, setShowCatFor] = React.useState<string | null>(null)
  const [showSplitFor, setShowSplitFor] = React.useState<string | null>(null)
  const [showManualFor, setShowManualFor] = React.useState<string | null>(null)
  const [suggestionCounts, setSuggestionCounts] = React.useState<Record<string, number>>({})
  // User preference: reduce hover/animation effects
  const [reducedHover, setReducedHover] = React.useState<boolean>(false)
  const [matchChooser, setMatchChooser] = React.useState<{
    open: boolean
    txnId?: string
    items?: Array<{ kind: 'invoice'|'bill'|'deposit'|'transfer'; id: string; number: string; name: string; date: string; balance: number }>
  }>({ open: false })

  // Ensure only one inline panel is visible at a time per expanded row
  React.useEffect(() => {
    if (showCatFor || showSplitFor || showManualFor) {
      if (matchPanel) setMatchPanel(null)
    }
  }, [showCatFor, showSplitFor, showManualFor, matchPanel])

  React.useEffect(() => {
    if (matchPanel) {
      if (showCatFor) setShowCatFor(null)
      if (showSplitFor) setShowSplitFor(null)
      if (showManualFor) setShowManualFor(null)
    }
  }, [matchPanel, showCatFor, showSplitFor, showManualFor])

  
  const [showTransfer, setShowTransfer] = React.useState(false)
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const start = sp.get('start') || ''
  const end = sp.get('end') || ''
  const type = sp.get('type') || ''
  const bankStatus = sp.get('bankStatus') || ''
  const accountId = sp.get('accountId') || ''
  const tag = sp.get('tag') || ''
  const page = parseInt(sp.get('page') || '1')
  const limit = parseInt(sp.get('limit') || '20')
  // Ensure the table lands in the For Review tab even on first render before the URL updates
  const effectiveBankStatus: 'for_review' | 'categorized' | 'excluded' = (bankStatus === '' ? 'for_review' : (bankStatus as any))
  const { transactions, loading, error, update, refetch } = useTransactions({ start, end, type, page, limit, bankStatus: effectiveBankStatus, tag, accountId })
  const selectedTotal = React.useMemo(() => {
    try {
      return Number(
        transactions
          .filter(t => selected.includes(t.id))
          .reduce((s, t) => s + (Number((t as any).amount) || 0), 0)
          .toFixed(2)
      )
    } catch { return 0 }
  }, [transactions, selected])

  // Auto-discover matches for current page transactions (For Review only)
  React.useEffect(() => {
    if (effectiveBankStatus !== 'for_review') return
    if (!Array.isArray(transactions) || transactions.length === 0) return
    // If API provided suggestedCount, seed state and skip fetching for those ids
    const seeded: string[] = []
    transactions.forEach((t:any) => {
      if (typeof t.suggestedCount === 'number') {
        seeded.push(t.id)
        setSuggestionCounts(prev => (prev[t.id] === t.suggestedCount ? prev : { ...prev, [t.id]: t.suggestedCount! }))
      }
    })
    let cancelled = false
    // Performance: avoid refetching if we already discovered a count for this txn id
    const ids = transactions
      .map(t => t.id)
      .filter(id => !seeded.includes(id) && typeof suggestionCounts[id] === 'undefined')
    const run = async () => {
      // Limit concurrency to avoid spamming
      const limit = 4
      let cursor = 0
      async function worker() {
        while (!cancelled && cursor < ids.length) {
          const i = cursor++
          const id = ids[i]
          try {
            const resp = await fetch(`/api/bank-feeds/match-suggestions?txnId=${encodeURIComponent(id)}`)
            const j = resp.ok ? await resp.json().catch(()=>null) : null
            const items = Array.isArray(j?.result?.candidates) ? j.result.candidates : []
            if (cancelled) return
            setSuggestionCounts(prev => (prev[id] === items.length ? prev : { ...prev, [id]: items.length }))
          } catch {
            if (cancelled) return
            setSuggestionCounts(prev => (prev[id] === 0 ? prev : { ...prev, [id]: 0 }))
          }
        }
      }
      await Promise.all(Array.from({ length: Math.min(limit, ids.length) }, () => worker()))
    }
    if (ids.length > 0) {
      run()
    }
    return () => { cancelled = true }
  }, [transactions, effectiveBankStatus, suggestionCounts])

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        setCanWrite(!!p?.permissions?.includes?.('journal:write'))
      } catch { setCanWrite(false) }
    })()
  }, [])

  // Initialize reducedHover from persisted preference or OS-level reduced motion
  React.useEffect(() => {
    try {
      const persisted = typeof window !== 'undefined' ? window.localStorage.getItem('ui:reducedHover') : null
      const osPrefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setReducedHover(persisted === '1' || osPrefersReduced)
    } catch {}
  }, [])

  // Default to For Review tab if no bankStatus specified
  useEffect(() => {
    if (bankStatus) return
    const qs = new URLSearchParams(sp.toString())
    qs.set('bankStatus', 'for_review')
    qs.set('page', '1')
    router.replace(`${pathname}?${qs.toString()}` as any)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reusable: refresh counts across tabs
  const refreshCounts = React.useCallback(async () => {
    const fetchCount = async (status: 'for_review' | 'categorized' | 'excluded') => {
      const qs = new URLSearchParams()
      if (start) qs.set('start', start)
      if (end) qs.set('end', end)
      if (type) qs.set('type', type)
      if (accountId) qs.set('accountId', accountId)
      if (tag) qs.set('tag', tag)
      qs.set('bankStatus', status)
      qs.set('page', '1'); qs.set('limit', '1')
      const r = await fetch(`/api/transactions?${qs.toString()}`, { cache: 'no-store' })
      if (!r.ok) return 0
      const d = await r.json()
      return Number(d?.total || 0)
    }
    try {
      const [fr, cat, ex] = await Promise.all([
        fetchCount('for_review'),
        fetchCount('categorized'),
        fetchCount('excluded'),
      ])
      setCounts({ for_review: fr, categorized: cat, excluded: ex })
    } catch {
      setCounts({ for_review: 0, categorized: 0, excluded: 0 })
    }
  }, [start, end, type, tag, accountId])

  // Fetch counts on filter changes
  useEffect(() => { refreshCounts() }, [refreshCounts])

  const changeTab = (status: 'for_review' | 'categorized' | 'excluded') => {
    setSelected([])
    const qs = new URLSearchParams(sp.toString())
    qs.set('bankStatus', status)
    qs.set('page', '1')
    router.replace(`${pathname}?${qs.toString()}` as any)
  }

  const tabs: Array<{ key: 'for_review' | 'categorized' | 'excluded'; label: string }> = [
    { key: 'for_review', label: 'For Review' },
    { key: 'categorized', label: 'Categorized' },
    { key: 'excluded', label: 'Excluded' },
  ]
  // Balance summary for selected account
  const [bal, setBal] = React.useState<{ booksBalance?: number; bankBalance?: number|null; statementBalance?: number|null; statementDate?: string|null; differenceToBooks?: number|null } | null>(null)
  React.useEffect(() => {
    let alive = true
    if (!accountId) { setBal(null); return }
    fetch(`/api/accounts/balance-summary?accountId=${encodeURIComponent(accountId)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!alive) return; setBal(d || null) })
      .catch(() => { if (alive) setBal(null) })
    return () => { alive = false }
  }, [accountId])

  return (
    <div className="space-y-4">
      <Notice />
      {/* Connection health banner (mock, non-blocking) */}
      <ConnectionHealthBanner
        searchParams={sp}
        onLinkBank={()=>setShowLinkBank(true)}
      />
      {/* Guidance moved into help popover to avoid redundancy */}
      {/* Tabs: For Review, Categorized, Excluded with help */}
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-end pt-2 px-2">
          <button
            className="btn-primary btn-xs"
            onClick={()=>setShowLinkBank(true)}
            aria-label="Link bank"
            title="Connect a bank or card account"
          >Link bank…</button>
        </div>
        {/* Vertical account list with quick snapshots (desktop/tablet) */}
        <div className="hidden sm:block">
          <AccountListSidebar
            selectedId={accountId}
            onSelect={(id) => {
              const qs = new URLSearchParams(sp.toString())
              if (id) qs.set('accountId', id); else qs.delete('accountId')
              qs.set('page', '1')
              router.replace(`${pathname}?${qs.toString()}` as any)
            }}
          />
        </div>
        {/* Compact selector for small screens to avoid horizontal scrolling */}
        <div className="sm:hidden mt-2">
          <InlineAccountSelect
            id="account-compact"
            value={accountId}
            onChange={(id)=>{
              const qs = new URLSearchParams(sp.toString())
              if (id) qs.set('accountId', id); else qs.delete('accountId')
              qs.set('page', '1')
              router.replace(`${pathname}?${qs.toString()}` as any)
            }}
          />
        </div>
        {/* Balances strip removed per request */}
        {/* Review tabs placed under bank selection */}
        <div className="glass-formbar print:hidden px-3 py-2 mt-3 flex items-center justify-between gap-2">
          <div role="tablist" aria-label="Bank review tabs" className="flex gap-2">
            {tabs.map(t => (
              <button
                key={t.key}
                role="tab"
                className={`rounded-lg px-3 py-1.5 text-sm border ${(effectiveBankStatus === t.key) ? 'bg-hb-primary-50 border-hb-primary-200 text-hb-primary-700' : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'}`}
                onClick={() => changeTab(t.key)}
              >{t.label} <span className="text-xs text-slate-500">({counts[t.key] || 0})</span></button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <HelpPopover ariaLabel="Bank review strategy" buttonAriaLabel="Show bank review strategy" storageKey="bank-review">
            <div className="mb-1 font-medium">Bank review strategy</div>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li><strong>For Review</strong> is the inbox for new or uncategorized items.</li>
              <li><strong>Match before you add</strong>: link to existing invoices/bills/deposits when possible; only add new when there’s no match.</li>
              <li><strong>Exclude duplicates</strong> (don’t delete) to preserve the audit trail.</li>
              <li>Use <strong>Rules</strong> for recurring descriptions; order from most specific to general and add splits when allocations vary.</li>
              <li>Work in <strong>batches</strong>: filter by amount, date, tag, or text to speed up consistent decisions.</li>
              <li>Missing lines from the institution? Use a <strong>CSV upload</strong> as a fallback intake method.</li>
              <li><strong>Feeds are intake; reconciliation is verification</strong>. Clear For Review frequently, then reconcile monthly against the statement.</li>
              <li><strong>One-sided policy</strong>: deposits match <em>invoices (A/R)</em>; withdrawals match <em>bills (A/P)</em>. Netting A/R and A/P is handled via a <em>clearing account</em> outside the feed.</li>
            </ul>
            </HelpPopover>
          </div>
        </div>
      </div>
      <ActiveFilterBar slug="list:transactions" />
      {/* One-sided policy tip (dismissible) */}
      {effectiveBankStatus === 'for_review' && (
        <OneSidedTip />
      )}
      {error ? (
        <div className="glass-card text-red-600">{error}</div>
      ) : loading ? (
        <div className="glass-card">Loading…</div>
      ) : (
        <div className="glass-card">
          {effectiveBankStatus === 'for_review' && Array.isArray(transactions) && transactions.length === 0 && (
            <div className="mb-3 rounded-lg border border-sky-200 bg-sky-50/60 p-3 text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm">You&#39;re all caught up here. When your statement is ready, continue with reconciliation.</div>
                <a href="/transactions/reconcile" className="btn-primary btn-xs" aria-label="Open Reconcile page">Go to Reconcile</a>
              </div>
            </div>
          )}
          {/* Inline filter and actions bar inside the table card header */}
          <div className="mb-3 glass-formbar px-3 py-2 flex items-end justify-between gap-2">
            <div className="flex flex-wrap items-end gap-2">
              <DateRangeSelect
                start={start}
                end={end}
                onChange={(v) => {
                  const qs = new URLSearchParams(sp.toString())
                  qs.set('page', '1')
                  if (v.start) qs.set('start', v.start); else qs.delete('start')
                  if (v.end) qs.set('end', v.end); else qs.delete('end')
                  router.replace(`${pathname}?${qs.toString()}` as any)
                }}
                showPresets={false}
              />
              <div className="flex flex-col">
                <label htmlFor="txn-type" className="text-xs text-slate-600">Type</label>
                <select
                  id="txn-type"
                  value={type}
                  onChange={(e) => {
                    const qs = new URLSearchParams(sp.toString())
                    qs.set('page', '1')
                    if (e.target.value) qs.set('type', e.target.value); else qs.delete('type')
                    router.replace(`${pathname}?${qs.toString()}` as any)
                  }}
                  className="w-[16ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm"
                >
                  <option value="">All</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>
              {flags.tags && (
                <div className="flex flex-col">
                  <label htmlFor="txn-tag" className="text-xs text-slate-600">Tag</label>
                  <TagSelectControl pathname={pathname} sp={sp} router={router} tag={tag} />
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 max-w-full sm:justify-end">
              {/** Reconcile button removed to rely on the dedicated Reconcile page in top navigation */}
              <button className="btn-secondary btn-xs" onClick={()=>setShowTransfer(true)} title="Record a transfer between bank accounts">New Transfer</button>
              <Suspense fallback={null}><ExportCsvButton exportPath="/api/transactions/export" /></Suspense>
              <Suspense fallback={null}><ExportCsvButton exportPath="/api/reports/bank-register/export" title="Export Register" /></Suspense>
              <PrintButton />
              {/* Removed Reduce hover toggle from UI; OS/user preference still respected internally */}
              {effectiveBankStatus === 'for_review' && (
                <label className={`btn-secondary btn-xs cursor-pointer ${uploadBusy ? 'opacity-60 pointer-events-none' : ''}`}>
                  <input
                    type="file"
                    accept=".csv,text/csv,.tsv,text/tab-separated-values,.ofx,application/ofx,application/x-ofx,.qif,application/qif,.xml,application/xml"
                    className="hidden"
                    onChange={async (e) => {
                      const inputEl = e.target as HTMLInputElement | null
                      const file = inputEl?.files?.[0]
                      if (!file) return
                      try {
                        setUploadBusy(true)
                        const form = new FormData()
                        form.append('file', file)
                        const resp = await fetch('/api/bank-feeds/upload', { method: 'POST', body: form })
                        let msg = ''
                        if (resp.ok) {
                          const d = await resp.json().catch(() => null)
                          if (d && typeof d === 'object') {
                            const added = Number(d.added || 0)
                            const dup = Number(d.duplicates || 0)
                            const skipped = Number(d.skipped || 0)
                            const total = Number(d.totalRows || added + dup + skipped)
                            msg = `Upload complete: added ${added}, duplicates ${dup}, skipped ${skipped} of ${total}`
                          } else {
                            msg = 'Upload complete'
                          }
                        } else if (resp.status === 403) {
                          msg = 'Upload failed: insufficient permissions'
                        } else if (resp.status === 413) {
                          msg = 'Upload failed: file too large'
                        } else {
                          msg = 'Upload failed'
                        }
                        await refetch()
                        await refreshCounts()
                        if (msg) {
                          const qs = new URLSearchParams(sp.toString())
                          qs.set('notice', msg)
                          router.replace(`${pathname}?${qs.toString()}` as any)
                        }
                      } catch {}
                      finally {
                        setUploadBusy(false)
                        // Reset input so the same file can be selected again in subsequent uploads
                        if (inputEl) inputEl.value = ''
                      }
                    }}
                    aria-label="Upload bank statement"
                  />
                  {uploadBusy ? 'Uploading…' : 'Upload statement'}
                </label>
              )}
              {effectiveBankStatus === 'for_review' && (
                <button
                  className="btn-secondary btn-xs"
                  onClick={async () => {
                    try {
                      if (!accountId) {
                        const ok = window.confirm('Apply rules to all bank accounts? This may update many transactions.')
                        if (!ok) return
                      }
                      const resp = await fetch(`/api/bank-feeds/apply-rules${accountId ? `?accountId=${encodeURIComponent(accountId)}` : ''}`, { method: 'POST' })
                      let msg = ''
                      if (resp.ok) {
                        const d = await resp.json().catch(()=>null)
                        const updated = Number(d?.updated || 0)
                        msg = updated > 0 ? `Rules applied: ${updated} updated` : 'Rules applied: no changes'
                      } else {
                        msg = 'Failed to apply rules'
                      }
                      await refetch()
                      await refreshCounts()
                      if (msg) {
                        const qs = new URLSearchParams(sp.toString())
                        qs.set('notice', msg)
                        router.replace(`${pathname}?${qs.toString()}` as any)
                      }
                    } catch {}
                  }}
                  title="Apply bank rules to imported/for_review transactions"
                >Apply rules</button>
              )}
              {/* Manual entry is handled via + New, not inside Bank Transactions; remove inline New Transaction */}
            </div>
          </div>
          {/* Bulk actions row – placed under the toolbar bar per request */}
          {effectiveBankStatus === 'for_review' && selected.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                className="btn-secondary btn-xs"
                onClick={() => setBulkOpen(true)}
                title="Categorize selected"
              >Categorize selected ({selected.length})</button>
              <button
                className="btn-secondary btn-xs"
                onClick={async () => {
                  if (!canWrite) return
                  const ok = window.confirm(`Exclude ${selected.length} selected transaction${selected.length>1?'s':''}? You can undo individually later.`)
                  if (!ok) return
                  try {
                    await Promise.all(
                      transactions.filter(t => selected.includes(t.id)).map(t => update({ ...t, bankStatus: 'excluded' } as any))
                    )
                    setSelected([])
                    await refetch()
                    await refreshCounts()
                  } catch {}
                }}
              >Exclude selected ({selected.length})</button>
            </div>
          )}
          <div className="mb-2 text-xs text-slate-500">Tip: Click Options to open actions under a transaction. Use Match to apply when a suggestion is found.</div>
          <DataTable<TxnWithMatch>
            keyField="id"
            fancyHover={!reducedHover}
            striped={false}
            selectableRows={effectiveBankStatus === 'for_review'}
            selectedKeys={selected}
            onToggleRow={(key, checked) => setSelected(prev => checked ? Array.from(new Set([...prev, key])) : prev.filter(k => k !== key))}
            onToggleAll={(checked, keys) => setSelected(checked ? keys : [])}
            expandedRowKey={expandedRow}
            onRowClick={(row, e)=>{
              // Guard: ignore clicks on controls/toggles within the row
              const t = (e?.target as HTMLElement | null)
              if (t && t.closest('button,a,input,select,textarea,label,[role="button"],[role="menuitem"],[role="switch"],[data-stop-row-click="true"],[data-no-row-toggle],.no-row-expand')) {
                return
              }
              const r = row as TxnWithMatch
              const next = expandedRow === r.id ? null : r.id
              setExpandedRow(next)
              setShowCatFor(null)
              setShowSplitFor(null)
              setShowManualFor(null)
              setMatchPanel(null)
            }}
            renderExpanded={(row) => (
              <TxnExpanded
                txn={row as TxnWithMatch}
                onOpenCategorize={() => { setShowManualFor(null); setShowSplitFor(null); setMatchPanel(null); setShowCatFor((row as any).id) }}
                onOpenSplit={() => { setShowManualFor(null); setShowCatFor(null); setMatchPanel(null); setShowSplitFor((row as any).id) }}
                onOpenManualMatch={() => { setShowCatFor(null); setShowSplitFor(null); setMatchPanel(null); setShowManualFor((row as any).id) }}
                onFetchSuggestions={async () => {
                  try {
                    // Opening suggestions should close other inline panels
                    setShowCatFor(null); setShowSplitFor(null); setShowManualFor(null)
                    const resp = await fetch(`/api/bank-feeds/match-suggestions?txnId=${encodeURIComponent((row as any).id)}`)
                    if (!resp.ok) throw new Error('No suggestions')
                    const j = await resp.json().catch(()=>null)
                    let items = Array.isArray(j?.result?.candidates) ? j.result.candidates : []
                    // Best-practice filter: deposits → invoices only, withdrawals → bills only, transfers → transfer only
                    const amt = Number((row as any).amount || 0)
                    const cat = String((row as any).category || '')
                    if (cat === 'Transfer') {
                      items = items.filter((it: any) => it?.kind === 'transfer')
                    } else {
                      items = items.filter((it: any) => amt >= 0 ? it?.kind === 'invoice' : it?.kind === 'bill')
                    }
                    setMatchPanel({ txnId: (row as any).id, items })
                    setSuggestionCounts(prev => ({ ...prev, [(row as any).id]: items.length }))
                  } catch {
                    setMatchPanel({ txnId: (row as any).id, items: [] })
                    setSuggestionCounts(prev => ({ ...prev, [(row as any).id]: 0 }))
                  }
                }}
                suggestionsPanel={matchPanel && matchPanel.txnId === (row as any).id ? (
                  <SuggestionsPanel
                    items={matchPanel.items}
                    onClose={()=>setMatchPanel(null)}
                    onApply={async (it) => {
                      try {
                        const resp = await fetch('/api/bank-feeds/apply-match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ txnId: (row as any).id, kind: it.kind, id: it.id }) })
                        if (!resp.ok) {
                          const msg = await resp.json().catch(()=>({error:'Failed'}))
                          const qs = new URLSearchParams(sp.toString()); qs.set('notice', msg?.error || 'Failed to apply match'); router.replace(`${pathname}?${qs.toString()}` as any)
                          return
                        }
                        setMatchPanel(null)
                        await refetch(); await refreshCounts()
                        const qs = new URLSearchParams(sp.toString()); qs.set('notice', 'Match applied'); router.replace(`${pathname}?${qs.toString()}` as any)
                      } catch {
                        const qs = new URLSearchParams(sp.toString()); qs.set('notice', 'Failed to apply match'); router.replace(`${pathname}?${qs.toString()}` as any)
                      }
                    }}
                  />
                ) : null}
                categorizePanel={showCatFor === (row as any).id ? (
                  <CategorizePanel
                    txn={row as any}
                    onUpdate={update}
                    onClose={()=>setShowCatFor(null)}
                    onSaved={async()=>{ setShowCatFor(null); await refetch(); await refreshCounts() }}
                  />
                ) : null}
                splitPanel={showSplitFor === (row as any).id ? (
                  <SplitPanel
                    txn={row as any}
                    onUpdate={update}
                    onClose={()=>setShowSplitFor(null)}
                    onSaved={async()=>{ setShowSplitFor(null); await refetch(); await refreshCounts() }}
                  />
                ) : null}
                manualPanel={showManualFor === (row as any).id ? (
                  <ManualMatchPanel
                    txn={row as any}
                    onApply={async (kind, id) => {
                      try {
                        const resp = await fetch('/api/bank-feeds/apply-match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ txnId: (row as any).id, kind, id }) })
                        if (!resp.ok) throw new Error('Failed')
                        setShowManualFor(null)
                        await refetch(); await refreshCounts()
                        const qs = new URLSearchParams(sp.toString()); qs.set('notice', 'Match applied'); router.replace(`${pathname}?${qs.toString()}` as any)
                      } catch (e:any) {
                        const qs = new URLSearchParams(sp.toString()); qs.set('notice', 'Failed to apply match'); router.replace(`${pathname}?${qs.toString()}` as any)
                      }
                    }}
                    onClose={()=>setShowManualFor(null)}
                  />
                ) : null}
                
              />
            )}
            columns={[
              { key: 'date', header: 'Date', hideBelow: 'md', headerClassName: 'col-date', cellClassName: 'col-date transition-colors' },
              { key: 'description', header: 'Description', headerClassName: 'col-description', cellClassName: 'col-description transition-colors', render: (_v, r) => (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-block truncate max-w-[18ch] align-top">{r.description}</span>
                  {(r as any).matchedKind && (
                    <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2 py-[1px] text-[10px] whitespace-nowrap" title={`Matched to ${(r as any).matchedKind}: ${(r as any).matchedRef || (r as any).matchedId}`}>
                      Matched{(r as any).matchedCount && (r as any).matchedCount>1 ? ` ×${(r as any).matchedCount}` : ''}: {(r as any).matchedRef || (r as any).matchedKind}
                    </span>
                  )}
                  {typeof suggestionCounts[r.id] === 'number' && (
                    <span
                      className="rounded-full bg-sky-50 text-sky-800 border border-sky-200 px-2 py-[1px] text-[10px] whitespace-nowrap"
                      title={
                        suggestionCounts[r.id] === 0
                          ? 'No suggestions yet. Open Options › Match suggestions to try again.'
                          : suggestionCounts[r.id] === 1
                            ? '1 suggestion found. A Match button will apply it directly.'
                            : `${suggestionCounts[r.id]} suggestions found. Use Suggested match to choose.`
                      }
                      aria-label={`Matches badge for ${r.description}`}
                    >
                      Matches ×{suggestionCounts[r.id]}
                    </span>
                  )}
                </div>
              ) },
              { key: 'category', header: 'Category', hideBelow: 'sm', headerClassName: 'col-category', cellClassName: 'col-category inline-block max-w-[12ch] truncate align-top transition-colors' },
              { key: 'bankStatus', header: 'Status', hideBelow: 'sm', headerClassName: 'col-status', cellClassName: 'col-status transition-colors', render: (v) => (v || 'for_review') },
              { key: 'deposit' as unknown as keyof TxnWithMatch, header: 'Deposit', align: 'center', headerClassName: 'col-deposit border-l border-r border-slate-200 min-w-[12ch]', cellClassName: 'col-deposit border-l border-r border-slate-200 pl-2 pr-2 min-w-[12ch] transition-colors', render: (_v, r) => {
                const val = Number((r as any).amount || 0)
                return val > 0 ? (<span className="tabular-nums"><Amount value={val} /></span>) : null
              } },
              { key: 'withdrawal' as unknown as keyof TxnWithMatch, header: 'Withdrawal', align: 'center', headerClassName: 'col-withdrawal border-l border-r border-slate-200 min-w-[12ch]', cellClassName: 'col-withdrawal border-l border-r border-slate-200 pl-2 pr-2 min-w-[12ch] transition-colors', render: (_v, r) => {
                const val = Number((r as any).amount || 0)
                return val < 0 ? (<span className="tabular-nums"><Amount value={Math.abs(val)} /></span>) : null
              } },
              { key: 'id', header: '', align: 'right', headerClassName: 'col-actions', cellClassName: 'col-actions transition-colors', render: (_v, r) => (
                <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                  {canWrite && (() => {
                    const count = suggestionCounts[r.id]
                    if (typeof count === 'number' && count === 1) {
                      return (
                        <button
                          className="btn-secondary py-1 px-2 text-[11px] sm:text-xs"
                          onClick={async () => {
                            try {
                              // Fetch to confirm and get target
                              const resp = await fetch(`/api/bank-feeds/match-suggestions?txnId=${encodeURIComponent(r.id)}`)
                              const j = resp.ok ? await resp.json().catch(()=>null) : null
                              let items = Array.isArray(j?.result?.candidates) ? j.result.candidates : []
                              const amt = Number((r as any).amount || 0)
                              const cat = String((r as any).category || '')
                              if (cat === 'Transfer') items = items.filter((it: any) => it?.kind === 'transfer')
                              else items = items.filter((it: any) => amt >= 0 ? it?.kind === 'invoice' : it?.kind === 'bill')
                              setSuggestionCounts(prev => ({ ...prev, [r.id]: items.length }))
                              if (items.length !== 1) {
                                // Fallbacks: if now zero or many, route to suggestions inline
                                setExpandedRow(r.id)
                                setMatchPanel({ txnId: r.id, items })
                                setShowCatFor(null); setShowSplitFor(null); setShowManualFor(null)
                                return
                              }
                              const one = items[0]
                              const apply = await fetch('/api/bank-feeds/apply-match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ txnId: r.id, kind: one.kind, id: one.id }) })
                              if (!apply.ok) throw new Error('Failed')
                              await refetch(); await refreshCounts()
                              const qs = new URLSearchParams(sp.toString()); qs.set('bankStatus', 'categorized'); qs.set('notice', 'Match applied'); router.replace(`${pathname}?${qs.toString()}` as any)
                            } catch {
                              const qs = new URLSearchParams(sp.toString()); qs.set('notice', 'Failed to apply match'); router.replace(`${pathname}?${qs.toString()}` as any)
                            }
                          }}
                          aria-label={`Apply match for ${r.description}`}
                        >Match</button>
                      )
                    }
                    if (typeof count === 'number' && count > 1) {
                      return (
                        <button
                          className="btn-secondary py-1 px-2 text-[11px] sm:text-xs"
                          onClick={async () => {
                            try {
                              const resp = await fetch(`/api/bank-feeds/match-suggestions?txnId=${encodeURIComponent(r.id)}`)
                              const j = resp.ok ? await resp.json().catch(()=>null) : null
                              let items = Array.isArray(j?.result?.candidates) ? j.result.candidates : []
                              const amt = Number((r as any).amount || 0)
                              const cat = String((r as any).category || '')
                              if (cat === 'Transfer') items = items.filter((it: any) => it?.kind === 'transfer')
                              else items = items.filter((it: any) => amt >= 0 ? it?.kind === 'invoice' : it?.kind === 'bill')
                              setSuggestionCounts(prev => ({ ...prev, [r.id]: items.length }))
                              // Open inline suggestions panel (expanded form) for selection
                              setExpandedRow(r.id)
                              setShowCatFor(null); setShowSplitFor(null); setShowManualFor(null)
                              setMatchPanel({ txnId: r.id, items })
                            } catch {
                              const qs = new URLSearchParams(sp.toString()); qs.set('notice', 'Failed to load matches'); router.replace(`${pathname}?${qs.toString()}` as any)
                            }
                          }}
                          aria-label={`Open match suggestions for ${r.description}`}
                        >Suggested match</button>
                      )
                    }
                    return null
                  })()}
                  {canWrite && r.bankStatus !== 'excluded' && (
                    <button
                      className="btn-secondary py-1 px-2 text-[11px] sm:text-xs"
                      onClick={async () => { try { await update({ ...r, bankStatus: 'excluded' } as any); await refetch(); await refreshCounts() } catch {} }}
                      aria-label={`Exclude ${r.description}`}
                    >Exclude</button>
                  )}
                  {canWrite && (r.bankStatus === 'categorized' || r.bankStatus === 'excluded') && (
                    <button
                      className="btn-secondary py-1 px-2 text-[11px] sm:text-xs"
                      onClick={async () => { try { await update({ ...r, bankStatus: 'for_review' } as any); await refetch(); await refreshCounts() } catch {} }}
                      aria-label={`Undo ${r.description}`}
                    >Undo</button>
                  )}
                  {canWrite && r.bankStatus === 'categorized' && (r as any).matchedKind && (
                    <button
                      className="btn-secondary py-1 px-2 text-[11px] sm:text-xs"
                      onClick={async () => {
                        try {
                          const resp = await fetch('/api/bank-feeds/unmatch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ txnId: r.id }) })
                          if (!resp.ok) {
                            const msg = await resp.json().catch(()=>({error:'Failed'}))
                            const reason = String(msg?.error || 'Failed to unmatch')
                            // Show in notice; also set title to help explain on hover
                            const qs = new URLSearchParams(sp.toString()); qs.set('notice', reason); router.replace(`${pathname}?${qs.toString()}` as any)
                            return
                          }
                          await refetch(); await refreshCounts()
                          const qs = new URLSearchParams(sp.toString()); qs.set('notice', 'Unmatched'); router.replace(`${pathname}?${qs.toString()}` as any)
                        } catch {
                          const qs = new URLSearchParams(sp.toString()); qs.set('notice', 'Failed to unmatch'); router.replace(`${pathname}?${qs.toString()}` as any)
                        }
                      }}
                      aria-label={`Unmatch ${r.description}`}
                      title={(r as any).matchedKind === 'invoice' ? 'Blocked if payment has already been included in a deposit' : 'Remove the match and return to For Review'}
                    >Unmatch</button>
                  )}
                  {/* Row click now opens Options; button removed per request */}
                </div>
              )},
            ]}
            rows={transactions}
          />
          {/* Suggestions and Categorize are now shown inside each expanded row */}
          <MatchChooserDrawer
            open={matchChooser.open}
            items={matchChooser.items || []}
            onClose={() => setMatchChooser({ open: false })}
            onApply={async (it) => {
              if (!matchChooser.txnId) return
              try {
                const resp = await fetch('/api/bank-feeds/apply-match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ txnId: matchChooser.txnId, kind: it.kind, id: it.id }) })
                if (!resp.ok) throw new Error('Failed to apply match')
                setMatchChooser({ open: false })
                await refetch(); await refreshCounts()
                const qs = new URLSearchParams(sp.toString()); qs.set('notice', 'Match applied'); router.replace(`${pathname}?${qs.toString()}` as any)
              } catch {
                const qs = new URLSearchParams(sp.toString()); qs.set('notice', 'Failed to apply match'); router.replace(`${pathname}?${qs.toString()}` as any)
              }
            }}
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-slate-600">Page {page}</div>
            <div className="flex items-center gap-1.5">
              <button
                className="btn-secondary btn-xs"
                onClick={() => {
                  if (page <= 1) return
                  const qs = new URLSearchParams(sp.toString())
                  const next = Math.max(1, page - 1)
                  qs.set('page', String(next))
                  qs.set('limit', String(limit))
                  router.replace(`${pathname}?${qs.toString()}` as any)
                }}
                disabled={page <= 1}
                aria-label="Previous page"
              >Prev</button>
              <button
                className="btn-secondary btn-xs"
                onClick={() => {
                  const qs = new URLSearchParams(sp.toString())
                  const next = page + 1
                  qs.set('page', String(next))
                  qs.set('limit', String(limit))
                  router.replace(`${pathname}?${qs.toString()}` as any)
                }}
                aria-label="Next page"
              >Next</button>
              <select
                aria-label="Rows per page"
                className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs"
                value={String(limit)}
                onChange={(e) => {
                  const qs = new URLSearchParams(sp.toString())
                  qs.set('limit', e.target.value)
                  qs.set('page', '1')
                  router.replace(`${pathname}?${qs.toString()}` as any)
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>
      )}
      {showTransfer && (
        <NewTransferModal onClose={()=>setShowTransfer(false)} onCreated={async()=>{ setShowTransfer(false); await refetch(); await refreshCounts() }} />
      )}
      {showLinkBank && (
        <LinkBankDialog
          onClose={()=>setShowLinkBank(false)}
          onSimulateLink={()=>{
            // Toggle demo accounts via URL param used by AccountListSidebar
            const qs = new URLSearchParams(sp.toString())
            qs.set('demoAccounts','1')
            router.replace(`${pathname}?${qs.toString()}` as any)
            setShowLinkBank(false)
          }}
        />
      )}
      {/* Bulk categorize drawer opens on top button click instead of auto */}
      {effectiveBankStatus === 'for_review' && (
        <BulkCategorizeDrawer
          count={selected.length}
          total={selectedTotal}
          onClose={()=>setBulkOpen(false)}
          open={bulkOpen}
          onApply={async (payload) => {
            try {
              await Promise.all(transactions.filter(t => selected.includes(t.id)).map(t => update({ ...t, ...payload, bankStatus: 'categorized' } as any)))
              setSelected([])
              setBulkOpen(false)
              await refetch(); await refreshCounts()
            } catch {}
          }}
        />
      )}
    </div>
  )
}

export default function BankTransactionsPage() {
  return (
    <Suspense fallback={null}>
      <BankTransactionsContent />
    </Suspense>
  )
}

// Dismissible tip about one-sided matching policy
function OneSidedTip() {
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
    try {
      const seen = typeof window !== 'undefined' ? window.localStorage.getItem('bank:tip:one-sided') : '1'
      setVisible(seen !== '1')
    } catch { setVisible(true) }
  }, [])
  if (!visible) return null
  return (
    <div className="glass-card border border-amber-200 bg-amber-50/70 text-slate-800 text-sm px-3 py-2 flex flex-wrap items-center justify-between gap-2">
      <div>
        <strong>One-sided matching:</strong> Deposits match invoices (A/R). Withdrawals match bills (A/P). To offset A/R and A/P, use a clearing-account workflow outside the bank feed.
      </div>
      <button
        className="btn-tertiary btn-xs"
        onClick={() => { try { window.localStorage.setItem('bank:tip:one-sided', '1') } catch {}; setVisible(false) }}
        aria-label="Dismiss one-sided policy tip"
      >Dismiss</button>
    </div>
  )
}

// (Account details dialog removed per request)

// Non-blocking connection health banner based on query param (mock)
function ConnectionHealthBanner({ searchParams, onLinkBank }: { searchParams: URLSearchParams; onLinkBank: ()=>void }) {
  const [visible, setVisible] = React.useState(false)
  const [kind, setKind] = React.useState<'reauth'|'mfa'|'daterange'|null>(null)
  React.useEffect(() => {
    try {
      const v = searchParams.get('bankConn')
      if (v === 'reauth' || v === 'mfa' || v === 'daterange') {
        const key = `bank:conn:${v}:dismissed`
        const dismissed = typeof window !== 'undefined' ? window.localStorage.getItem(key) === '1' : false
        setKind(v)
        setVisible(!dismissed)
      } else {
        setVisible(false)
        setKind(null)
      }
    } catch { setVisible(false); setKind(null) }
  }, [searchParams])
  if (!visible || !kind) return null
  const content = {
    reauth: {
      title: 'Re-authentication required',
      body: 'Your bank connection needs to be re-authorized. This is common when access tokens expire.',
      cta: 'Re-authenticate',
    },
    mfa: {
      title: 'MFA challenge may be required',
      body: 'Your bank may ask for a code or approval during sync. Complete MFA when prompted after linking.',
      cta: 'Open Link bank',
    },
    daterange: {
      title: 'Date range limits from bank',
  body: 'Some institutions only provide ~90 days of history per sync. Use CSV uploads to backfill older data.',
      cta: 'Learn how to import',
    }
  }[kind]
  const onDismiss = () => {
    try { if (kind) window.localStorage.setItem(`bank:conn:${kind}:dismissed`, '1') } catch {}
    setVisible(false)
  }
  return (
    <div
      role="region"
      aria-label="Bank connection health"
      className="glass-card border border-sky-200 bg-sky-50/70 text-slate-800 px-3 py-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium">{content.title}</div>
          <div className="text-sm text-slate-700">{content.body}</div>
        </div>
        <div className="flex items-center gap-2">
          {kind === 'daterange' ? (
            <a href="/help/bank-imports" className="btn-secondary btn-xs" aria-label="Open bank import help">{content.cta}</a>
          ) : (
            <button className="btn-secondary btn-xs" onClick={onLinkBank} aria-label="Open Link bank dialog">{content.cta}</button>
          )}
          <button className="btn-tertiary btn-xs" onClick={onDismiss} aria-label="Dismiss bank connection banner">Dismiss</button>
        </div>
      </div>
    </div>
  )
}

// Simple Link bank dialog (mock guidance)
function LinkBankDialog({ onClose, onSimulateLink }: { onClose: ()=>void; onSimulateLink: ()=>void }) {
  const containerRef = React.useRef<HTMLDivElement|null>(null)
  React.useEffect(()=>{ containerRef.current?.focus() }, [])
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-label="Link bank account" tabIndex={-1} ref={containerRef} onKeyDown={(e)=>{ if (e.key==='Escape'){ e.preventDefault(); onClose() } }}>
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Link bank account</h2>
          <button className="btn-secondary btn-xs" onClick={onClose} aria-label="Close link bank dialog">Close</button>
        </div>
        <div className="mt-2 text-sm text-slate-700 space-y-2">
          <p>Linking a bank uses a secure connection (OAuth/MFA) and imports transactions automatically. You review items in For Review, then Match/Add/Transfer/Exclude.</p>
          <p>This mock environment doesn’t connect to real banks. You can:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Upload statements via <em>Upload statement</em> to intake CSV/OFX/QIF.</li>
            <li>Apply bank rules to categorize predictable activity.</li>
            <li><button className="btn-tertiary btn-2xs no-row-expand" onClick={onSimulateLink} aria-label="Enable demo accounts">Enable demo accounts</button> to preview multiple accounts and balances.</li>
          </ul>
          <p className="text-slate-600">Tip: Reconciliation happens in the Reconcile page; bank-feed actions must tie out to each line’s amount (including any permitted adjustment).</p>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={onSimulateLink}>Simulate link (demo)</button>
        </div>
      </div>
    </div>
  )
}

// Vertical account list showing quick snapshots (name, bank, haypbooks, diff)
function AccountListSidebar({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string)=>void }) {
  const sp2 = useSearchParams()
  const demoParam = React.useMemo(() => (sp2.get('demoAccounts') === '1'), [sp2])
  const [accounts, setAccounts] = React.useState<Array<{ id: string; number: string; name?: string; balance?: number }>>([])
  const [summaries, setSummaries] = React.useState<Record<string, { bankBalance?: number|null; booksBalance?: number|null }>>({})
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement|null>(null)
  // Input device & motion preferences for subtle 3D hover
  const reduceMotion = React.useRef<boolean>(false)
  const finePointer = React.useRef<boolean>(true)
  React.useEffect(() => {
    try {
      const prefers = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let userPref = false
      try { userPref = typeof window !== 'undefined' && window.localStorage.getItem('ui:reducedHover') === '1' } catch {}
      reduceMotion.current = !!(prefers || userPref)
      finePointer.current = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: fine)').matches
    } catch {}
  }, [])
  // Collapse chooser when clicking outside of the account list UI
  React.useEffect(() => {
    const onDocDown = (e: MouseEvent | TouchEvent) => {
      if (!open) return
      const el = containerRef.current
      const t = e.target as Node | null
      if (el && t && !el.contains(t)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('touchstart', onDocDown)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('touchstart', onDocDown)
    }
  }, [open])
  React.useEffect(() => {
    let alive = true
    fetch('/api/accounts?reconcilable=1&includeBalances=1', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(async d => {
        if (!alive) return
        const list = Array.isArray(d?.accounts)?d.accounts:[]
  const demo = demoParam
  const demoList = demo ? [
          { id: 'demo-1001', number: '1001', name: 'Operating — Demo', balance: 7035.00 },
          { id: 'demo-1002', number: '1002', name: 'Payroll — Demo', balance: 2500.00 },
          { id: 'demo-1003', number: '1003', name: 'Savings — Demo', balance: 11850.00 },
        ] : []
        const merged = [...list, ...demoList]
        setAccounts(merged)
        const ids = merged.map((a:any)=>a.id).filter((id:string)=>!id.startsWith('demo-'))
        const limit = 4
        let cursor = 0
        const local: Record<string, { bankBalance?: number|null; booksBalance?: number|null }> = {}
        async function worker() {
          while (alive && cursor < ids.length) {
            const i = cursor++
            const id = ids[i]
            try {
              const r = await fetch(`/api/accounts/balance-summary?accountId=${encodeURIComponent(id)}`, { cache: 'no-store' })
              if (!r.ok) throw new Error('fail')
              const j = await r.json().catch(()=>null)
              if (!alive) return
              local[id] = { bankBalance: j?.bankBalance ?? null, booksBalance: j?.booksBalance ?? null }
            } catch {
              if (!alive) return
              local[id] = { bankBalance: null, booksBalance: null }
            }
          }
        }
        await Promise.all(Array.from({ length: Math.min(limit, ids.length) }, () => worker()))
        if (demo) {
          local['demo-1001'] = { bankBalance: 845.00, booksBalance: 7035.00 }
          local['demo-1002'] = { bankBalance: 2500.00, booksBalance: 2500.00 }
          local['demo-1003'] = { bankBalance: 12000.00, booksBalance: 11850.00 }
        }
        if (alive) setSummaries(local)
      })
      .catch(() => { if (alive) setAccounts([]) })
    return () => { alive = false }
  }, [demoParam])

  // On first load without a selectedId, prefer remembered account; otherwise select the first account
  const attemptedDefaultRef = React.useRef(false)
  React.useEffect(() => {
    if (attemptedDefaultRef.current) return
    if (selectedId) return
    if (accounts.length === 0) return
    attemptedDefaultRef.current = true
    try {
      const last = typeof window !== 'undefined' ? window.localStorage.getItem('bank:lastAccountId') : ''
      const valid = accounts.find(a => a.id === last)?.id
      const pick = valid || accounts[0]?.id || ''
      if (pick) {
        // Persist selection and notify parent to set URL param
        try { window.localStorage.setItem('bank:lastAccountId', pick) } catch {}
        onSelect(pick)
      }
    } catch {}
  }, [selectedId, accounts, onSelect])

  // helper to render a single account row (card-like with chip cluster on the right)
  const renderRow = (a: { id: string; number: string; name?: string; balance?: number }, opts?: { asButton?: boolean; active?: boolean; onClick?: ()=>void; variant?: 'toggle'|'item'|'all'; hideAllLabel?: boolean; ariaLabelOverride?: string }) => {
    const allLoaded = accounts.length > 0 && accounts.every(acc => typeof summaries[acc.id]?.bankBalance === 'number' && typeof summaries[acc.id]?.booksBalance === 'number')
    const isAll = a.id === '' || a.id === 'none'
    const bank = isAll
      ? (allLoaded ? Number(accounts.reduce((s, acc) => s + Number(summaries[acc.id]!.bankBalance || 0), 0).toFixed(2)) : NaN)
      : (typeof summaries[a.id]?.bankBalance === 'number' ? Number(summaries[a.id]?.bankBalance || 0) : NaN)
    const books = isAll
      ? (allLoaded ? Number(accounts.reduce((s, acc) => s + Number((typeof summaries[acc.id]?.booksBalance === 'number' ? summaries[acc.id]!.booksBalance : (typeof acc.balance === 'number' ? acc.balance : 0)) || 0), 0).toFixed(2)) : NaN)
      : (typeof summaries[a.id]?.booksBalance === 'number' ? Number(summaries[a.id]?.booksBalance || 0) : (typeof a.balance === 'number' ? Number(a.balance || 0) : NaN))
    const diff = (isFinite(bank) && isFinite(books)) ? Number((bank - books).toFixed(2)) : NaN
    const nearZero = isFinite(diff) && Math.abs(diff) <= 0.004
    const base = Math.max(...[bank, books, Math.abs(diff)].filter(v => isFinite(v)).map(v => Math.abs(v)), 1)
    const smallBand = Math.max(0.01 * base, 5)
    const smallish = !nearZero && isFinite(diff) && Math.abs(diff) <= smallBand
    // Stronger red variant for better legibility on small badges
    const diffBadge = nearZero ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : smallish ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-100 text-red-800 border-red-200'
    const classBase = `w-full flex items-center justify-between gap-3 px-3 py-2 text-sm`
    const onRowMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (opts?.variant === 'all') return // no hover effect for All accounts row
      if (reduceMotion.current || !finePointer.current) return
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const px = (cx / rect.width) - 0.5
      const py = (cy / rect.height) - 0.5
      const max = 2.2 // light degrees
      const rx = (-py) * max
      const ry = (px) * max
      el.style.transform = `translateY(-1px) scale(1.005) rotateX(${rx}deg) rotateY(${ry}deg)`
    }
    const onRowLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget
      el.style.transform = ''
    }
    const content = (
      <>
        <div className="min-w-0 flex items-center gap-2">
          {isAll && opts?.hideAllLabel ? (
            <span className="sr-only">All accounts totals</span>
          ) : (
            <span className="font-mono truncate text-slate-800 font-semibold">{a.number}{a.name ? ` · ${a.name}` : ''}</span>
          )}
          <span className="inline-grid place-items-center w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px]" title="Account info" aria-hidden="true">i</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          <span aria-hidden="true" className="h-6 w-px bg-slate-200/70"></span>
          <span className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-[1px] text-[11px] border bg-slate-50 text-slate-700 border-slate-200 w-[20ch]" title="Bank balance">
            <span className="sr-only">Bank Balance</span>
            <span className="font-mono tabular-nums">{isFinite(bank) ? (<Amount value={bank} />) : '—'}</span>
          </span>
          <span aria-hidden="true" className="h-6 w-px bg-slate-200/70"></span>
          <span className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-[1px] text-[11px] border bg-slate-50 text-slate-700 border-slate-200 w-[20ch]" title="HaypBooks balance">
            <span className="sr-only">HaypBooks Balance</span>
            <span className="font-mono tabular-nums">{isFinite(books) ? (<Amount value={books} />) : '—'}</span>
          </span>
          <span aria-hidden="true" className="h-6 w-px bg-slate-200/70"></span>
          <span className={`inline-flex items-center justify-center gap-1 rounded-full px-2 py-[1px] text-[11px] border w-[20ch] ${isFinite(diff) ? diffBadge : 'bg-slate-50 text-slate-700 border-slate-200'}`} title="Bank − HaypBooks">
            <span className="text-[10px] uppercase tracking-wide">Δ</span>
            {isFinite(diff) ? (
              nearZero ? (<><span className="translate-y-[0.5px]">✓</span><span className="font-mono tabular-nums">0.00</span></>) : (<span className="font-mono tabular-nums"><Amount value={diff} /></span>)
            ) : '—'}
          </span>
          <span aria-hidden="true" className="h-6 w-px bg-slate-200/70"></span>
        </div>
      </>
    )
    if (opts?.asButton) {
      return (
        <button
          key={a.id}
          onClick={opts.onClick}
          onMouseMove={onRowMove}
          onMouseLeave={onRowLeave}
          className={`${classBase} group relative ${opts?.variant==='all' ? '' : 'transform-gpu transition-transform duration-200'} shadow-sm ${opts?.variant==='all' ? '' : 'hover:shadow-md'} focus-visible:outline-none focus-visible:ring-0 ${opts.variant==='toggle' ? 'bg-emerald-50/70 ' + (opts?.variant==='toggle' ? 'hover:bg-emerald-100/70' : '') : (opts?.variant==='all' ? 'bg-white' : (opts.active ? 'bg-white' : 'hover:bg-emerald-50/70 bg-white/90'))}`}
          aria-label={opts?.ariaLabelOverride || `Select account ${a.number}${a.name ? ` · ${a.name}` : ''}`}
        >
          {content}
        </button>
      )
    }
    return (
      <div key={a.id} className={classBase}>{content}</div>
    )
  }

  const selected = selectedId ? accounts.find(a=>a.id===selectedId) : undefined
  // totals across all known accounts (using summaries where present, else fallback to account.balance)
  const totals = React.useMemo(() => {
    const bank = Number(accounts.reduce((s, acc) => s + (typeof summaries[acc.id]?.bankBalance === 'number' ? Number(summaries[acc.id]!.bankBalance) : 0), 0).toFixed(2))
    const books = Number(accounts.reduce((s, acc) => s + (typeof summaries[acc.id]?.booksBalance === 'number' ? Number(summaries[acc.id]!.booksBalance) : (typeof acc.balance === 'number' ? Number(acc.balance) : 0)), 0).toFixed(2))
    const diff = Number((bank - books).toFixed(2))
    return { bank, books, diff }
  }, [accounts, summaries])
  return (
    <div ref={containerRef} className="account-list overflow-x-hidden">
      {/* Title row with subtle caption to clarify chip meanings */}
  <div className="flex items-center justify-between px-3 py-1 text-xs bg-gradient-to-r from-hb-primary to-hb-primary-600 text-white shadow">
        <div className="font-semibold text-white">Account</div>
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2" aria-hidden="true">
          <span aria-hidden="true" className="h-6 w-px bg-white/40"></span>
          <span className="inline-flex items-center justify-center rounded-full px-2 py-[1px] text-[11px] bg-white/10 text-white w-[20ch]">
            <span className="uppercase tracking-wide text-[10px] leading-none text-center whitespace-nowrap">Bank Balance</span>
          </span>
          <span aria-hidden="true" className="h-6 w-px bg-white/40"></span>
          <span className="inline-flex items-center justify-center rounded-full px-2 py-[1px] text-[11px] bg-white/10 text-white w-[20ch]">
            <span className="uppercase tracking-wide text-[10px] leading-none text-center whitespace-nowrap">HaypBooks Balance</span>
          </span>
          <span aria-hidden="true" className="h-6 w-px bg-white/40"></span>
          <span className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-[1px] text-[11px] bg-white/10 text-white w-[20ch]">
            <span className="uppercase tracking-wide text-[10px] leading-tight text-center">
              <span className="block">Difference</span>
            </span>
          </span>
          <span aria-hidden="true" className="h-6 w-px bg-white/40"></span>
        </div>
      </div>
      {/* Toggle row showing the current selection (or All accounts totals when none) */}
      <div className="">
        {renderRow(selected || { id: '', number: 'All accounts' } as any, {
          asButton: true,
          active: !!selected,
          onClick: () => setOpen(o => !o),
          variant: 'toggle',
          hideAllLabel: !selected,
          ariaLabelOverride: !selected ? 'Select account All accounts' : undefined
        })}
      </div>
      {/* Expandable chooser under the row */}
      {open && (
        <div id="account-chooser" role="region" aria-label="Choose account" className="overflow-x-hidden">
          <ul className={`${accounts.length>3 ? 'max-h-64 overflow-y-auto pr-1' : ''}`} aria-label="Accounts list">
            {/* Accounts list excluding currently selected */}
            {accounts.filter(a => a.id !== selectedId).map(a => (
              <li key={a.id}>
                {renderRow(a, { asButton: true, active: false, onClick: () => { try { window.localStorage.setItem('bank:lastAccountId', a.id) } catch {}; onSelect(a.id); setOpen(false) }, variant: 'item' })}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Bottom bar: when expanded, show totals; when collapsed, show minimal bar without labels */}
      {open ? (
  <div className="mt-2 flex items-center justify-between px-3 py-1 text-xs bg-gradient-to-r from-hb-primary-700 via-hb-primary to-hb-primary-600 text-white shadow gradient-contrast">
          <div className="font-semibold text-white contrast-gradient-text">Total</div>
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            <span aria-hidden="true" className="h-6 w-px bg-white/40"></span>
            <span className="inline-flex items-center justify-center rounded-full px-2 py-[1px] text-[11px] bg-white-20 text-white w-[20ch]" title="Total bank balance">
              <span className="font-mono tabular-nums"><Amount value={totals.bank} /></span>
            </span>
            <span aria-hidden="true" className="h-6 w-px bg-white/40"></span>
            <span className="inline-flex items-center justify-center rounded-full px-2 py-[1px] text-[11px] bg-white-20 text-white w-[20ch]" title="Total HaypBooks balance">
              <span className="font-mono tabular-nums"><Amount value={totals.books} /></span>
            </span>
            <span aria-hidden="true" className="h-6 w-px bg-white/40"></span>
            <span className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-[1px] text-[11px] bg-white-20 text-white w-[20ch]" title="Total difference (Bank − HaypBooks)">
              <span className="font-mono tabular-nums"><Amount value={totals.diff} /></span>
            </span>
            <span aria-hidden="true" className="h-6 w-px bg-white/40"></span>
          </div>
        </div>
      ) : (
  <div className="mt-2 px-3 py-1 text-xs bg-gradient-to-r from-hb-primary to-hb-primary-600 text-white shadow" aria-hidden="true"></div>
      )}
    </div>
  )
}

// Compact account tiles component showing reconcilable asset accounts
function AccountTiles({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string)=>void }) {
  const [accounts, setAccounts] = React.useState<Array<{ id: string; number: string; name?: string; balance?: number }>>([])
  const [summaries, setSummaries] = React.useState<Record<string, { bankBalance?: number|null; booksBalance?: number|null }>>({})
  const reduceMotion = React.useRef<boolean>(false)
  const finePointer = React.useRef<boolean>(true)
  React.useEffect(() => {
    try {
      const prefers = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let userPref = false
      try { userPref = typeof window !== 'undefined' && window.localStorage.getItem('ui:reducedHover') === '1' } catch {}
      reduceMotion.current = !!(prefers || userPref)
      finePointer.current = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: fine)').matches
    } catch {}
  }, [])
  React.useEffect(() => {
    let alive = true
    fetch('/api/accounts?reconcilable=1&includeBalances=1', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(async d => {
        if (!alive) return
        const list = Array.isArray(d?.accounts)?d.accounts:[]
        setAccounts(list)
        // Fetch per-account balance summary for bank balance; throttle by small concurrency if many
        const ids = list.map((a:any)=>a.id)
        const limit = 4
        let cursor = 0
        const local: Record<string, { bankBalance?: number|null; booksBalance?: number|null }> = {}
        async function worker() {
          while (alive && cursor < ids.length) {
            const i = cursor++
            const id = ids[i]
            try {
              const r = await fetch(`/api/accounts/balance-summary?accountId=${encodeURIComponent(id)}`, { cache: 'no-store' })
              if (!r.ok) throw new Error('fail')
              const j = await r.json().catch(()=>null)
              if (!alive) return
              local[id] = { bankBalance: j?.bankBalance ?? null, booksBalance: j?.booksBalance ?? null }
            } catch {
              if (!alive) return
              local[id] = { bankBalance: null, booksBalance: null }
            }
          }
        }
        await Promise.all(Array.from({ length: Math.min(limit, ids.length) }, () => worker()))
        if (alive) setSummaries(local)
      })
      .catch(() => { if (alive) setAccounts([]) })
    return () => { alive = false }
  }, [])
  if (accounts.length === 0) return null
  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {accounts.map(a => {
        const active = selectedId ? selectedId === a.id : false
        const onTileMove = (e: React.MouseEvent<HTMLButtonElement>) => {
          if (reduceMotion.current || !finePointer.current) return
          const el = e.currentTarget
          const rect = el.getBoundingClientRect()
          const cx = e.clientX - rect.left
          const cy = e.clientY - rect.top
          const px = (cx / rect.width) - 0.5
          const py = (cy / rect.height) - 0.5
          const max = 2.5 // degrees; very light
          const rx = (-py) * max
          const ry = (px) * max
          el.style.transform = `translateY(-1px) scale(1.005) rotateX(${rx}deg) rotateY(${ry}deg)`
        }
        const onTileLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
          const el = e.currentTarget
          el.style.transform = ''
        }
        return (
          <div key={a.id} className={`relative group ${active ? 'is-active' : ''}`}>
            <button
              onClick={() => onSelect(active ? '' : a.id)}
              className={`bank-card ${active ? 'is-active' : ''} relative w-full text-sm rounded-xl px-3 py-2 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hb-primary-300`}
              onMouseMove={onTileMove}
              onMouseLeave={onTileLeave}
              aria-label={`Select account ${a.number}${a.name?` · ${a.name}`:''}`}
            >
              <div className="min-w-0 w-full pr-9">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono truncate text-slate-800 group-[.is-active]:text-hb-primary-800 leading-tight tracking-wide font-semibold">{a.number}{a.name?` · ${a.name}`:''}</div>
                  </div>
                </div>
                <div className="mt-1 pt-1 border-t border-slate-100/80">
                  <div className="grid grid-cols-[auto,1fr] items-baseline gap-x-3 gap-y-1 text-[13px]">
                    <span className="text-slate-600">Bank</span>
                    <span className="font-mono tabular-nums justify-self-end text-slate-900 font-medium">{typeof summaries[a.id]?.bankBalance === 'number' ? (<Amount value={Number(summaries[a.id]?.bankBalance||0)} />) : '—'}</span>
                    <span className="text-slate-600">Haypbooks</span>
                    <span className="font-mono tabular-nums justify-self-end text-slate-900 font-medium">{typeof summaries[a.id]?.booksBalance === 'number' ? (<Amount value={Number(summaries[a.id]?.booksBalance||0)} />) : (typeof a.balance === 'number' ? (<Amount value={Number(a.balance||0)} />) : '—')}</span>
                    {typeof summaries[a.id]?.bankBalance === 'number' && typeof summaries[a.id]?.booksBalance === 'number' && (
                      (() => {
                        const diff = Number(((summaries[a.id]?.bankBalance as number) - (summaries[a.id]?.booksBalance as number)).toFixed(2))
                        const nearZero = Math.abs(diff) <= 0.004
                        const color = nearZero ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (diff < 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-hb-primary-50 text-hb-primary-700 border-hb-primary-200')
                        return (
                          <>
                            <span className="text-slate-600">Diff</span>
                            <span className={`inline-flex items-center justify-end gap-1 rounded-full px-2 py-[1px] text-[11px] font-semibold border justify-self-end ${color}`} title="Bank − Haypbooks">
                              {nearZero ? (
                                <>
                                  <span className="translate-y-[0.5px]">✓</span>
                                  <span className="tabular-nums"><Amount value={0} /></span>
                                </>
                              ) : (
                                <span className="tabular-nums"><Amount value={diff} /></span>
                              )}
                            </span>
                          </>
                        )
                      })()
                    )}
                  </div>
                </div>
              </div>
              {active ? (
                <span
                  className="absolute top-2 right-2 inline-grid place-items-center w-7 h-7 rounded-full bg-hb-primary text-white text-[12px] shadow"
                  role="img"
                  aria-label="Selected"
                  title="Selected"
                >✓</span>
              ) : (
                <span
                  className="absolute top-2 right-2 inline-grid place-items-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-[12px] shadow-sm group-hover:shadow"
                  role="img"
                  aria-label="Choose"
                  title="Choose"
                >＋</span>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}

// Inline select for accounts for quick filter changes
function InlineAccountSelect({ id, value, onChange }: { id: string; value: string; onChange: (id: string)=>void }) {
  const [accounts, setAccounts] = React.useState<Array<{ id: string; number: string; name?: string }>>([])
  React.useEffect(() => {
    let alive = true
    fetch('/api/accounts?reconcilable=1', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!alive) return; setAccounts(Array.isArray(d?.accounts)?d.accounts:[]) })
      .catch(() => { if (alive) setAccounts([]) })
    return () => { alive = false }
  }, [])
  return (
    <select id={id} aria-label="Account" className="w-[24ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={value} onChange={(e)=>{ try { window.localStorage.setItem('bank:lastAccountId', e.currentTarget.value) } catch {}; onChange(e.currentTarget.value) }}>
      <option value="">All accounts</option>
      {accounts.map(a => (<option key={a.id} value={a.id}>{a.number}{a.name?` · ${a.name}`:''}</option>))}
    </select>
  )
}

// Lightweight Tag selector using /api/tags
function TagSelectControl({ pathname, sp, router, tag }: { pathname: string; sp: URLSearchParams; router: any; tag: string }) {
  const [tags, setTags] = React.useState<Array<{ id: string; name: string; group?: string | null }>>([])
  React.useEffect(() => {
    let alive = true
    fetch('/api/tags', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!alive) return; setTags(Array.isArray(d?.tags) ? d.tags : []) })
      .catch(() => { if (alive) setTags([]) })
    return () => { alive = false }
  }, [])
  return (
    <select
      id="txn-tag"
      value={tag || ''}
      onChange={(e) => {
        const qs = new URLSearchParams(sp.toString())
        qs.set('page', '1')
        if (e.target.value) qs.set('tag', e.target.value); else qs.delete('tag')
        router.replace(`${pathname}?${qs.toString()}` as any)
      }}
      className="w-[18ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm"
    >
      <option value="">All tags</option>
      {tags.map(t => (
        <option key={t.id} value={t.id}>{t.group ? `${t.group}: ` : ''}{t.name}</option>
      ))}
    </select>
  )
}

// New Transfer modal (client)
function NewTransferModal({ onClose, onCreated }: { onClose: ()=>void; onCreated: ()=>Promise<void>|void }) {
  const [accounts, setAccounts] = React.useState<Array<{ id: string; number: string; name?: string }>>([])
  const [from, setFrom] = React.useState<string>('')
  const [to, setTo] = React.useState<string>('')
  const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0,10))
  const [amount, setAmount] = React.useState<string>('')
  const [memo, setMemo] = React.useState<string>('')
  const [err, setErr] = React.useState<string>('')
  const [busy, setBusy] = React.useState(false)
  React.useEffect(() => {
    let alive = true
    fetch('/api/accounts?includeInactive=1', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!alive) return
        const list = Array.isArray(d?.accounts) ? d.accounts : []
        setAccounts(list)
        const cash = list.find((a:any)=>a.number==='1000')?.id || list[0]?.id || ''
        const undep = list.find((a:any)=>a.number==='1010')?.id || ''
        setFrom(cash)
        setTo(undep && undep!==cash ? undep : (list.find((a:any)=>a.id!==cash)?.id || ''))
      })
      .catch(()=>{ if (alive) setAccounts([]) })
    return () => { alive = false }
  }, [])
  const acctNumber = (id?: string) => (accounts.find(a=>a.id===id)?.number || '')
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-label="New transfer">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">New Transfer</h2>
          <button className="btn-secondary btn-xs" onClick={onClose} aria-label="Close">Close</button>
        </div>
        {err && (<div className="mt-2 text-sm text-red-600">{err}</div>)}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-slate-600">From account</label>
            <select aria-label="From account" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={from} onChange={e=>setFrom(e.target.value)}>
              {accounts.map(a => (<option key={a.id} value={a.id}>{a.number}{a.name?` · ${a.name}`:''}</option>))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-600">To account</label>
            <select aria-label="To account" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={to} onChange={e=>setTo(e.target.value)}>
              {accounts.map(a => (<option key={a.id} value={a.id}>{a.number}{a.name?` · ${a.name}`:''}</option>))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-600">Date</label>
            <input type="date" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={date} onChange={e=>setDate(e.target.value)} aria-label="Transfer date" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-600">Amount</label>
            <input type="number" step="0.01" inputMode="decimal" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={amount} onChange={e=>setAmount(e.target.value)} aria-label="Amount" placeholder="0.00" />
          </div>
          <div className="md:col-span-2 flex flex-col">
            <label className="text-xs text-slate-600">Memo (optional)</label>
            <input type="text" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={memo} onChange={e=>setMemo(e.target.value)} aria-label="Memo" placeholder="Optional" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className={`btn-primary ${busy?'opacity-60 pointer-events-none':''}`}
            onClick={async ()=>{
              setErr('')
              try {
                setBusy(true)
                const payload = {
                  date,
                  fromAccountNumber: acctNumber(from),
                  toAccountNumber: acctNumber(to),
                  amount: Number(amount),
                  memo: memo || undefined,
                }
                const resp = await fetch('/api/bank-transfers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                if (!resp.ok) {
                  const m = await resp.json().catch(()=>({error:'Failed'}))
                  setErr(String(m?.error || 'Failed to create transfer'))
                  setBusy(false)
                  return
                }
                await onCreated()
              } catch (e:any) {
                setErr('Failed to create transfer')
              } finally {
                setBusy(false)
              }
            }}
          >Create</button>
        </div>
      </div>
    </div>
  )
}

// Categorize panel with split editor
function CategorizePanel({ txn, onClose, onSaved, onUpdate }: { txn: TxnWithMatch; onClose: ()=>void; onSaved: ()=>Promise<void>|void; onUpdate: (input: any)=>Promise<any> }) {
  const [accounts, setAccounts] = React.useState<Array<{ id: string; number: string; name?: string; type?: string }>>([])
  const [accountId, setAccountId] = React.useState<string>(txn.accountId)
  const [category, setCategory] = React.useState<string>(txn.category || 'Expense')
  const [memo, setMemo] = React.useState<string>(txn.description || '')
  const [splits, setSplits] = React.useState<Array<{ accountId: string; amount: string; memo?: string }>>(
    Array.isArray(txn.splits) && txn.splits.length > 0 ? txn.splits.map(s=>({ accountId: s.accountId, amount: String(s.amount), memo: s.memo })) : []
  )
  const [busy, setBusy] = React.useState(false)
  const [err, setErr] = React.useState<string>('')

  useEffect(() => {
    let alive = true
    fetch('/api/accounts?includeInactive=1', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!alive) return; setAccounts(Array.isArray(d?.accounts) ? d.accounts : []) })
      .catch(()=>{ if (alive) setAccounts([]) })
    return () => { alive = false }
  }, [])

  const removeSplit = (i: number) => setSplits(prev => prev.filter((_,idx)=>idx!==i))

  const totalSplits = () => Number(splits.reduce((s,l)=> s + (Number(l.amount)||0), 0).toFixed(2))

  const save = async () => {
    setErr('')
    try {
      setBusy(true)
      const payload: any = {
        ...txn,
        description: memo || txn.description,
        category: (category === 'Income' || category === 'Transfer') ? category : 'Expense',
        accountId,
        bankStatus: 'categorized',
      }
      const cleanedSplits = splits.filter(s=> (Number(s.amount)||0) !== 0).map(s=>({ accountId: s.accountId, amount: Number(s.amount), memo: s.memo || undefined }))
      if (cleanedSplits.length > 0) {
        // Validate split sum equals amount
        const sum = Number(cleanedSplits.reduce((s,l)=> s + (Number(l.amount)||0), 0).toFixed(2))
        const amt = Number(txn.amount || 0)
        if (Math.abs(sum - amt) > 0.004) {
          setErr('Split total must equal transaction amount')
          setBusy(false); return
        }
        payload.splits = cleanedSplits
      } else {
        payload.splits = undefined
      }
      await onUpdate(payload)
      await onSaved()
    } catch (e:any) {
      setErr(String(e?.message || 'Failed to save'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-white/80 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-700">Categorize transaction</div>
        <button className="btn-secondary btn-xs" onClick={onClose}>Close</button>
      </div>
      {err && (<div className="mt-2 text-sm text-red-600">{err}</div>)}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col">
          <label htmlFor="cat-account" className="text-xs text-slate-600">Account</label>
          <select id="cat-account" aria-label="Account" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={accountId} onChange={e=>setAccountId(e.target.value)}>
            {accounts.map(a => (<option key={a.id} value={a.id}>{a.number}{a.name?` · ${a.name}`:''}</option>))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="cat-category" className="text-xs text-slate-600">Category</label>
          <select id="cat-category" aria-label="Category" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
            <option value="Transfer">Transfer</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="cat-memo" className="text-xs text-slate-600">Memo</label>
          <input id="cat-memo" aria-label="Memo" placeholder="Optional" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={memo} onChange={e=>setMemo(e.target.value)} />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">Splits (optional)</div>
        </div>
        {splits.length === 0 ? (
          <div className="mt-1 text-xs text-slate-500">No splits. The full amount will post to the selected account.</div>
        ) : (
          <div className="mt-2 space-y-2">
            {splits.map((s, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                <div className="md:col-span-3 flex flex-col">
                  <label htmlFor={`split-account-${idx}`} className="text-xs text-slate-600">Split account</label>
                  <select id={`split-account-${idx}`} aria-label="Split account" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={s.accountId} onChange={e=>setSplits(prev=>prev.map((p,i)=> i===idx?{...p, accountId:e.target.value}:p))}>
                    {accounts.map(a => (<option key={a.id} value={a.id}>{a.number}{a.name?` · ${a.name}`:''}</option>))}
                  </select>
                </div>
                <div className="md:col-span-2 flex flex-col">
                  <label htmlFor={`split-amount-${idx}`} className="text-xs text-slate-600">Amount</label>
                  <input id={`split-amount-${idx}`} aria-label="Split amount" type="number" inputMode="decimal" step="0.01" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={s.amount} onChange={e=>setSplits(prev=>prev.map((p,i)=> i===idx?{...p, amount:e.target.value}:p))} />
                </div>
                <div className="md:col-span-1 flex items-center gap-2">
                  <button className="btn-tertiary btn-xs" onClick={()=>removeSplit(idx)}>Remove</button>
                </div>
                <div className="md:col-span-6 flex flex-col">
                  <label htmlFor={`split-memo-${idx}`} className="text-xs text-slate-600">Memo (optional)</label>
                  <input id={`split-memo-${idx}`} aria-label="Split memo" placeholder="Optional" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={s.memo||''} onChange={e=>setSplits(prev=>prev.map((p,i)=> i===idx?{...p, memo:e.target.value}:p))} />
                </div>
              </div>
            ))}
            <div className="text-xs text-slate-600">Split total: <span className="tabular-nums"><Amount value={totalSplits()} /></span> of <span className="tabular-nums"><Amount value={txn.amount} /></span></div>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className={`btn-primary ${busy?'opacity-60 pointer-events-none':''}`} onClick={save}>Save & Categorize</button>
      </div>
    </div>
  )
}

// Expanded row content: options and nested suggestion list
function TxnExpanded({ txn, onOpenCategorize, onOpenSplit, onOpenManualMatch, onFetchSuggestions, suggestionsPanel, categorizePanel, splitPanel, manualPanel }: { txn: TxnWithMatch; onOpenCategorize: ()=>void; onOpenSplit: ()=>void; onOpenManualMatch: ()=>void; onFetchSuggestions: ()=>void; suggestionsPanel: React.ReactNode|null; categorizePanel: React.ReactNode|null; splitPanel: React.ReactNode|null; manualPanel: React.ReactNode|null }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-slate-700">
          {manualPanel ? (
            <span className="inline-flex items-center gap-2"><span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-[1px] text-[11px]">Manual Match Mode</span> for <span className="font-mono">{txn.id}</span></span>
          ) : (
            <>Actions for <span className="font-mono">{txn.id}</span></>
          )}
        </div>
          <div className="flex items-center gap-2">
          <button className="btn-secondary btn-xs" onClick={onOpenCategorize} aria-label="Open categorize">Categorize</button>
          <button className="btn-secondary btn-xs" onClick={onOpenSplit} aria-label="Open split">Split</button>
          <button className="btn-secondary btn-xs" onClick={onFetchSuggestions} aria-label="Open match suggestions">Match suggestions</button>
          <button
            className="btn-secondary btn-xs"
            onClick={onOpenManualMatch}
            aria-label="Open manual match panel"
            title="Open manual matching to select invoices (for deposits) or bills (for withdrawals)"
          >
            Find match…
          </button>
        </div>
      </div>
      {categorizePanel}
      {splitPanel}
      {manualPanel}
      {suggestionsPanel}
    </div>
  )
}

function SuggestionsPanel({ items, onApply, onClose }: { items: Array<{ kind: 'invoice'|'bill'|'deposit'|'transfer'; id: string; number: string; name: string; date: string; balance: number }>; onApply: (it: any)=>void; onClose: ()=>void }) {
  const containerRef = React.useRef<HTMLDivElement|null>(null)
  React.useEffect(() => { containerRef.current?.focus() }, [])
  return (
    <div
      ref={containerRef}
      className="rounded-md border border-slate-200 bg-white/80 p-2"
      role="region"
      aria-label="Match suggestions"
      tabIndex={-1}
      onKeyDown={(e)=>{ if (e.key === 'Escape') { e.preventDefault(); onClose() } }}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-700">Match suggestions</div>
        <button className="btn-secondary btn-xs" onClick={onClose} aria-label="Close suggestions">Close</button>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-slate-500 mt-1">No close matches found.</div>
      ) : (
        <ul className="mt-1 space-y-1">
          {items.slice(0,3).map(it => (
            <li key={`${it.kind}:${it.id}`} className="text-sm text-slate-700 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="inline-block min-w-[7ch] text-xs uppercase text-slate-500">{it.kind}</span>
                <span className="font-mono">{it.number}</span> — {it.name} — <span className="font-mono">{it.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="tabular-nums"><Amount value={it.balance} /></div>
                <button className="btn-primary btn-xs" onClick={()=>onApply(it)} aria-label={`Apply match to ${it.kind} ${it.number}`}>Apply</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Floating drawer for bulk categorize
function BulkCategorizeDrawer({ open, count, total, onClose, onApply }: { open: boolean; count: number; total: number; onClose: ()=>void; onApply: (payload: { accountId?: string; category?: string; memo?: string })=>Promise<void>|void }) {
  const [accounts, setAccounts] = React.useState<Array<{ id: string; number: string; name?: string }>>([])
  const [accountId, setAccountId] = React.useState<string>('')
  const [category, setCategory] = React.useState<string>('Expense')
  const [memo, setMemo] = React.useState<string>('')
  const [entered, setEntered] = React.useState(false)
  const [emph, setEmph] = React.useState(true)
  const containerRef = React.useRef<HTMLDivElement|null>(null)
  React.useEffect(() => {
    let alive = true
    fetch('/api/accounts?includeInactive=1', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!alive) return; const list = Array.isArray(d?.accounts) ? d.accounts : []; setAccounts(list); setAccountId(list[0]?.id || '') })
      .catch(()=>{ if (alive) setAccounts([]) })
    // entrance animation
    setEntered(false)
    const t1 = setTimeout(() => setEntered(true), 10)
    const t2 = setTimeout(() => setEmph(false), 260)
    return () => { alive = false; clearTimeout(t1); clearTimeout(t2) }
  }, [])
  React.useEffect(() => {
    if (!open) return
    // focus first interactive control for accessibility
    const sel = document.getElementById('bulk-account') as HTMLSelectElement | null
    if (sel) { sel.focus(); return }
    containerRef.current?.focus()
  }, [open])
  if (!open) return null
  const accent = emph ? 'border-sky-500 ring-sky-300 border-2 ring-1' : 'border-sky-200 border ring-0'
  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Bulk categorize selected transactions"
      aria-describedby="bulk-categorize-summary"
      tabIndex={-1}
      onKeyDown={(e)=>{ if (e.key === 'Escape') { e.preventDefault(); onClose() } }}
      className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[min(100%,56rem)] rounded-xl bg-white/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-white/80 transition-all duration-200 ease-out ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${accent}`}
    >
      <div className="p-3">
        <div id="bulk-categorize-summary" className="sr-only" aria-live="polite">Categorizing {count} selected totaling {total}</div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-slate-700">Categorize selected ({count}) — Total <span className="font-mono tabular-nums"><Amount value={total} /></span></div>
          <button className="btn-secondary btn-xs" onClick={onClose} aria-label="Close bulk categorize">Close</button>
        </div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="flex flex-col">
            <label htmlFor="bulk-account" className="text-xs text-slate-600">Account</label>
            <select id="bulk-account" aria-label="Account" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={accountId} onChange={e=>setAccountId(e.target.value)}>
              {accounts.map(a => (<option key={a.id} value={a.id}>{a.number}{a.name?` · ${a.name}`:''}</option>))}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="bulk-category" className="text-xs text-slate-600">Category</label>
            <select id="bulk-category" aria-label="Category" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="bulk-memo" className="text-xs text-slate-600">Memo</label>
            <input id="bulk-memo" aria-label="Memo" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={memo} onChange={e=>setMemo(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={()=>onApply({ accountId, category, memo: memo || undefined })}>Apply</button>
        </div>
      </div>
    </div>
  )
}

// Split-only panel (client) — only manages txn.splits, keeps memo/account/category untouched
function SplitPanel({ txn, onClose, onSaved, onUpdate }: { txn: TxnWithMatch; onClose: ()=>void; onSaved: ()=>Promise<void>|void; onUpdate: (input: any)=>Promise<any> }) {
  const [accounts, setAccounts] = React.useState<Array<{ id: string; number: string; name?: string }>>([])
  const [splits, setSplits] = React.useState<Array<{ accountId: string; amount: string; memo?: string }>>(
    Array.isArray(txn.splits) && txn.splits.length > 0 ? txn.splits.map(s=>({ accountId: s.accountId, amount: String(s.amount), memo: s.memo })) : []
  )
  const [busy, setBusy] = React.useState(false)
  const [err, setErr] = React.useState<string>('')
  React.useEffect(() => {
    let alive = true
    fetch('/api/accounts?includeInactive=1', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!alive) return; setAccounts(Array.isArray(d?.accounts) ? d.accounts : []) })
      .catch(()=>{ if (alive) setAccounts([]) })
    return () => { alive = false }
  }, [])
  const addSplit = () => setSplits(prev => [...prev, { accountId: accounts[0]?.id || txn.accountId, amount: '', memo: '' }])
  const removeSplit = (i: number) => setSplits(prev => prev.filter((_,idx)=>idx!==i))
  const totalSplits = () => Number(splits.reduce((s,l)=> s + (Number(l.amount)||0), 0).toFixed(2))
  const save = async () => {
    setErr('')
    try {
      setBusy(true)
      const cleaned = splits.filter(s=> (Number(s.amount)||0)!==0).map(s=>({ accountId: s.accountId, amount: Number(s.amount), memo: s.memo || undefined }))
      if (cleaned.length > 0) {
        const sum = Number(cleaned.reduce((s,l)=> s + (Number(l.amount)||0), 0).toFixed(2))
        const amt = Number(txn.amount || 0)
        if (Math.abs(sum - amt) > 0.004) { setErr('Split total must equal transaction amount'); setBusy(false); return }
      }
      await onUpdate({ id: txn.id, date: txn.date, description: txn.description, category: txn.category, amount: txn.amount, accountId: txn.accountId, bankStatus: 'for_review', splits: cleaned.length>0?cleaned:undefined })
      await onSaved()
    } catch (e:any) {
      setErr(String(e?.message || 'Failed to save splits'))
    } finally { setBusy(false) }
  }
  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-white/80 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-700">Split transaction</div>
        <button className="btn-secondary btn-xs" onClick={onClose}>Close</button>
      </div>
      {err && (<div className="mt-2 text-sm text-red-600">{err}</div>)}
      <div className="mt-2 space-y-2">
        {splits.map((s, idx) => (
          <div key={idx} className="grid md:grid-cols-12 gap-2 items-end">
            <div className="md:col-span-5 flex flex-col">
              <label htmlFor={`split-account-${idx}`} className="text-xs text-slate-600">Account</label>
              <select id={`split-account-${idx}`} aria-label="Split account" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={s.accountId} onChange={e=>setSplits(prev=>prev.map((p,i)=> i===idx?{...p, accountId:e.target.value}:p))}>
                {accounts.map(a => (<option key={a.id} value={a.id}>{a.number}{a.name?` · ${a.name}`:''}</option>))}
              </select>
            </div>
            <div className="md:col-span-3 flex flex-col">
              <label htmlFor={`split-amount-${idx}`} className="text-xs text-slate-600">Amount</label>
              <input id={`split-amount-${idx}`} aria-label="Split amount" inputMode="decimal" type="number" step="0.01" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={s.amount} onChange={e=>setSplits(prev=>prev.map((p,i)=> i===idx?{...p, amount:e.target.value}:p))} />
            </div>
            <div className="md:col-span-3 flex flex-col">
              <label htmlFor={`split-memo-${idx}`} className="text-xs text-slate-600">Memo (optional)</label>
              <input id={`split-memo-${idx}`} aria-label="Split memo" placeholder="Optional" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={s.memo||''} onChange={e=>setSplits(prev=>prev.map((p,i)=> i===idx?{...p, memo:e.target.value}:p))} />
            </div>
            <div className="md:col-span-1 flex items-center gap-2">
              <button className="btn-tertiary btn-xs" onClick={()=>removeSplit(idx)}>Remove</button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs text-slate-600">Split total: <span className="tabular-nums"><Amount value={totalSplits()} /></span> of <span className="tabular-nums"><Amount value={txn.amount} /></span></div>
          <button className="btn-secondary btn-xs" onClick={addSplit}>Add split</button>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className={`btn-primary ${busy?'opacity-60 pointer-events-none':''}`} onClick={save}>Save splits</button>
      </div>
    </div>
  )
}

// Manual match panel (client) — inline search/select for invoices or bills and apply
function ManualMatchPanel({ txn, onApply, onClose }: { txn: TxnWithMatch; onApply: (kind: 'invoice'|'bill', id: string)=>Promise<void>|void; onClose: ()=>void }) {
  const isDeposit = Number(txn.amount || 0) >= 0
  const [kind, setKind] = React.useState<'invoice'|'bill'>(isDeposit ? 'invoice' : 'bill')
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<Array<{ id: string; number?: string; name?: string; date?: string; balance?: number }>>([])
  const [err, setErr] = React.useState('')
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})
  // For validated adjustment account selection
  const [accounts, setAccounts] = React.useState<Array<{ id: string; number: string; name?: string }>>([])
  const containerRef = React.useRef<HTMLDivElement|null>(null)
  React.useEffect(() => {
    let alive = true
    fetch('/api/accounts?includeInactive=1', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!alive) return; setAccounts(Array.isArray(d?.accounts) ? d.accounts : []) })
      .catch(() => { if (alive) setAccounts([]) })
    return () => { alive = false }
  }, [])
  // Move focus to panel for accessibility; support Escape to close via onKeyDown handler below
  React.useEffect(() => { containerRef.current?.focus() }, [])
  const load = React.useCallback(async () => {
    setErr(''); setLoading(true)
    try {
      const url = kind === 'invoice' ? '/api/invoices?page=1&limit=200' : '/api/bills?page=1&limit=200'
      const r = await fetch(url, { cache: 'no-store' })
      if (!r.ok) throw new Error('Failed to load')
      const j = await r.json().catch(()=>null)
      const list = kind === 'invoice' ? (Array.isArray(j?.invoices)?j.invoices:[]) : (Array.isArray(j?.bills)?j.bills:[])
      setItems(list)
    } catch (e:any) { setErr('Failed to load') } finally { setLoading(false) }
  }, [kind])
  React.useEffect(() => { void load() }, [load])
  const selectedIds = Object.entries(selected).filter(([_,v])=>v).map(([k])=>k)
  const totalSelected = items.filter(it => selected[it.id]).reduce((s,it)=> s + (Number(it.balance)||0), 0)
  const bankAbs = Math.abs(Number(txn.amount||0))
  const diff = Number((bankAbs - totalSelected).toFixed(2))
  const [adjAccountId, setAdjAccountId] = React.useState('')
  const [adjAmount, setAdjAmount] = React.useState('')
  const epsilon = 0.005
  const adjAmtNum = Number(adjAmount)
  const adjAccountNumber = accounts.find(a=>a.id===adjAccountId)?.number || ''
  const hasExactTieOut = Math.abs(diff) < epsilon
  const hasValidAdjustment = !isNaN(adjAmtNum) && adjAmtNum > 0 && !!adjAccountNumber && Math.abs(adjAmtNum - Math.abs(diff)) < 0.01
  const canApply = selectedIds.length > 0 && (hasExactTieOut || hasValidAdjustment)
  return (
    <div
      ref={containerRef}
      className="mt-2 rounded-md border border-slate-200 bg-white/80 p-3"
      role="region"
      aria-label="Manual match"
      tabIndex={-1}
      onKeyDown={(e)=>{ if (e.key === 'Escape') { e.preventDefault(); onClose() } }}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-700">Manual match {isDeposit ? '— Deposit clears A/R' : '— Withdrawal clears A/P'}</div>
        <button className="btn-secondary btn-xs" onClick={onClose} aria-label="Close manual match panel">Close</button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="text-xs text-slate-600">Type</label>
        <select aria-label="Type" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={kind} onChange={e=>setKind(e.target.value as any)}>
          {isDeposit ? (<option value="invoice">Invoice</option>) : (<option value="bill">Bill</option>)}
        </select>
        <span className="text-xs text-slate-500">{isDeposit ? 'Deposits clear A/R (invoices)' : 'Withdrawals clear A/P (bills)'}</span>
        <button
          className={`btn-secondary btn-xs ${loading ? 'opacity-60 pointer-events-none' : ''}`}
          onClick={()=>{ void load() }}
          aria-label="Refresh available matches"
          title="Refresh the list of invoices or bills"
        >Refresh</button>
      </div>
      {err && (<div className="mt-1 text-sm text-red-600">{err}</div>)}
      {loading ? (<div className="mt-2 text-sm text-slate-600">Loading…</div>) : (
        <>
          <ul className="mt-2 space-y-1 max-h-64 overflow-auto">
            {items.map(it => (
              <li key={it.id} className="text-sm text-slate-700 flex items-center justify-between gap-2">
                <label className="min-w-0 flex-1 flex items-center gap-2">
                  <input type="checkbox" className="shrink-0" checked={!!selected[it.id]} onChange={(e)=> setSelected(prev => ({ ...prev, [it.id]: e.currentTarget.checked }))} aria-label={`Select ${kind} ${it.number || it.id}`} />
                  <span className="font-mono">{it.number || it.id}</span> — {it.name || ''} {it.date ? (<span className="font-mono">— {String(it.date).slice(0,10)}</span>) : null}
                </label>
                {typeof it.balance === 'number' ? (<div className="tabular-nums"><Amount value={it.balance} /></div>) : null}
              </li>
            ))}
            {items.length === 0 && (<li className="text-sm text-slate-500">No records found.</li>)}
          </ul>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-slate-600">Selected total: <span className="tabular-nums"><Amount value={totalSelected} /></span> of bank amount <span className="tabular-nums"><Amount value={bankAbs} /></span> — difference <span className={`tabular-nums ${Math.abs(diff) < 0.005 ? 'text-emerald-700' : 'text-slate-700'}`}><Amount value={Math.abs(diff)} /></span></div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-end gap-1">
                <div className="flex flex-col">
                  <label className="text-xs text-slate-600">Adjustment account</label>
                  <select
                    aria-label="Adjustment account"
                    className="w-[26ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs"
                    value={adjAccountId}
                    onChange={(e)=>setAdjAccountId(e.currentTarget.value)}
                  >
                    <option value="">Choose account…</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.number}{a.name?` · ${a.name}`:''}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-600">Adjustment amount</label>
                  <input
                    value={adjAmount}
                    onChange={(e)=>setAdjAmount(e.currentTarget.value)}
                    placeholder={Math.abs(diff).toFixed(2)}
                    inputMode="decimal"
                    type="number"
                    step="0.01"
                    className="w-[14ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs"
                  />
                </div>
              </div>
              {!canApply && selectedIds.length>0 && (
                <div className="text-[11px] text-slate-500 max-w-[46ch]">To apply, either select invoices/bills totaling the bank amount or enter an adjustment equal to the difference.</div>
              )}
              <button className="btn-tertiary btn-xs" onClick={()=> setSelected({})}>Clear</button>
              <button
                className={`btn-primary btn-xs ${(canApply? '': 'opacity-60 pointer-events-none')}`}
                title={canApply? '' : (selectedIds.length===0? 'Select one or more items' : 'Selections must tie out or add an equal adjustment')}
                onClick={async ()=>{
                try {
                  const payload: any = { txnId: txn.id, kind, selections: selectedIds.map(id=>({ id })) }
                  if (hasValidAdjustment) {
                    payload.manualAdjustment = { accountNumber: adjAccountNumber, amount: adjAmtNum }
                  }
                  const resp = await fetch('/api/bank-feeds/apply-manual-bundle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                  if (!resp.ok) {
                    const j = await resp.json().catch(()=>null)
                    alert(j?.error || 'Failed to apply manual match')
                    return
                  }
                  setSelected({})
                  setAdjAccountId(''); setAdjAmount('')
                  onClose()
                } catch {}
              }} aria-label="Apply selected matches">Apply selected</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Complex match UI removed per policy — API remains available for tests

// Floating drawer for choosing among multiple match suggestions
function MatchChooserDrawer({ open, items, onClose, onApply }: { open: boolean; items: Array<{ kind: 'invoice'|'bill'|'deposit'|'transfer'; id: string; number: string; name: string; date: string; balance: number }>; onClose: ()=>void; onApply: (it: { kind: 'invoice'|'bill'|'deposit'|'transfer'; id: string; number: string; name: string; date: string; balance: number })=>void }) {
  const [entered, setEntered] = React.useState(false)
  const [emph, setEmph] = React.useState(true)
  const containerRef = React.useRef<HTMLDivElement|null>(null)
  React.useEffect(() => {
    if (!open) return
    setEntered(false)
    const t1 = setTimeout(() => setEntered(true), 10)
    const t2 = setTimeout(() => setEmph(false), 260)
    // focus the first Apply button if available, else the container
    const t3 = setTimeout(() => {
      const btn = document.querySelector('#match-chooser-list button.btn-primary') as HTMLButtonElement | null
      if (btn) btn.focus(); else containerRef.current?.focus()
    }, 20)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [open])
  if (!open) return null
  const accent = emph ? 'border-sky-500 ring-sky-300 border-2 ring-1' : 'border-slate-200 border ring-0'
  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Select a match"
      aria-describedby="match-chooser-summary"
      tabIndex={-1}
      onKeyDown={(e)=>{ if (e.key === 'Escape') { e.preventDefault(); onClose() } }}
      className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[min(100%,56rem)] rounded-xl bg-white/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-white/80 transition-all duration-200 ease-out ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${accent}`}
    >
      <div className="p-3">
        <div id="match-chooser-summary" className="sr-only" aria-live="polite">{items.length} match option{items.length===1?'':'s'} available</div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">Select a match</div>
          <button className="btn-secondary btn-xs" onClick={onClose} aria-label="Close match chooser">Close</button>
        </div>
        <ul id="match-chooser-list" className="mt-2 space-y-1 max-h-72 overflow-auto">
          {items.map(it => (
            <li key={`${it.kind}:${it.id}`} className="text-sm text-slate-700 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="inline-block min-w-[7ch] text-xs uppercase text-slate-500">{it.kind}</span>
                <span className="font-mono">{it.number}</span> — {it.name} — <span className="font-mono">{String(it.date).slice(0,10)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="tabular-nums"><Amount value={it.balance} /></div>
                <button className="btn-primary btn-xs" onClick={()=>onApply(it)} aria-label={`Apply match to ${it.kind} ${it.number}`}>Apply</button>
              </div>
            </li>
          ))}
          {items.length === 0 && (<li className="text-sm text-slate-500">No matches available.</li>)}
        </ul>
      </div>
    </div>
  )
}
