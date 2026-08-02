'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { format } from 'date-fns'
import { payrollService } from '@/services/payroll.service'
import { CalendarDays, RefreshCw } from 'lucide-react'

const TIME_OFF_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  VACATION: { label: 'Vacation', color: 'bg-blue-100 text-blue-700' },
  SICK: { label: 'Sick', color: 'bg-amber-100 text-amber-700' },
  UNPAID: { label: 'Unpaid', color: 'bg-slate-100 text-slate-600' },
  OTHER: { label: 'Other', color: 'bg-purple-100 text-purple-700' },
}

export default function LeaveBalancesPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    try {
      setLoading(true)
      setError('')
      const res = await payrollService.listLeaveBalances(companyId)
      setData(Array.isArray(res.data) ? res.data : [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load leave balances')
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Leave Balances</h2>
        </div>
        <button
          type="button"
          onClick={() => fetchData()}
          disabled={loading}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Leave Type</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Balance</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Accrual Rate</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No leave balances found.</td>
              </tr>
            ) : (
              data.map((item) => {
                const typeInfo = TIME_OFF_TYPE_LABELS[item.timeOffType]
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${typeInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {typeInfo?.label || item.timeOffType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{Number(item.balance).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.accrualRate != null ? Number(item.accrualRate).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{format(new Date(item.updatedAt), 'MMM d, yyyy')}</td>
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
