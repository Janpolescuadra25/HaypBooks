'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { RefreshCw, Search, ArrowLeftRight } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { inventoryService } from '@/services/inventory.service'
import { formatCurrency } from '@/lib/format'

const TYPE_STYLES: Record<string, string> = {
  RECEIPT: 'bg-emerald-50 text-emerald-700',
  SHIPMENT: 'bg-blue-50 text-blue-700',
  TRANSFER: 'bg-amber-50 text-amber-700',
  ADJUSTMENT: 'bg-rose-50 text-rose-700',
}

const POSTING_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  REVIEWED: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-blue-50 text-blue-700',
  POSTED: 'bg-emerald-50 text-emerald-700',
  VOIDED: 'bg-rose-50 text-rose-700',
}

const TYPE_OPTIONS = ['ALL', 'RECEIPT', 'SHIPMENT', 'TRANSFER', 'ADJUSTMENT'] as const

export default function StockMovementsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [activeType, setActiveType] = useState('ALL')

  const fetchTransactions = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await inventoryService.listTransactions(companyId, { limit: 999 })
      setTransactions(Array.isArray(data) ? data : (data?.data ?? []))
    } catch (err: any) {
      setError(err?.message || 'Failed to load stock movements')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchTransactions()
  }, [companyId, companyLoading, fetchTransactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = !searchValue ||
        tx.transactionNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
        tx.reference?.toLowerCase().includes(searchValue.toLowerCase())
      const matchesType = activeType === 'ALL' || tx.type === activeType
      return matchesSearch && matchesType
    })
  }, [transactions, searchValue, activeType])

  if (companyLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Stock Movements</h2>
        </div>
        <button
          type="button"
          onClick={fetchTransactions}
          disabled={loading}
          title="Refresh"
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by transaction # or reference..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((type) => {
            const active = activeType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {type}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Transaction #</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Type</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Reference</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Date</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Lines</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No stock movements found.</td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const totalValue = tx.lines?.reduce((sum: number, l: any) => sum + (Number(l.qty || 0) * Number(l.unitCost || 0)), 0) ?? 0
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-700">{tx.transactionNumber ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${TYPE_STYLES[tx.type] ?? 'bg-slate-100 text-slate-600'}`}>
                        {tx.type ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{tx.reference ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{format(new Date(tx.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${POSTING_STYLES[tx.postingStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                        {tx.postingStatus ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{tx.lines?.length ?? 0}</td>
                    <td className="px-4 py-3 text-slate-900">{formatCurrency(totalValue, currency)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
