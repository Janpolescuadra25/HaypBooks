'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle, X, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

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

const SOURCE_TABS: { key: SourceType; label: string }[] = [
  { key: 'ALL', label: 'All Entries' },
  { key: 'MANUAL_JOURNAL', label: 'Manual Journals' },
  { key: 'INVOICE', label: 'Invoices' },
  { key: 'BILL', label: 'Bills' },
  { key: 'PAYMENT', label: 'Payments' },
  { key: 'BILL_PAYMENT', label: 'Bill Payments' },
  { key: 'BANK_DEPOSIT', label: 'Bank Deposits' },
  { key: 'REFUND', label: 'Refunds' },
]

const SOURCE_BADGE: Record<SourceType, { label: string; cls: string }> = {
  ALL:            { label: 'All',          cls: 'bg-slate-100 text-slate-600' },
  MANUAL_JOURNAL: { label: 'Manual JE',    cls: 'bg-violet-100 text-violet-700' },
  INVOICE:        { label: 'Invoice',      cls: 'bg-emerald-100 text-emerald-700' },
  BILL:           { label: 'Bill',         cls: 'bg-amber-100 text-amber-700' },
  PAYMENT:        { label: 'Payment',      cls: 'bg-blue-100 text-blue-700' },
  BILL_PAYMENT:   { label: 'Bill Payment', cls: 'bg-orange-100 text-orange-700' },
  BANK_DEPOSIT:   { label: 'Bank Deposit', cls: 'bg-teal-100 text-teal-700' },
  REFUND:         { label: 'Refund',       cls: 'bg-rose-100 text-rose-700' },
}

export default function GeneralLedgerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountId, setAccountId] = useState(() => searchParams?.get('accountId') ?? '')
  const [accountFilterLabel, setAccountFilterLabel] = useState(() => {
    const name = searchParams?.get('accountName')
    const code = searchParams?.get('accountCode')
    return name ? `${code ? code + ' — ' : ''}${name}` : ''
  })
  const [sourceType, setSourceType] = useState<SourceType>('ALL')
  const [glData, setGlData] = useState<GlResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 3)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])

  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
  }

  // fetch accounts for dropdown
  useEffect(() => {
    if (!companyId) return
    apiClient.get(`/companies/${companyId}/accounting/accounts`)
      .then(({ data }) => {
        const accts = Array.isArray(data) ? data : data.accounts ?? []
        setAccounts(accts)
      })
      .catch(() => {})
  }, [companyId])

  // fetch GL entries
  const fetchEntries = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const params: Record<string, any> = { from, to, page, limit: 50 }
      if (accountId) params.accountId = accountId
      if (sourceType !== 'ALL') params.sourceType = sourceType
      const { data } = await apiClient.get(`/companies/${companyId}/general-ledger`, { params })
      setGlData(data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load general ledger')
    } finally {
      setLoading(false)
    }
  }, [companyId, from, to, page, accountId, sourceType])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  // reset page when filters change
  useEffect(() => { setPage(1) }, [from, to, accountId, sourceType])

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
  const showRunningBalance = !!accountId && entries.some(e => e.runningBalance !== undefined)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">General Ledger</h1>
          {accountFilterLabel ? (
            <p className="text-sm text-emerald-700 mt-0.5 flex items-center gap-2">
              Transactions for <span className="font-semibold">{accountFilterLabel}</span>
              <button
                onClick={() => { setAccountId(''); setAccountFilterLabel('') }}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Clear filter
              </button>
            </p>
          ) : (
            <p className="text-sm text-emerald-600/70 mt-0.5">Full double-entry transaction log</p>
          )}
        </div>
        <button
          onClick={() => router.push('/accounting/core-accounting/journal-entries/new')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <PlusCircle size={16} /> New Entry
        </button>
      </div>

      {/* Source-Type Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
        {SOURCE_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSourceType(tab.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              sourceType === tab.key
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-emerald-700 mb-1">Account (optional)</label>
          <select
            value={accountId}
            onChange={e => { setAccountId(e.target.value); setAccountFilterLabel('') }}
            className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">All Accounts</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-emerald-700 mb-1">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <div>
          <label className="block text-xs font-medium text-emerald-700 mb-1">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
      </div>

      {/* Account summary bar (only when filtering to 1 account) */}
      {account && (
        <div className="bg-emerald-50/60 rounded-lg p-3 flex flex-wrap gap-4 items-center text-sm">
          <div>
            <span className="font-mono text-emerald-600">{account.code}</span>
            <span className="ml-2 font-semibold text-emerald-800">{account.name}</span>
            <span className="ml-2 text-xs text-emerald-500 uppercase">{account.type?.category}</span>
          </div>
          {glData?.openingBalance !== undefined && (
            <div className="ml-auto flex gap-6 text-xs">
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
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-emerald-600 mx-auto" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <th className="text-left px-4 py-3 font-medium text-emerald-700">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-emerald-700">Entry #</th>
                  <th className="text-left px-4 py-3 font-medium text-emerald-700">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden lg:table-cell">Account</th>
                  <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden md:table-cell">Description</th>
                  <th className="text-right px-4 py-3 font-medium text-emerald-700">Debit</th>
                  <th className="text-right px-4 py-3 font-medium text-emerald-700">Credit</th>
                  {showRunningBalance && (
                    <th className="text-right px-4 py-3 font-medium text-emerald-700">Balance</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={showRunningBalance ? 8 : 7} className="px-4 py-12 text-center text-emerald-400">
                      No entries found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  entries.map((e, i) => {
                    const badge = SOURCE_BADGE[e.sourceType] ?? SOURCE_BADGE.ALL
                    return (
                      <tr key={e.id ?? i} className="border-t border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                        <td className="px-4 py-2.5 text-emerald-800 whitespace-nowrap">{fmtDate(e.date)}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-emerald-600 whitespace-nowrap">
                          {e.entryNumber ?? '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 hidden lg:table-cell">
                          <span className="font-mono text-xs text-slate-500">{e.accountCode}</span>
                          <span className="ml-1.5 text-emerald-700 text-xs">{e.accountName}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs truncate max-w-[200px] hidden md:table-cell">
                          {e.entryDescription ?? e.description ?? '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-800">
                          {e.debit ? fmt(e.debit) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-800">
                          {e.credit ? fmt(e.credit) : '—'}
                        </td>
                        {showRunningBalance && (
                          <td className="px-4 py-2.5 text-right tabular-nums font-bold text-emerald-900">
                            {e.runningBalance !== undefined ? fmt(e.runningBalance) : '—'}
                          </td>
                        )}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{pagination.total} entries — page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
