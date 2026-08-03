'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Clock, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { timeService } from '@/services/time.service'

export default function Page() {
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
      const response = await timeService.listTimeEntries(companyId)
      const normalized = Array.isArray(response.data) ? response.data : (response.data?.data ?? [])
      setData(normalized)
    } catch (err: any) {
      setError(err?.message || 'Failed to load time entries')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData = data.filter((item: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      item.user?.name?.toLowerCase().includes(q) ||
      item.project?.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
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
          <Clock className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Time Entries</h2>
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

      <div className="relative md:ml-auto max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search time entries..."
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
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Project</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Hours</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No time entries found</td>
              </tr>
            ) : (
              filteredData.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{item.user?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.project?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.date ? format(new Date(item.date), 'MMM d, yyyy') : '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.hours != null ? Number(item.hours).toFixed(2) : '0.00'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.description ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
