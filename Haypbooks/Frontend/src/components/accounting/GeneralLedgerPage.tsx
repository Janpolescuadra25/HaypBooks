'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Loader2, AlertCircle, X, Calendar, Search, Filter } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface LedgerEntry {
  id: string
  date: string
  entryNumber?: string
  memo?: string
  accountCode?: string
  accountName?: string
  debit: number
  credit: number
  balance: number
}

interface Account {
  id: string
  code: string
  name: string
  type: string
}

export default function GeneralLedgerPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  // fetch accounts list
  useEffect(() => {
    if (!companyId) return
    apiClient.get(`/companies/${companyId}/accounting/accounts`)
      .then(({ data }) => {
        const accts = Array.isArray(data) ? data : data.accounts ?? []
        setAccounts(accts)
        if (accts.length > 0 && !selectedAccountId) setSelectedAccountId(accts[0].id)
      })
      .catch(() => {})
  }, [companyId])

  // fetch ledger for selected account
  const fetchLedger = useCallback(async () => {
    if (!companyId || !selectedAccountId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/accounting/accounts/${selectedAccountId}/ledger`, {
        params: { from, to },
      })
      setEntries(Array.isArray(data) ? data : data.entries ?? data.ledger ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load ledger')
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedAccountId, from, to])

  useEffect(() => { fetchLedger() }, [fetchLedger])

  if (cidLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading…</span>
      </div>
    )
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  const selectedAccount = accounts.find(a => a.id === selectedAccountId)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900">General Ledger</h1>
        <p className="text-sm text-emerald-600/70 mt-0.5">View transaction details by account</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-emerald-700 mb-1">Account</label>
          <select
            value={selectedAccountId}
            onChange={e => setSelectedAccountId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Select Account…</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {selectedAccount && (
        <div className="bg-emerald-50/50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="font-mono text-sm text-emerald-600">{selectedAccount.code}</span>
            <span className="ml-2 font-semibold text-emerald-800">{selectedAccount.name}</span>
            <span className="ml-2 text-xs text-emerald-500 uppercase">{selectedAccount.type}</span>
          </div>
          <span className="text-sm text-emerald-700">{entries.length} entries</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-emerald-600 mx-auto" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-50/50 border-b border-emerald-100">
                <th className="text-left px-4 py-3 font-medium text-emerald-700">Date</th>
                <th className="text-left px-4 py-3 font-medium text-emerald-700">Entry #</th>
                <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden md:table-cell">Memo</th>
                <th className="text-right px-4 py-3 font-medium text-emerald-700">Debit</th>
                <th className="text-right px-4 py-3 font-medium text-emerald-700">Credit</th>
                <th className="text-right px-4 py-3 font-medium text-emerald-700">Balance</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-emerald-400">No ledger entries for this period.</td></tr>
              ) : (
                entries.map((e, i) => (
                  <tr key={e.id ?? i} className="border-t border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                    <td className="px-4 py-2.5 text-emerald-800">{fmtDate(e.date)}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-emerald-600">{e.entryNumber ?? '—'}</td>
                    <td className="px-4 py-2.5 text-emerald-600/60 truncate max-w-[200px] hidden md:table-cell">{e.memo ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-800">{e.debit ? fmt(e.debit) : '—'}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-800">{e.credit ? fmt(e.credit) : '—'}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold text-emerald-900">{fmt(e.balance ?? 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
