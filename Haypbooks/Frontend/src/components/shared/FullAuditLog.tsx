'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Clock, Filter, Search, RefreshCw, AlertCircle, X,
  Plus, Pencil, CheckCircle, Ban, Trash2, RotateCcw, User, ArrowRight,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AuditLine {
  fieldName: string
  oldValue: string | null
  newValue: string | null
  changeType?: 'CREATE' | 'UPDATE' | 'DELETE'
}

export interface AuditEntry {
  id: string
  action: string
  tableName?: string
  performedBy?: string
  performedAt?: string
  createdAt?: string
  lines?: AuditLine[]
  synthetic?: boolean
  user?: { id: string; name?: string; email: string } | null
}

export interface FullAuditLogProps {
  title: string
  subtitle: string
  backLabel: string
  backHref: string
  companyId: string
  actionOptions: Array<{ key: string; label: string }>
  rangeOptions?: Array<{ key: string; label: string }>
  defaultRange?: string
  onFetchLogs: (params: {
    companyId: string
    actionFilter: string
    dateRange: string
  }) => Promise<AuditEntry[]>
}

const PAGE_SIZE = 25

const DEFAULT_RANGE_OPTIONS = [
  { key: '24h', label: 'Last 24h' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'all', label: 'All time' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatAbsoluteTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Action Badge ───────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: string }) {
  const n = action.toUpperCase()
  if (n.includes('CREATE')) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <Plus size={10} /> Created
    </span>
  )
  if (n.includes('UPDATE') || n.includes('EDIT')) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
      <Pencil size={10} /> Updated
    </span>
  )
  if (n === 'POSTED' || n.includes('POST')) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 border border-teal-200">
      <CheckCircle size={10} /> Posted
    </span>
  )
  if (n === 'VOIDED' || n.includes('VOID')) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
      <Ban size={10} /> Voided
    </span>
  )
  if (n.includes('DELETE') || n.includes('DEACTIVATE')) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
      <Trash2 size={10} /> {n.includes('DEACTIVATE') ? 'Deactivated' : 'Deleted'}
    </span>
  )
  if (n.includes('REACTIVATE') || n.includes('REVERS') || n.includes('UNDO')) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
      <RotateCcw size={10} /> {n.includes('REACTIVATE') ? 'Reactivated' : 'Reversed'}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
      {action}
    </span>
  )
}

// ─── Event Card ─────────────────────────────────────────────────────────────────

function EventCard({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false)
  const iso = entry.performedAt ?? entry.createdAt ?? ''
  const performer = entry.performedBy ?? entry.user?.name ?? entry.user?.email ?? 'System'
  const hasLines = Array.isArray(entry.lines) && entry.lines.length > 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <ActionBadge action={entry.action} />
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <User size={12} className="shrink-0" />
              {performer}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {iso && (
              <time className="text-xs text-gray-400 whitespace-nowrap" title={formatAbsoluteTime(iso)}>
                <span className="font-medium text-gray-500">{formatRelativeTime(iso)}</span>
                <span className="mx-1 text-gray-300">·</span>
                {formatAbsoluteTime(iso)}
              </time>
            )}
            {hasLines && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="px-2.5 py-1 text-xs font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors border border-purple-100"
              >
                {expanded ? 'Hide' : 'Details'} ({entry.lines!.length})
              </button>
            )}
          </div>
        </div>
        {entry.synthetic && (
          <p className="mt-2 text-xs text-gray-400 italic">Auto-generated from record metadata</p>
        )}
      </div>

      {/* Expanded field diffs */}
      {expanded && hasLines && (
        <div className="border-t border-gray-100 px-5 py-3 space-y-2 bg-gray-50/50 rounded-b-xl">
          {entry.lines!.map((line, i) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-white rounded-lg px-3 py-2.5 border border-gray-100 shadow-sm">
              <span className="font-semibold text-gray-700 capitalize min-w-[110px] shrink-0">
                {line.fieldName.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {line.oldValue !== null && (
                <>
                  <span className="line-through text-red-500 truncate max-w-[130px]" title={line.oldValue || ''}>
                    {line.oldValue || '(empty)'}
                  </span>
                  <ArrowRight size={10} className="text-gray-300 shrink-0" />
                </>
              )}
              <span className="text-emerald-700 font-medium truncate max-w-[160px]" title={line.newValue ?? ''}>
                {line.newValue ?? '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function FullAuditLog({
  title,
  subtitle,
  backLabel,
  backHref,
  companyId,
  actionOptions,
  rangeOptions = DEFAULT_RANGE_OPTIONS,
  defaultRange = '30d',
  onFetchLogs,
}: FullAuditLogProps) {
  const router = useRouter()

  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [dateRange, setDateRange] = useState(defaultRange)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchLogs = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const data = await onFetchLogs({ companyId, actionFilter, dateRange })
      setLogs(data)
      setPage(1)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }, [companyId, actionFilter, dateRange, onFetchLogs])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return logs
    const q = search.toLowerCase()
    return logs.filter(l => {
      const performer = l.performedBy ?? l.user?.name ?? l.user?.email ?? ''
      const hasFieldMatch = l.lines?.some(line =>
        line.fieldName.toLowerCase().includes(q) ||
        (line.oldValue ?? '').toLowerCase().includes(q) ||
        (line.newValue ?? '').toLowerCase().includes(q)
      )
      return (
        performer.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        hasFieldMatch
      )
    })
  }, [logs, search])

  // Pagination on flat list
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedEntries = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Group paged entries by date
  const grouped = useMemo(() => {
    const map: Record<string, AuditEntry[]> = {}
    for (const entry of pagedEntries) {
      const iso = entry.performedAt ?? entry.createdAt ?? ''
      const day = iso
        ? new Date(iso).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          })
        : 'Unknown Date'
      if (!map[day]) map[day] = []
      map[day].push(entry)
    }
    return Object.entries(map)
  }, [pagedEntries])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => router.push(backHref)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={15} />
          {backLabel}
        </button>

        <div className="h-5 w-px bg-gray-200" />

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <Clock size={16} className="text-purple-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">{title}</h1>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="ml-auto p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Filter size={12} />
          Filters:
        </div>

        <select
          value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setPage(1) }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          {actionOptions.map(o => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>

        <select
          value={dateRange}
          onChange={e => { setDateRange(e.target.value); setPage(1) }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          {rangeOptions.map(o => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>

        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search events…"
            className="pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 w-52 bg-white"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <span className="ml-auto text-sm text-gray-400">
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 px-6 py-6 w-full max-w-4xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <RefreshCw size={32} className="animate-spin text-purple-300 mb-4" />
            <p className="text-sm text-gray-400">Loading audit history…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle size={32} className="text-red-400 mb-3" />
            <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Clock size={24} className="text-gray-300" />
            </div>
            <p className="text-base font-semibold text-gray-500 mb-1">No audit events found</p>
            <p className="text-sm text-gray-400">
              {search
                ? 'Try adjusting your search query.'
                : actionFilter !== 'ALL'
                ? 'Try changing the action filter.'
                : 'No changes have been recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([day, dayLogs]) => (
              <div key={day}>
                {/* Date section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2 whitespace-nowrap">
                    {day}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Event cards */}
                <div className="space-y-3">
                  {dayLogs.map(entry => (
                    <EventCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
            <span className="ml-2 text-gray-400">({filtered.length} events total)</span>
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
