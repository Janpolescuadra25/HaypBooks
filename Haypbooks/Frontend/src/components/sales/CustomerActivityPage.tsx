'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Clock, Plus, Pencil, Trash2, AlertCircle,
  Loader2, ChevronLeft, ChevronRight, Search, X,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { formatActivityValue } from '@/components/ui/ActivityLog'

interface ActivityEntry {
  id: string
  action: string
  recordId: string | null
  changes: Record<string, any> | null
  createdAt: string
  user: { id: string; name: string | null; email: string } | null
}

type ActionFilter = 'ALL' | 'CREATE' | 'UPDATE' | 'DELETE'

const PAGE_SIZES = [10, 20, 50]

const ACTION_FILTERS: { key: ActionFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'CREATE', label: 'Created' },
  { key: 'UPDATE', label: 'Updated' },
  { key: 'DELETE', label: 'Deleted' },
]

function fmt(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getCustomerName(entry: ActivityEntry): string {
  if (!entry.changes) return 'Customer'
  const c = entry.changes as Record<string, any>
  return c.name ?? c.displayName ?? 'Customer'
}

export default function CustomerActivityPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()

  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionFilter, setActionFilter] = useState<ActionFilter>('ALL')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const fetchActivity = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const params: Record<string, any> = { take: pageSize, skip: (page - 1) * pageSize }
      if (actionFilter !== 'ALL') params.action = actionFilter
      if (search) params.search = search
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers/activity`, { params })
      setActivity(Array.isArray(data.data) ? data.data : [])
      setTotal(data.total ?? 0)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }, [companyId, page, pageSize, actionFilter, search])

  useEffect(() => { fetchActivity() }, [fetchActivity])

  const handleSearch = () => { setSearch(searchInput); setPage(1) }
  const clearSearch = () => { setSearchInput(''); setSearch(''); setPage(1) }
  const handleActionFilter = (f: ActionFilter) => { setActionFilter(f); setPage(1) }
  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalPages = Math.ceil(total / pageSize)
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  if (cidLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }
  if (cidError) return <div className="p-6 text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Back nav */}
      <button
        onClick={() => router.push('/sales/customers')}
        className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-800 transition-colors"
        title="Back to Customers"
      >
        <ArrowLeft size={15} /> Back to Customers
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
          <Clock size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Customer Activity Log</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">All customer actions across your workspace</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Action type segmented control */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm shrink-0">
          {ACTION_FILTERS.map((f, i) => (
            <button
              key={f.key}
              onClick={() => handleActionFilter(f.key)}
              className={`px-4 py-2 font-medium transition-colors ${
                i > 0 ? 'border-l border-gray-200' : ''
              } ${
                actionFilter === f.key
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-1 min-w-0 gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by customer name…"
              className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle size={14} className="shrink-0" /> {error}
        </div>
      )}

      {/* Loading: skeleton cards */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-l-4 border-gray-200 border-l-gray-300 p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-56" />
                  <div className="h-3 bg-gray-100 rounded w-40" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-28 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && activity.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          <Clock size={32} className="mb-3 opacity-40" />
          {search || actionFilter !== 'ALL' ? (
            <>
              <p className="text-sm font-medium text-gray-500">No activity matches your filters</p>
              <p className="text-xs mt-1 text-gray-400">Try adjusting your search or action filter</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-500">No customer activity recorded yet</p>
              <p className="text-xs mt-1 text-gray-400">Actions like creating, editing, or deleting customers will appear here</p>
            </>
          )}
        </div>
      )}

      {/* Activity feed */}
      {!loading && activity.length > 0 && (
        <>
          <div className="space-y-3">
            {activity.map(entry => {
              const isCreate = entry.action === 'CREATE'
              const isDelete = entry.action === 'DELETE'
              const borderColor = isCreate
                ? 'border-l-emerald-500'
                : isDelete
                  ? 'border-l-red-400'
                  : 'border-l-blue-400'
              const iconBg = isCreate ? 'bg-emerald-50' : isDelete ? 'bg-red-50' : 'bg-blue-50'
              const actionLabel = isCreate ? 'Created' : isDelete ? 'Deleted' : 'Updated'
              const labelStyle = isCreate
                ? 'bg-emerald-50 text-emerald-700'
                : isDelete
                  ? 'bg-red-50 text-red-600'
                  : 'bg-blue-50 text-blue-700'

              const customerName = getCustomerName(entry)
              const userName = entry.user?.name || entry.user?.email || 'Unknown user'
              const changes = entry.changes && typeof entry.changes === 'object'
                ? entry.changes as Record<string, any>
                : null
              const changeKeys = changes
                ? Object.keys(changes).filter(k => k !== 'name')
                : []
              const hasChanges = changeKeys.length > 0 && !isCreate && !isDelete
              const isExpanded = expanded.has(entry.id)

              return (
                <div
                  key={entry.id}
                  className={`bg-white rounded-xl border border-l-4 border-gray-200 ${borderColor} p-4`}
                >
                  <div className="flex items-start gap-3">
                    {/* Action icon */}
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${iconBg}`}>
                      {isCreate ? (
                        <Plus size={14} className="text-emerald-600" />
                      ) : isDelete ? (
                        <Trash2 size={14} className="text-red-500" />
                      ) : (
                        <Pencil size={14} className="text-blue-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${labelStyle}`}>
                            {actionLabel}
                          </span>
                          {isDelete ? (
                            <span className="text-sm text-gray-400 font-medium">
                              {customerName} <span className="text-xs">(deleted)</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => entry.recordId && router.push(`/sales/customers/${entry.recordId}`)}
                              className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                            >
                              {customerName}
                            </button>
                          )}
                          <span className="text-xs text-gray-400">by {userName}</span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{fmt(entry.createdAt)}</span>
                      </div>

                      {hasChanges && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleExpanded(entry.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {isExpanded ? 'Hide changes' : 'View changes'}
                          </button>
                          {isExpanded && (
                            <div className="mt-2 rounded-lg border border-gray-100 overflow-hidden text-xs">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-3 py-1.5 text-gray-500 font-medium w-32">Field</th>
                                    <th className="text-left px-3 py-1.5 text-gray-500 font-medium">New value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {changeKeys.map(k => (
                                    <tr key={k} className="border-t border-gray-100">
                                      <td className="px-3 py-1.5 text-gray-400 bg-gray-50 font-medium">{k}</td>
                                      <td className="px-3 py-1.5 text-gray-700">
                                        {formatActivityValue(changes![k])}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-3 text-sm text-gray-500 flex-wrap">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                title="Items per page"
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>per page · Showing {from}–{to} of {total}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                title="Previous page"
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="px-3 py-1 text-sm tabular-nums">{page} / {totalPages || 1}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                title="Next page"
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
