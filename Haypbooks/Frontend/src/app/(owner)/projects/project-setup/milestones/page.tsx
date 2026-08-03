'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { format } from 'date-fns'
import { projectsService } from '@/services/projects.service'
import { Flag, RefreshCw, Search } from 'lucide-react'

const MILESTONE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-50 text-blue-700' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700' },
  APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700' },
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
      const response = await projectsService.listMilestones(companyId, selectedProjectId)
      const normalized = Array.isArray(response.data) ? response.data : (response.data?.data ?? [])
      setData(normalized)
    } catch (err: any) {
      setError(err?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedProjectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData = data.filter((item: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return item.milestoneName?.toLowerCase().includes(q)
  })

  if (companyLoading || loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Milestones</h2>
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
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">Select a project...</option>
          {projects.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

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

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Milestone</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Planned Date</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actual Date</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Completion %</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Budget</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actual Cost</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!selectedProjectId && !loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-slate-400">Select a project to view milestones</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No items found.</td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const statusInfo = MILESTONE_STATUS_LABELS[item.status]
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{item.milestoneName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.plannedDate ? format(new Date(item.plannedDate), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.actualDate ? format(new Date(item.actualDate), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.completionPct != null ? Number(item.completionPct).toFixed(1) + '%' : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.budgetAllocated != null ? formatCurrency(Number(item.budgetAllocated), currency) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.actualCost != null ? formatCurrency(Number(item.actualCost), currency) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {statusInfo?.label || item.status}
                      </span>
                    </td>
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
