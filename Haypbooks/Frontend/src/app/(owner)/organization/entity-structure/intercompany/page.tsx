'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { organizationService } from '@/services/organization.service'
import { Repeat, RefreshCw } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  POSTED: 'bg-emerald-50 text-emerald-700',
  VOID: 'bg-rose-50 text-rose-700',
}

export default function Page() {
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTransactions = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const res = await organizationService.listIntercompanyTransactions(companyId)
      setTransactions(Array.isArray(res.data) ? res.data : (res.data?.data ?? []))
    } catch (err: any) {
      setError(err?.message || 'Failed to load intercompany transactions')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Organization</p>
          <h1 className="text-3xl font-semibold text-slate-900">Intercompany</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Review intercompany transactions between companies in the same workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchTransactions}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {(companyError || error) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {companyError || error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Description</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">From</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">To</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Date</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Amount</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    No intercompany transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-slate-700">{transaction.description ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-700">{transaction.fromCompany?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-700">{transaction.toCompany?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-700">{transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-4 text-slate-700">{formatCurrency(Number(transaction.amount || 0), transaction.currency || currency)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLOR[transaction.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {transaction.status ? `${transaction.status.charAt(0).toUpperCase()}${transaction.status.slice(1).toLowerCase()}` : '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
