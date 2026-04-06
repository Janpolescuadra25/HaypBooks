/**
 * General Ledger - Financial Monitoring Hub
 *
 * PURPOSE: READ-ONLY analytical view of ALL financial activity.
 *
 * PRINCIPLES:
 * 1. NO data entry - each module has its own input form
 * 2. Unified list from Invoices, Bills, JEs, Banking, Credits
 * 3. Powerful filtering, drill-down navigation, and CSV export
 * 4. Serves as data source for Financial Statements (Trial Balance, P&L, BS)
 *
 * DO NOT ADD: manual JE creation form, invoice form, bill form, or any data entry.
 */
'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Loader2, AlertCircle, X, ChevronLeft, ChevronRight,
  Download, Search, RefreshCw, CheckCircle2, ExternalLink,
  Activity, ArrowUp, ArrowDown, ArrowUpDown,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

// ─── Types ────────────────────────────────────────────────────────────────────

type SourceType = 'ALL' | 'MANUAL_JOURNAL' | 'INVOICE' | 'BILL' | 'PAYMENT' | 'BILL_PAYMENT' | 'BANK_DEPOSIT' | 'REFUND'

interface GlEntry {
  id: string
  date: string
  entryNumber?: string
  entryDescription?: string
  description?: string
  accountId: string
  accountCode: string
  accountName: string
  accountCategory?: string
  debit: number
  credit: number
  runningBalance?: number
  sourceType: SourceType
  sourceId?: string
  postedBy?: { name: string; email: string } | null
}

