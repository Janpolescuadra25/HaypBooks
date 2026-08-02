'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, PackageOpen, Download } from 'lucide-react'
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

export default function ItemReceiptsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTransactions = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await inventoryService.listTransactions(companyId, { type: 'RECEIPT', limit: 999 })
      setTransactions(Array.isArray(data) ? data : (data?.data ?? []))
    } catch (err: any) {
      setError(err?.message || 'Failed to load item receipts')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchTransactions()
  }, [companyId, companyLoading, fetchTransactions])

  const filteredTransactions = useMemo(() => transactions, [transactions])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Item Receipts</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track incoming inventory receipts</p>
        </div>
        <button
          type="button"
          onClick={fetchTransactions}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Download className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !filteredTransactions.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <PackageOpen className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No item receipts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Transaction #</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Reference</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Lines</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const totalValue = tx.lines?.reduce((sum: number, l: any) => sum + (Number(l.qty || 0) * Number(l.unitCost || 0)), 0) ?? 0
                  return (
                    <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 text-slate-700">{tx.transactionNumber ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${TYPE_STYLES[tx.type] ?? 'bg-slate-100 text-slate-600'}`}>
                          {tx.type ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{tx.reference ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-700">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${POSTING_STYLES[tx.postingStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                          {tx.postingStatus ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{tx.lines?.length ?? 0}</td>
                      <td className="px-5 py-3 text-slate-900">{formatCurrency(totalValue, currency)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
