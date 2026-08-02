'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { payrollService } from '@/services/payroll.service'
import { Receipt, RefreshCw } from 'lucide-react'

const DEDUCTION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  SSS_EMPLOYEE:         { label: 'SSS (Employee)',       color: 'bg-blue-50 text-blue-700' },
  SSS_EMPLOYER:         { label: 'SSS (Employer)',       color: 'bg-blue-50 text-blue-700' },
  PHILHEALTH_EMPLOYEE:  { label: 'PhilHealth (Employee)', color: 'bg-teal-50 text-teal-700' },
  PHILHEALTH_EMPLOYER:  { label: 'PhilHealth (Employer)', color: 'bg-teal-50 text-teal-700' },
  PAGIBIG_EMPLOYEE:     { label: 'PAG-IBIG (Employee)',  color: 'bg-violet-50 text-violet-700' },
  PAGIBIG_EMPLOYER:     { label: 'PAG-IBIG (Employer)',  color: 'bg-violet-50 text-violet-700' },
  WITHHOLDING_TAX:      { label: 'Withholding Tax',      color: 'bg-amber-50 text-amber-700' },
  THIRTEENTH_MONTH:     { label: '13th Month',           color: 'bg-rose-50 text-rose-700' },
}

export default function DeductionsPage() {
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
      const res = await payrollService.listDeductions(companyId)
      setData(Array.isArray(res.data) ? res.data : [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load deductions')
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
          <Receipt className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Deductions</h2>
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
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Deduction Type</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Period</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Employee Share</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Employer Share</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">No deductions found</td>
              </tr>
            ) : (
              data.map((item) => {
                const typeInfo = DEDUCTION_TYPE_LABELS[item.deductionType]
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${typeInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {typeInfo?.label || item.deductionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{format(new Date(`${item.period}-01`), 'MMM yyyy')}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(Number(item.employeeShare), currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.employerShare != null ? formatCurrency(Number(item.employerShare), currency) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{format(new Date(item.createdAt), 'MMM d, yyyy')}</td>
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