interface GlResponse {
  entries: GlEntry[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  account?: { id: string; code: string; name: string; type: { category: string; normalSide: string } }
  openingBalance?: number
  closingBalance?: number
  totalDebits?: number
  totalCredits?: number
}

interface Account {
  id: string
  code: string
  name: string
  type: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SOURCE_OPTIONS: { value: SourceType; label: string }[] = [
  { value: 'ALL',            label: 'All Types' },
  { value: 'INVOICE',        label: 'Invoices' },
  { value: 'BILL',           label: 'Bills' },
  { value: 'PAYMENT',        label: 'Payments Received' },
  { value: 'BILL_PAYMENT',   label: 'Bill Payments' },
  { value: 'BANK_DEPOSIT',   label: 'Bank Deposits' },
  { value: 'REFUND',         label: 'Refunds' },
  { value: 'MANUAL_JOURNAL', label: 'Manual Journals' },
]

const SOURCE_BADGE: Record<SourceType, { label: string; cls: string }> = {
  ALL:            { label: 'All',          cls: 'bg-slate-100 text-slate-600' },
  MANUAL_JOURNAL: { label: 'Manual JE',    cls: 'bg-violet-100 text-violet-700' },
  INVOICE:        { label: 'Invoice',      cls: 'bg-emerald-100 text-emerald-700' },
  BILL:           { label: 'Bill',         cls: 'bg-amber-100 text-amber-700' },
  PAYMENT:        { label: 'Payment',      cls: 'bg-blue-100 text-blue-700' },
  BILL_PAYMENT:   { label: 'Bill Pmt',     cls: 'bg-orange-100 text-orange-700' },
  BANK_DEPOSIT:   { label: 'Bank Dep.',    cls: 'bg-teal-100 text-teal-700' },
  REFUND:         { label: 'Refund',       cls: 'bg-rose-100 text-rose-700' },
}

/** Maps sourceType → the route where the source document lives */
function getSourceRoute(sourceType: SourceType, sourceId?: string): string | null {
  if (!sourceId) return null
  switch (sourceType) {
    case 'INVOICE':        return `/sales/billing/invoices/${sourceId}`
    case 'PAYMENT':        return `/sales/billing/invoices/${sourceId}`
    case 'BILL':           return `/purchases/bills/${sourceId}`
    case 'BILL_PAYMENT':   return `/purchases/bills/${sourceId}`
    case 'BANK_DEPOSIT':   return `/banking-cash/transactions/${sourceId}`
    case 'REFUND':         return `/sales/billing/invoices/${sourceId}`
    case 'MANUAL_JOURNAL': return `/accounting/core-accounting/journal-entries/${sourceId}`
    default:               return null
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GeneralLedgerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const searchRef = useRef<HTMLInputElement>(null)

  // ── Filter state ───────────────────────────────────────────────────────────
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountId, setAccountId] = useState(() => searchParams?.get('accountId') ?? '')
  const [accountFilterLabel, setAccountFilterLabel] = useState(() => {
    const name = searchParams?.get('accountName')
    const code = searchParams?.get('accountCode')
    return name ? `${code ? code + ' — ' : ''}${name}` : ''
  })
  const [sourceType, setSourceType] = useState<SourceType>('ALL')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 3)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])
  const [page, setPage] = useState(1)

  // ── Sort state ────────────────────────────────────────────────────────────
  type SortField = 'date' | 'entryNumber' | 'sourceType' | 'accountName' | 'debit' | 'credit'
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: SortField) => {
    setSortField(prev => {
      if (prev === field) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return field }
      setSortDir('asc'); return field
    })
  }

  // ── Data state ─────────────────────────────────────────────────────────────
  const [glData, setGlData] = useState<GlResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Active filter chips ───────────────────────────────────────────────────
  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (accountFilterLabel) chips.push({ key: 'account', label: accountFilterLabel, onRemove: () => { setAccountId(''); setAccountFilterLabel('') } })
    if (sourceType !== 'ALL') chips.push({ key: 'source', label: SOURCE_OPTIONS.find(o => o.value === sourceType)?.label ?? sourceType, onRemove: () => setSourceType('ALL') })
    if (search) chips.push({ key: 'search', label: `"${search}"`, onRemove: () => setSearch('') })
    return chips
  }, [accountFilterLabel, sourceType, search])

  // ── Load accounts ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!companyId) return
    apiClient.get(`/companies/${companyId}/accounting/accounts`)
      .then(({ data }) => {
        const accts = Array.isArray(data) ? data : data.accounts ?? []
        setAccounts(accts)
      })
      .catch(() => {})
  }, [companyId])

  // ── Load GL entries ───────────────────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const params: Record<string, any> = { from, to, page, limit: 50 }
      if (accountId) params.accountId = accountId
      if (sourceType !== 'ALL') params.sourceType = sourceType
      if (search.trim()) params.search = search.trim()
      const { data } = await apiClient.get(`/companies/${companyId}/general-ledger`, { params })
      setGlData(data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load general ledger')
    } finally {
      setLoading(false)
    }
  }, [companyId, from, to, page, accountId, sourceType, search])

  useEffect(() => { fetchEntries() }, [fetchEntries])
  useEffect(() => { setPage(1) }, [from, to, accountId, sourceType, search])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'Escape') { setSearch(''); searchRef.current?.blur() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── CSV Export ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const entries = glData?.entries ?? []
    if (!entries.length) return
    const header = ['Date', 'Entry #', 'Source Type', 'Account Code', 'Account Name', 'Description', 'Debit', 'Credit', 'Running Balance']
    const rows = entries.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.entryNumber ?? '',
      e.sourceType,
      e.accountCode,
      e.accountName,
      e.entryDescription ?? e.description ?? '',
      e.debit?.toString() ?? '0',
      e.credit?.toString() ?? '0',
      e.runningBalance?.toString() ?? '',
    ])
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `general-ledger-${from}-to-${to}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
  }

  if (cidLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading…</span>
      </div>
    )
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  const entries = glData?.entries ?? []
  const pagination = glData?.pagination
  const account = glData?.account
  const totalDebits = glData?.totalDebits ?? entries.reduce((s, e) => s + (e.debit ?? 0), 0)
  const totalCredits = glData?.totalCredits ?? entries.reduce((s, e) => s + (e.credit ?? 0), 0)
  const netBalance = totalDebits - totalCredits
  const isBalanced = Math.abs(netBalance) < 0.005
  const showRunningBalance = !!accountId && entries.some(e => e.runningBalance !== undefined)

  const sortedEntries = useMemo(() => {
    const arr = [...entries]
    const mod = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      switch (sortField) {
        case 'date':        return mod * (new Date(a.date).getTime() - new Date(b.date).getTime())
        case 'entryNumber': return mod * (a.entryNumber ?? '').localeCompare(b.entryNumber ?? '')
        case 'sourceType':  return mod * a.sourceType.localeCompare(b.sourceType)
        case 'accountName': return mod * a.accountName.localeCompare(b.accountName)
        case 'debit':       return mod * ((a.debit ?? 0) - (b.debit ?? 0))
        case 'credit':      return mod * ((a.credit ?? 0) - (b.credit ?? 0))
        default:            return 0
      }
    })
    return arr
  }, [entries, sortField, sortDir])

  return (
    <div className="p-4 sm:p-6 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">General Ledger</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">
            Financial monitoring hub — all transactions across every module
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={fetchEntries}
            title="Refresh"
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExport}
            disabled={entries.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Inline Summary Bar ── */}
      {!loading && glData && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Summary</span>
          <span className="text-slate-500 text-xs">Debits: <span className="font-semibold text-emerald-700 tabular-nums">{fmt(totalDebits)}</span></span>
          <span className="text-slate-300 text-xs select-none hidden sm:inline">|</span>
          <span className="text-slate-500 text-xs">Credits: <span className="font-semibold text-blue-700 tabular-nums">{fmt(totalCredits)}</span></span>
          <span className="text-slate-300 text-xs select-none hidden sm:inline">|</span>
          <span className="text-slate-500 text-xs">Net: <span className={`font-semibold tabular-nums ${netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{fmt(Math.abs(netBalance))} {netBalance >= 0 ? 'Dr' : 'Cr'}</span></span>
          <span className="text-slate-300 text-xs select-none hidden sm:inline">|</span>
          <span className="text-slate-500 text-xs">Entries: <span className="font-semibold text-slate-700 tabular-nums">{pagination?.total ?? entries.length}</span></span>
          <span className="text-slate-300 text-xs select-none hidden sm:inline">|</span>
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            isBalanced ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            <CheckCircle2 size={11} />
            {isBalanced ? 'Balanced' : `Off by ${fmt(Math.abs(netBalance))}`}
          </span>
        </div>
      )}

      {/* ── Unified Filter Bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          {/* Account */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Account</label>
            <select
              value={accountId}
              onChange={e => { setAccountId(e.target.value); setAccountFilterLabel('') }}
              title="Filter by account"
              aria-label="Filter by account"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              <option value="">All Accounts</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
            </select>
          </div>

          {/* Source Type */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Source Type</label>
            <select
              value={sourceType}
              onChange={e => setSourceType(e.target.value as SourceType)}
              title="Filter by source type"
              aria-label="Filter by source type"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* From */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              title="From date" aria-label="From date"
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>

          {/* To */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              title="To date" aria-label="To date"
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Search <span className="text-slate-400 font-normal">(⌘F)</span></label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Memo, entry #, amount…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              {search && (
                <button onClick={() => setSearch('')} title="Clear search" aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
            <span className="text-xs text-slate-400">Active filters:</span>
            {activeFilters.map(chip => (
              <button
                key={chip.key}
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                {chip.label} <X size={10} />
              </button>
            ))}
            <button
              onClick={() => { setAccountId(''); setAccountFilterLabel(''); setSourceType('ALL'); setSearch('') }}
              className="text-xs text-slate-400 hover:text-slate-600 underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Account Detail Bar ── */}
      {account && (
        <div className="bg-emerald-50/60 rounded-lg p-3 flex flex-wrap gap-4 items-center text-sm border border-emerald-100">
          <div>
            <span className="font-mono text-emerald-600">{account.code}</span>
            <span className="ml-2 font-semibold text-emerald-800">{account.name}</span>
            <span className="ml-2 text-xs text-emerald-500 uppercase">{account.type?.category}</span>
          </div>
          {glData?.openingBalance !== undefined && (
            <div className="ml-auto flex flex-wrap gap-4 text-xs">
              <span className="text-slate-500">Opening: <b className="text-emerald-700">{fmt(glData.openingBalance ?? 0)}</b></span>
              <span className="text-slate-500">Closing: <b className="text-emerald-700">{fmt(glData.closingBalance ?? 0)}</b></span>
              <span className="text-slate-500">Debits: <b className="text-emerald-700">{fmt(glData.totalDebits ?? 0)}</b></span>
              <span className="text-slate-500">Credits: <b className="text-emerald-700">{fmt(glData.totalCredits ?? 0)}</b></span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} title="Dismiss" aria-label="Dismiss error" className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mx-auto" />
            <p className="text-xs text-slate-400 mt-2">Loading entries…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {([
                    { field: 'date'        as SortField, label: 'Date',        align: 'left',  cls: '' },
                    { field: 'entryNumber' as SortField, label: 'Entry #',     align: 'left',  cls: '' },
                    { field: 'sourceType'  as SortField, label: 'Type',        align: 'left',  cls: '' },
                    { field: 'accountName' as SortField, label: 'Account',     align: 'left',  cls: 'hidden lg:table-cell' },
                    { field: null,                       label: 'Description', align: 'left',  cls: 'hidden md:table-cell' },
                    { field: 'debit'       as SortField, label: 'Debit',       align: 'right', cls: '' },
                    { field: 'credit'      as SortField, label: 'Credit',      align: 'right', cls: '' },
                  ] as { field: SortField | null; label: string; align: string; cls: string }[]).map(col => (
                    <th
                      key={col.label}
                      className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.cls} ${col.field ? 'cursor-pointer select-none hover:text-slate-800 hover:bg-slate-100 transition-colors' : ''}`}
                      onClick={col.field ? () => handleSort(col.field!) : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.field && (
                          sortField === col.field
                            ? sortDir === 'asc' ? <ArrowUp size={11} className="text-emerald-600" /> : <ArrowDown size={11} className="text-emerald-600" />
                            : <ArrowUpDown size={11} className="text-slate-300" />
                        )}
                      </span>
                    </th>
                  ))}
                  {showRunningBalance && (
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Balance</th>
                  )}
                  <th className="w-10 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={showRunningBalance ? 9 : 8} className="px-4 py-14 text-center">
                      <Activity size={32} className="text-slate-200 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-400">No transactions found</p>
                      <p className="text-xs text-slate-300 mt-1">Adjust the filters or date range to see results</p>
                    </td>
                  </tr>
                ) : (
                  sortedEntries.map((e, i) => {
                    const badge = SOURCE_BADGE[e.sourceType] ?? SOURCE_BADGE.ALL
                    const sourceRoute = getSourceRoute(e.sourceType, e.sourceId)
                    return (
                      <tr
                        key={e.id ?? i}
                        className={`border-t border-slate-100 transition-colors ${sourceRoute ? 'cursor-pointer hover:bg-emerald-50/40' : 'hover:bg-slate-50/50'}`}
                        onClick={() => sourceRoute && router.push(sourceRoute)}
                        title={sourceRoute ? `View source: ${badge.label}` : undefined}
                      >
                        <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap text-xs">{fmtDate(e.date)}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {e.entryNumber ?? '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 hidden lg:table-cell">
                          <span className="font-mono text-xs text-slate-400">{e.accountCode}</span>
                          <span className="ml-1.5 text-emerald-700 text-xs">{e.accountName}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs max-w-[240px] hidden md:table-cell">
                          <span className="truncate block">{e.entryDescription ?? e.description ?? '—'}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-800">
                          {e.debit ? fmt(e.debit) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-800">
                          {e.credit ? fmt(e.credit) : <span className="text-slate-300">—</span>}
                        </td>
                        {showRunningBalance && (
                          <td className="px-4 py-2.5 text-right tabular-nums font-bold text-emerald-900">
                            {e.runningBalance !== undefined ? fmt(e.runningBalance) : '—'}
                          </td>
                        )}
                        <td className="px-2 py-2.5 text-slate-300">
                          {sourceRoute && <ExternalLink size={12} className="hover:text-emerald-600" />}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              {entries.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan={showRunningBalance ? 5 : 4} className="hidden lg:table-cell" />
                    <td colSpan={showRunningBalance ? 5 : 4} className="table-cell lg:hidden" />
                    <td className="px-4 py-2.5 text-right text-xs font-bold text-slate-600 hidden lg:table-cell">Totals</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold text-emerald-800">{fmt(totalDebits)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold text-blue-800">{fmt(totalCredits)}</td>
                    {showRunningBalance && <td />}
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="text-xs text-slate-400">
            Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, pagination.total)} of {pagination.total} entries
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <span className="px-3 py-1.5 text-xs text-slate-500">Page {page} of {pagination.totalPages}</span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
