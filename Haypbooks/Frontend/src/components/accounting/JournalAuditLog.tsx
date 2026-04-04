'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  X, Clock, User, Pencil, Plus, Trash2, AlertCircle,
  RotateCcw, Filter, ArrowRight, CheckCircle, Ban,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import apiClient from '@/lib/api-client'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AuditLine {
  fieldName: string
  oldValue: string | null
  newValue: string | null
  changeType: 'CREATE' | 'UPDATE' | 'DELETE'
}

interface AuditEntry {
  id: string
  action: string
  tableName: string
  performedBy?: string
  performedAt?: string
  createdAt?: string
  lines: AuditLine[]
  synthetic?: boolean
  user?: { id: string; name?: string; email: string } | null
}

interface Props {
  companyId: string
  entryId?: string | null   // null = show ALL journal entry changes
  open: boolean
  onOpenChange: (open: boolean) => void
}

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
  return new Date(iso).toLocaleDateString()
}

function formatAbsoluteTime(iso: string): string {
  const d = new Date(iso)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

function ActionBadge({ action }: { action: string }) {
  const normalized = action.toUpperCase()
  if (normalized.includes('CREATE')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
        <Plus size={9} /> Created
      </span>
    )
  }
  if (normalized.includes('UPDATE') || normalized.includes('EDIT')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
        <Pencil size={9} /> Updated
      </span>
    )
  }
  if (normalized === 'POSTED' || normalized.includes('POST')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700">
        <CheckCircle size={9} /> Posted
      </span>
    )
  }
  if (normalized === 'VOIDED' || normalized.includes('VOID')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
        <Ban size={9} /> Voided
      </span>
    )
  }
  if (normalized.includes('DELETE')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
        <Trash2 size={9} /> Deleted
      </span>
    )
  }
  if (normalized.includes('REVERS') || normalized.includes('UNDO')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
        <RotateCcw size={9} /> Reversed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
      {action}
    </span>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function JournalAuditLog({ companyId, entryId, open, onOpenChange }: Props) {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('ALL')
  const [dateRange, setDateRange] = useState<string>('30d')

  const fetchLogs = useCallback(async () => {
    if (!companyId || !open) return
    setLoading(true)
    setError('')
    try {
      if (entryId) {
        // Single entry activity
        const { data } = await apiClient.get(
          `/companies/${companyId}/accounting/journal-entries/${entryId}/activity`
        )
        const events: AuditEntry[] = (data?.events ?? []).map((e: any) => ({
          id: e.id,
          action: e.action,
          tableName: 'JournalEntry',
          performedBy: e.user?.name ?? e.user?.email ?? 'System',
          performedAt: e.createdAt,
          lines: e.lines ?? [],
          synthetic: e.synthetic,
          user: e.user,
        }))
        setLogs(events.reverse()) // newest first
      } else {
        // Global audit log for all journal entries
        const { data } = await apiClient.get(
          `/companies/${companyId}/accounting/journal-entries/audit-log?range=${dateRange}`
        )
        setLogs(Array.isArray(data) ? data : [])
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }, [companyId, entryId, open, dateRange])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  // Escape key close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  const filtered = logs.filter(l => actionFilter === 'ALL' || l.action.toUpperCase() === actionFilter)

  // Group by date
  const grouped = filtered.reduce<Record<string, AuditEntry[]>>((acc, entry) => {
    const iso = entry.performedAt ?? entry.createdAt ?? ''
    const day = iso ? new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'
    if (!acc[day]) acc[day] = []
    acc[day].push(entry)
    return acc
  }, {})

  const dateGroups = Object.entries(grouped)

  const actionOptions = [
    { key: 'ALL', label: 'All Actions' },
    { key: 'CREATE', label: 'Created' },
    { key: 'UPDATE', label: 'Updated' },
    { key: 'POSTED', label: 'Posted' },
    { key: 'VOIDED', label: 'Voided' },
  ]

  const rangeOptions = [
    { key: '7d', label: '7 days' },
    { key: '30d', label: '30 days' },
    { key: '90d', label: '90 days' },
    { key: 'all', label: 'All time' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => onOpenChange(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Clock size={15} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    {entryId ? 'Entry Audit Log' : 'Journal Entries Audit Log'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {entryId ? 'Change history for this entry' : 'All journal entry changes'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Filters */}
            <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Filter size={12} className="text-gray-400" />
                <select
                  value={actionFilter}
                  onChange={e => setActionFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                >
                  {actionOptions.map(o => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
              </div>
              {!entryId && (
                <select
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                >
                  {rangeOptions.map(o => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
              )}
              <span className="ml-auto text-xs text-gray-400">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-3" />
                  <p className="text-sm text-gray-400">Loading audit history…</p>
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-600 border border-red-100 mt-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Clock size={20} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No audit events found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {actionFilter !== 'ALL' ? 'Try changing the action filter.' : 'No changes recorded yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {dateGroups.map(([day, dayLogs]) => (
                    <div key={day}>
                      <div className="sticky top-0 bg-white/90 backdrop-blur-sm py-1 mb-3 z-10">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{day}</span>
                      </div>
                      <div className="space-y-3">
                        {dayLogs.map(log => {
                          const iso = log.performedAt ?? log.createdAt ?? ''
                          return (
                            <div key={log.id} className="flex gap-3">
                              {/* Timeline dot */}
                              <div className="flex flex-col items-center pt-0.5">
                                <div className="w-2 h-2 rounded-full bg-purple-300 ring-2 ring-purple-100 mt-1.5 shrink-0" />
                                <div className="w-px flex-1 bg-gray-100 mt-1" />
                              </div>
                              {/* Event card */}
                              <div className="pb-3 flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <ActionBadge action={log.action} />
                                    {(log.performedBy ?? log.user?.name ?? log.user?.email) && (
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <User size={10} />
                                        {log.performedBy ?? log.user?.name ?? log.user?.email}
                                      </span>
                                    )}
                                  </div>
                                  {iso && (
                                    <time
                                      className="text-[10px] text-gray-400 shrink-0"
                                      title={formatAbsoluteTime(iso)}
                                    >
                                      {formatRelativeTime(iso)}
                                    </time>
                                  )}
                                </div>

                                {/* Field diffs */}
                                {log.lines && log.lines.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {log.lines.map((line, i) => (
                                      <div key={i} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                                        <span className="font-medium text-gray-700 capitalize min-w-[80px]">{line.fieldName}</span>
                                        {line.oldValue !== null && (
                                          <>
                                            <span className="text-gray-400 line-through truncate max-w-[80px]">{line.oldValue}</span>
                                            <ArrowRight size={10} className="text-gray-300 shrink-0" />
                                          </>
                                        )}
                                        <span className="text-emerald-700 font-medium truncate max-w-[100px]">{line.newValue ?? '—'}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {log.synthetic && (
                                  <p className="text-[10px] text-gray-400 mt-1 italic">Auto-generated from entry metadata</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
