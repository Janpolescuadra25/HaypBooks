'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
  Search,
} from 'lucide-react'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'
import { useCompanyId } from '@/hooks/useCompanyId'

type ActionFilter = 'ALL' | 'CREATE' | 'UPDATE' | 'DELETE'

const ACTION_FILTERS: Array<{ key: ActionFilter; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'CREATE', label: 'Created' },
  { key: 'UPDATE', label: 'Updated' },
  { key: 'DELETE', label: 'Deleted' },
]

interface ModuleActivityPageProps {
  title: string
  subtitle: string
  backHref: string
  entityType?: string
  tableName?: string
  pageSize?: number
  emptyMessage?: string
  searchPlaceholder?: string
}

function normalizeAction(action?: string | null): string {
  return String(action ?? '').trim().toUpperCase()
}

function stringifySearchValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return ''
  }
}

export default function ModuleActivityPage({
  title,
  subtitle,
  backHref,
  entityType,
  tableName,
  pageSize = 30,
  emptyMessage = 'No activity recorded yet for this module.',
  searchPlaceholder = 'Search by user, action, or changed fields',
}: ModuleActivityPageProps) {
  const router = useRouter()
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()

  const [actionFilter, setActionFilter] = useState<ActionFilter>('ALL')
  const [search, setSearch] = useState('')

  const {
    entries,
    loading,
    error,
    page,
    hasMore,
    setPage,
    refetch,
  } = useActivityLog({
    companyId,
    pageSize,
    initialFilters: {
      tableName: tableName ?? undefined,
      entityType: entityType ?? undefined,
    },
  })

  const visibleEntries = useMemo(() => {
    const query = search.trim().toLowerCase()
    return entries.filter((entry) => {
      const action = normalizeAction(entry.action)
      if (actionFilter !== 'ALL' && action !== actionFilter) return false
      if (!query) return true

      const actor = `${entry.user?.name ?? ''} ${entry.user?.email ?? ''}`.toLowerCase()
      const fields = entry.changes && typeof entry.changes === 'object'
        ? Object.keys(entry.changes).join(' ').toLowerCase()
        : ''
      const values = entry.changes && typeof entry.changes === 'object'
        ? Object.values(entry.changes).map((value) => stringifySearchValue(value)).join(' ').toLowerCase()
        : ''

      return (
        actor.includes(query) ||
        action.replace(/_/g, ' ').toLowerCase().includes(query) ||
        String(entry.recordId ?? '').toLowerCase().includes(query) ||
        fields.includes(query) ||
        values.includes(query)
      )
    })
  }, [entries, actionFilter, search])

  if (companyLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[320px] text-slate-500">
        <RefreshCw size={16} className="mr-2 animate-spin" /> Loading activity log...
      </div>
    )
  }

  if (companyError) {
    return <div className="p-6 text-red-600">{companyError}</div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <button
        onClick={() => router.push(backHref)}
        className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-emerald-900">
            <Clock3 size={22} className="text-emerald-600" /> {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
            />
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
            {ACTION_FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => {
                  setActionFilter(filter.key)
                  setPage(1)
                }}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  actionFilter === filter.key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 text-right text-xs text-slate-500">
          Showing {visibleEntries.length} entries on page {page}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <ActivityLog
        entries={visibleEntries}
        loading={loading}
        emptyMessage={emptyMessage}
        onEntryNavigate={(entry) => {
          if (!entry.recordId) return
          const target = `${backHref}?recordId=${encodeURIComponent(entry.recordId)}`
          router.push(target)
        }}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Page {page}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!hasMore || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
