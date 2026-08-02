'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { payrollService } from '@/services/payroll.service'
import { Banknote, RefreshCw } from 'lucide-react'

const LOAN_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE:    { label: 'Active',    color: 'bg-emerald-50 text-emerald-700' },
  CLOSED:    { label: 'Closed',    color: 'bg-slate-100 text-slate-600' },
  DEFAULTED: { label: 'Defaulted', color: 'bg-rose-50 text-rose-700' },
}

export default function LoansPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    try {
      setLoading(true)
      setError('')
      const res = await payrollService.listLoans(companyId)
      setData(Array.isArray(res.data) ? res.data : [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load loans')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])

  if (companyLoading || loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Banknote className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Loans</h2>
        </div>
        <button
          type="button"
          onClick={() => fetchData()}
          disabled={loading}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Employee</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Loan #</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Principal</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Interest Rate</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Balance</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Last Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No loans found</td>
              </tr>
            ) : (
              data.map((item) => {
                const statusInfo = LOAN_STATUS_LABELS[item.status]
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.loanNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(Number(item.principalAmount), currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.interestRate != null ? `${Number(item.interestRate)}%` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(Number(item.balance), currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {statusInfo?.label || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.payments?.[0]?.paymentDate ? format(new Date(item.payments[0].paymentDate), 'MMM d, yyyy') : '—'}</td>
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
