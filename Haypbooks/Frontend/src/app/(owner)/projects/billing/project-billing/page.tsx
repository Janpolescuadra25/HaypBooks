'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Receipt, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { projectsService } from '@/services/projects.service'

const BILLING_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  PROGRESS: { label: 'Progress', color: 'bg-blue-50 text-blue-700' },
  MILESTONE: { label: 'Milestone', color: 'bg-emerald-50 text-emerald-700' },
  TIME_AND_MATERIAL: { label: 'Time & Material', color: 'bg-amber-50 text-amber-700' },
  FIXED_FEE: { label: 'Fixed Fee', color: 'bg-slate-50 text-slate-600' },
}

const BILLING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700' },
  invoiced: { label: 'Invoiced', color: 'bg-blue-50 text-blue-700' },
  paid: { label: 'Paid', color: 'bg-emerald-50 text-emerald-700' },
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700' },
}

export default function Page() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')

  useEffect(() => {
    if (!companyId) return

    projectsService.listProjects(companyId, { status: 'ACTIVE' })
      .then((res: any) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        setProjects(data)
      })
      .catch((err: any) => setError(err?.message || 'Failed to load projects'))
  }, [companyId])

  const fetchData = useCallback(async () => {
    if (!companyId || !selectedProjectId) return

    setLoading(true)
    setError('')

    try {
      const response = await projectsService.listProjectBilling(companyId, selectedProjectId)
      const normalized = Array.isArray(response.data) ? response.data : (response.data?.data ?? [])
      setData(normalized)
    } catch (err: any) {
      setError(err?.message || 'Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedProjectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData = data.filter((item: any) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.billingType?.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query)
    )
  })

  if (companyLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Project Billing</h2>
        </div>
        <button
          type="button"
          title="Refresh"
          disabled={loading}
          onClick={() => fetchData()}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <select
        value={selectedProjectId}
        onChange={(e) => setSelectedProjectId(e.target.value)}
        className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <option value="">Select a project...</option>
        {projects.map((project: any) => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select>

      <div className="relative md:ml-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search billing records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Notes</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!selectedProjectId ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">Select a project to view billing</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">No billing records found</td>
              </tr>
            ) : (
              filteredData.map((item: any) => {
                const typeInfo = BILLING_TYPE_LABELS[item.billingType]
                const statusInfo = BILLING_STATUS_LABELS[item.status]

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${typeInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {typeInfo?.label || item.billingType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(Number(item.amount), currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{format(new Date(item.billingDate), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {statusInfo?.label || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.notes ?? '—'}</td>
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
