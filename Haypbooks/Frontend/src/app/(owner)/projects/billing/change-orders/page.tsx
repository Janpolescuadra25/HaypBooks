'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { format } from 'date-fns'
import { projectsService } from '@/services/projects.service'
import { FileEdit, RefreshCw, Search } from 'lucide-react'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'VOID', label: 'Void' },
]

const CHANGE_ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-50 text-blue-700' },
  APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-50 text-rose-700' },
  VOID: { label: 'Void', color: 'bg-slate-100 text-slate-600' },
}

export default function Page() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const response = await projectsService.listChangeOrders(companyId)
      const result = Array.isArray(response.data) ? response.data : (response.data?.data ?? [])
      setData(result)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (companyLoading || loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
    </div>
  )

  const filteredData = data.filter((item) => {
    const matchesSearch = !searchQuery ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.changeOrderNo?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileEdit className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Change Orders</h2>
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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter.value
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.label}
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
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">CO #</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Project</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Description</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Amount</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Approved</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No items found.</td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const statusInfo = CHANGE_ORDER_STATUS_LABELS[item.status]
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{item.changeOrderNo}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.project?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(Number(item.amount), currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.approvedAmount != null ? formatCurrency(Number(item.approvedAmount), currency) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {statusInfo?.label || item.status}
                      </span>
                    </td>
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
