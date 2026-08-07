'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { FileText, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { tasksApprovalsService } from '@/services/tasks-approvals.service'

const TEMPLATE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-emerald-50 text-emerald-600' },
  inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-600' },
}

const TEMPLATE_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function templateIsActive(item: any) {
  if (typeof item.isActive === 'boolean') return item.isActive
  if (typeof item.status === 'string') return item.status === 'active'
  return false
}

function templateIsInactive(item: any) {
  if (typeof item.isActive === 'boolean') return !item.isActive
  if (typeof item.status === 'string') return item.status === 'inactive'
  return false
}

export default function TaskTemplatesPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [templateFilter, setTemplateFilter] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const response = await tasksApprovalsService.listTaskTemplates(companyId)
      const templateData = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? []
      setData(templateData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load task templates')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData = data.filter((item: any) => {
    if (templateFilter === 'active' && !templateIsActive(item)) return false
    if (templateFilter === 'inactive' && !templateIsInactive(item)) return false

    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    )
  })

  if (loading || companyLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Task Templates</h2>
        </div>
        <button
          type="button"
          title="Refresh"
          onClick={() => fetchData()}
          disabled={loading}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TEMPLATE_STATUS_OPTIONS.map((option) => {
          const active = templateFilter === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTemplateFilter(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search task templates..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">NAME</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">DESCRIPTION</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">CREATED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-500">
                  {searchQuery || templateFilter
                    ? 'No templates match your filters.'
                    : 'No task templates found.'}
                </td>
              </tr>
            ) : (
              filteredData.map((item: any) => {
                const isActive = templateIsActive(item)
                const statusKey = isActive ? 'active' : 'inactive'

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{item.description || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${TEMPLATE_STATUS_LABELS[statusKey].color}`}>
                        {TEMPLATE_STATUS_LABELS[statusKey].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : '—'}
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
