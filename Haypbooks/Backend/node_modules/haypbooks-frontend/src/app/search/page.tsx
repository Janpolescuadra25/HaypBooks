"use client"
import React, { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Route } from 'next'

type GroupKey = 'invoices' | 'bills' | 'customers' | 'vendors' | 'transactions' | 'accounts'
type ResultItem = { id: string; type: GroupKey; title: string; subtitle?: string; href: string; meta?: string }
type Group = { items: ResultItem[]; total: number; hasMore: boolean }

function useDebounced<T>(value: T, delay = 200) {
  const [v, setV] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

function GlobalSearchPageInner() {
  const params = useSearchParams()
  const [q, setQ] = React.useState('')
  const dq = useDebounced(q, 250)
  const [groups, setGroups] = React.useState<Record<GroupKey, Group> | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  // Keyboard navigation state using aria-activedescendant pattern
  const [activeIndex, setActiveIndex] = React.useState<number>(-1)
  const order: GroupKey[] = React.useMemo(() => ['invoices','bills','customers','vendors','transactions','accounts'], [])
  const flatItems = React.useMemo(() => {
    if (!groups) return [] as Array<ResultItem & { group: GroupKey }>
    const items: Array<ResultItem & { group: GroupKey }> = []
    for (const k of order) {
      const g = groups[k]
      if (!g) continue
      for (const it of g.items) items.push({ ...it, group: k })
    }
    return items
  }, [groups, order])

  React.useEffect(() => {
    // Reset selection when results change
    if (flatItems.length > 0) setActiveIndex(0)
    else setActiveIndex(-1)
  }, [flatItems.length])

  // Initialize from ?q= query string (e.g., when submitting from header search)
  React.useEffect(() => {
    const initial = params.get('q')
    if (initial && !q) {
      setQ(initial)
      // Focus input for immediate keyboard navigation
      inputRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  React.useEffect(() => {
    let alive = true
    if (!dq || dq.trim().length < 2) { setGroups(null); setError(null); return }
    setLoading(true); setError(null)
    fetch(`/api/search?q=${encodeURIComponent(dq)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : r.json().then((b:any) => Promise.reject(new Error(b?.error || 'Search failed'))))
      .then((data) => { if (!alive) return; setGroups(data.groups) })
      .catch((e) => { if (!alive) return; setError(String(e?.message || 'Search failed')) })
      .finally(() => { if (!alive) return; setLoading(false) })
    return () => { alive = false }
  }, [dq])

  const labels: Record<GroupKey, string> = {
    invoices: 'Invoices', bills: 'Bills', customers: 'Customers', vendors: 'Vendors', transactions: 'Transactions', accounts: 'Accounts'
  }

  const activeId = activeIndex >= 0 && activeIndex < flatItems.length
    ? `search-opt-${activeIndex}`
    : undefined

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!flatItems.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % flatItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + flatItems.length) % flatItems.length)
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < flatItems.length) {
        e.preventDefault()
        const target = flatItems[activeIndex]
        router.push(target.href as Route)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setQ('')
      setGroups(null)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center gap-3">
          <div className="grow">
            <label htmlFor="q" className="text-xs text-slate-600">Search everything</label>
            {(groups && !loading) ? (
              <input
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Invoice #, customer, vendor, transaction, account…"
                className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                aria-label="Global search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls={order.filter(k => groups?.[k] && groups![k].total > 0).map(k => `lb-${k}`).join(' ') || undefined}
                aria-activedescendant={activeId}
                ref={inputRef}
              />
            ) : (
              <input
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Invoice #, customer, vendor, transaction, account…"
                className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                aria-label="Global search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded="false"
                aria-controls={groups ? order.filter(k => groups[k] && groups[k].total > 0).map(k => `lb-${k}`).join(' ') || undefined : undefined}
                aria-activedescendant={activeId}
                ref={inputRef}
              />
            )}
          </div>
        </div>
      </div>

      {error && (<div className="glass-card text-red-700">{error}</div>)}
      {!error && (!q || q.trim().length < 2) && (
        <div className="glass-card text-slate-600">Type at least 2 characters to search invoices, bills, customers, vendors, transactions, and accounts.</div>
      )}
      {!error && loading && (<div className="glass-card" aria-busy="true">Searching…</div>)}

      {!error && !loading && groups && (
        <div aria-label="Search results" className="space-y-4">
          {order.map((k) => {
            const g = groups[k]
            if (!g || g.total === 0) return null
            return (
              <div key={k} className="glass-card" role="group" aria-labelledby={`grp-title-${k}`}>
                <div className="flex items-center justify-between">
                  <h2 id={`grp-title-${k}`} className="text-base font-semibold text-slate-900">{labels[k]}</h2>
                  <div className="text-sm text-slate-500">{g.total} result{g.total===1?'':'s'}</div>
                </div>
                <ul id={`lb-${k}`} role="listbox" aria-labelledby={`grp-title-${k}`} className="mt-2 divide-y divide-slate-100">
                  {g.items.map((it) => {
                    const globalIndex = flatItems.findIndex(fi => fi.id === it.id && fi.type === it.type)
                    const isActive = globalIndex === activeIndex
                    return isActive ? (
                      <li
                        key={it.id}
                        id={`search-opt-${globalIndex}`}
                        role="option"
                        aria-selected="true"
                        className={`py-2 rounded-md bg-slate-100 outline-none`}
                      >
                        <Link href={it.href as Route} className="block hover:underline" tabIndex={-1}>
                          <div className="flex items-baseline justify-between">
                            <div className="min-w-0">
                              <div className="truncate text-slate-900">{it.title}</div>
                              {it.subtitle && <div className="text-xs text-slate-500">{it.subtitle}</div>}
                            </div>
                            {it.meta && <div className="ml-3 shrink-0 text-sm tabular-nums text-slate-700">{it.meta}</div>}
                          </div>
                        </Link>
                      </li>
                    ) : (
                      <li
                        key={it.id}
                        id={`search-opt-${globalIndex}`}
                        role="option"
                        aria-selected="false"
                        className={`py-2 rounded-md`}
                      >
                        <Link href={it.href as Route} className="block hover:underline" tabIndex={-1}>
                          <div className="flex items-baseline justify-between">
                            <div className="min-w-0">
                              <div className="truncate text-slate-900">{it.title}</div>
                              {it.subtitle && <div className="text-xs text-slate-500">{it.subtitle}</div>}
                            </div>
                            {it.meta && <div className="ml-3 shrink-0 text-sm tabular-nums text-slate-700">{it.meta}</div>}
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                {g.hasMore && (
                  <div className="mt-2 text-xs text-slate-500">Showing top {g.items.length} of {g.total}. Refine your query to narrow results.</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={<div className="glass-card" aria-busy="true">Loading…</div>}>
      <GlobalSearchPageInner />
    </Suspense>
  )
}
