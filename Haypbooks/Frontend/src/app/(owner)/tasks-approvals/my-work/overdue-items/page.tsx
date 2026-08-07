'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Clock, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { tasksApprovalsService } from '@/services/tasks-approvals.service'

function formatType(type?: string) {
  if (!type) return '—'
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char: string) => char.toUpperCase())
}

export default function OverdueItemsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const response = await tasksApprovalsService.listTasks(companyId, { overdue: true })
      const taskData = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? []
      setData(taskData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load overdue items')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData = data.filter((item: any) => {
    const query = searchQuery.toLowerCase()
    return (
      !query ||
      item.title?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item.assignedByName?.toLowerCase().includes(query)
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
          <Clock className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Overdue Items</h2>
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

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search overdue items..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TITLE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TYPE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">DUE DATE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">DAYS OVERDUE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ASSIGNED BY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                  {searchQuery
                    ? 'No overdue items match your search.'
                    : 'No overdue items.'}
                </td>
              </tr>
            ) : (
              filteredData.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.title || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{formatType(item.type)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {item.dueDate ? format(new Date(item.dueDate), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className={`px-4 py-3 text-sm ${item.daysOverdue > 7 ? 'text-rose-600 font-medium' : 'text-slate-700'}`}>
                    {item.daysOverdue ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.assignedByName || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
