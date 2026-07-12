'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Clock, Plus, Pencil, Trash2, AlertCircle,
  Loader2, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn } from '@/components/shared/HaypDataTable.types'
import { salesService } from '@/services/sales.service'
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

interface ActivityRow extends ActivityEntry {
  customerName: string
  userName: string
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

  const [activity, setActivity] = useState<ActivityRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionFilter, setActionFilter] = useState<ActionFilter>('ALL')
  const [search, setSearch] = useState('')
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
      const response = await salesService.getArCustomerActivity(companyId, undefined, params)
      const data = response.data
      const raw: any[] = Array.isArray(data.data) ? data.data : []
      setActivity(raw.map((entry) => ({
        ...entry,
        customerName: getCustomerName(entry),
        userName: entry.user?.name || entry.user?.email || 'Unknown user',
      })))
      setTotal(data.total ?? 0)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }, [companyId, page, pageSize, actionFilter, search])

  useEffect(() => { fetchActivity() }, [fetchActivity])

  const handleActionFilter = (f: ActionFilter) => { setActionFilter(f); setPage(1) }
  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const activityColumns = useMemo<HaypColumn<ActivityRow>[]>(() => [
    {
      id: 'action',
      header: 'Action',
      accessorKey: 'action',
      size: 120,
      render: (_value, row) => {
        const isCreate = row.action === 'CREATE'
        const isDelete = row.action === 'DELETE'
        const label = isCreate ? 'Created' : isDelete ? 'Deleted' : 'Updated'
        const className = isCreate
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
          : isDelete
            ? 'bg-red-50 text-red-600 border-red-100'
            : 'bg-blue-50 text-blue-700 border-blue-100'
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-semibold ${className}`}>
            {label}
          </span>
        )
      },
    },
    { id: 'customerName', header: 'Customer', accessorKey: 'customerName', size: 200 },
    { id: 'userName', header: 'User', accessorKey: 'userName', size: 180 },
    {
      id: 'createdAt',
      header: 'Date',
      accessorKey: 'createdAt',
      size: 180,
      render: (_value, row) => fmt(row.createdAt),
    },
    {
      id: 'details',
      header: 'Details',
      accessorKey: 'changes',
      size: 220,
      render: (_value, row) => {
        const changeKeys = row.changes && typeof row.changes === 'object'
          ? Object.keys(row.changes).filter((k) => k !== 'name')
          : []
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{changeKeys.length > 0 ? changeKeys.join(', ') : 'No details'}</span>
            {changeKeys.length > 0 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleExpanded(row.id) }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                {expanded.has(row.id) ? 'Hide' : 'View'}
              </button>
            )}
          </div>
        )
      },
    },
  ], [expanded])

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
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm shrink-0">
          {ACTION_FILTERS.map((f, i) => (
            <button
              key={f.key}
              onClick={() => handleActionFilter(f.key)}
              className={`px-4 py-2 font-medium transition-colors ${
                i > 0 ? 'border-l border-slate-200' : ''
              } ${
                actionFilter === f.key
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
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
            <div key={i} className="bg-white rounded-xl border border-l-4 border-slate-200 border-l-gray-300 p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-56" />
                  <div className="h-3 bg-slate-100 rounded w-40" />
                </div>
                <div className="h-3 bg-slate-100 rounded w-28 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity table */}
      {!loading && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <HaypDataTable
            data={activity}
            columns={activityColumns}
            tableId="customer-activity"
            loading={loading}
            globalFilter={search}
            onGlobalFilterChange={setSearch}
            emptyTitle="No activity found"
            emptySubtitle="Try adjusting your filters or search query"
          />
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm text-slate-500 flex-wrap">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
              title="Items per page"
              className="border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-3 py-1 text-sm tabular-nums">{page} / {totalPages || 1}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              title="Next page"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {expanded.size > 0 && (
        <div className="space-y-3">
          {activity.filter((entry) => expanded.has(entry.id)).map((entry) => {
            const isCreate = entry.action === 'CREATE'
            const isDelete = entry.action === 'DELETE'
            const borderColor = isCreate
              ? 'border-l-emerald-500'
              : isDelete
                ? 'border-l-red-400'
                : 'border-l-blue-400'
            const iconBg = isCreate ? 'bg-emerald-50' : isDelete ? 'bg-red-50' : 'bg-blue-50'
            const changes = entry.changes && typeof entry.changes === 'object'
              ? entry.changes as Record<string, any>
              : null
            const changeKeys = changes ? Object.keys(changes).filter((k) => k !== 'name') : []

            return (
              <div key={entry.id} className={`bg-white rounded-xl border border-l-4 border-slate-200 ${borderColor} p-4`}> 
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${iconBg}`}>
                    {isCreate ? (
                      <Plus size={14} className="text-emerald-600" />
                    ) : isDelete ? (
                      <Trash2 size={14} className="text-red-500" />
                    ) : (
                      <Pencil size={14} className="text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {entry.action}
                        </span>
                        <span className="text-sm font-semibold text-emerald-700">{entry.customerName}</span>
                        <span className="text-xs text-slate-400">by {entry.userName}</span>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">{fmt(entry.createdAt)}</span>
                    </div>
                    {changeKeys.length > 0 && (
                      <div className="mt-4 rounded-lg border border-slate-100 overflow-hidden text-xs">
                        {changeKeys.map((k) => (
                          <div key={k} className="flex items-start gap-3 border-t border-slate-100 first:border-t-0">
                            <div className="w-32 min-w-[8rem] px-3 py-2 text-slate-400 bg-slate-50 font-medium">{k}</div>
                            <div className="flex-1 px-3 py-2 text-slate-700">
                              {formatActivityValue(changes![k])}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

