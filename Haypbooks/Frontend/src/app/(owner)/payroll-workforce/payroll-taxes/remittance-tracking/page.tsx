'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { format } from 'date-fns'
import { payrollService } from '@/services/payroll.service'
import { ClipboardCheck, RefreshCw } from 'lucide-react'

const REMITTANCE_TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'SSS', label: 'SSS' },
  { value: 'PHILHEALTH', label: 'PhilHealth' },
  { value: 'PAGIBIG', label: 'PAGIBIG' },
  { value: 'BIR', label: 'BIR' },
]

const PAYMENT_STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
]

const REMITTANCE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  SSS: { label: 'SSS', color: 'bg-blue-100 text-blue-700' },
  PHILHEALTH: { label: 'PhilHealth', color: 'bg-emerald-100 text-emerald-700' },
  PAGIBIG: { label: 'PAGIBIG', color: 'bg-purple-100 text-purple-700' },
  BIR: { label: 'BIR', color: 'bg-amber-100 text-amber-700' },
}

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
}

export default function RemittanceTrackingPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    try {
      setLoading(true)
      setError('')
      const res = await payrollService.listGovernmentContributions(
        companyId,
        typeFilter ? { remittanceType: typeFilter } : undefined,
      )
      setData(Array.isArray(res.data) ? res.data : [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load remittance tracking')
    } finally {
      setLoading(false)
    }
  }, [companyId, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredData = statusFilter
    ? data.filter((item: any) => statusFilter === 'paid' ? item.paidAt != null : item.paidAt == null)
    : data

  if (companyLoading || loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Remittance Tracking</h2>
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

      <div className="flex flex-wrap gap-2">
        {REMITTANCE_TYPE_FILTERS.map((filter) => {
          const active = typeFilter === filter.value
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setTypeFilter(filter.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {PAYMENT_STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.value
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Type</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Period</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Employee Share</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Employer Share</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Total Amount</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Penalty</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Payment Status</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Paid Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No remittance tracking found.</td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const typeInfo = REMITTANCE_TYPE_LABELS[item.remittanceType]
                const paymentStatus = item.paidAt ? 'paid' : 'pending'
                const statusInfo = PAYMENT_STATUS_LABELS[paymentStatus]
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${typeInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {typeInfo?.label || item.remittanceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.period}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(Number(item.employeeShare), currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(Number(item.employerShare), currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(Number(item.totalAmount), currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{Number(item.penaltyAmount) > 0 ? formatCurrency(Number(item.penaltyAmount), currency) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {statusInfo?.label || paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.paidAt ? format(new Date(item.paidAt), 'MMM d, yyyy') : '—'}</td>
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
