'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  X, Clock, User, Pencil, Plus, Trash2, RefreshCw, AlertCircle,
  RotateCcw, Filter, ArrowRight,
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
  performedBy: string
  performedAt: string
  lines: AuditLine[]
}

interface Props {
  companyId: string
  accountId?: string | null   // null = show ALL account changes
  accountName?: string
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
  if (normalized.includes('DELETE') || normalized.includes('DEACTIVATE')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
        <Trash2 size={9} /> {normalized.includes('DEACTIVATE') ? 'Deactivated' : 'Deleted'}
      </span>
    )
  }
  if (normalized.includes('REACTIVATE')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700">
        <RotateCcw size={9} /> Reactivated
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
      <Pencil size={9} /> Updated
    </span>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AccountAuditLog({
  companyId,
  accountId = null,
  accountName,
  open,
  onOpenChange,
}: Props) {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionFilter, setActionFilter] = useState<string>('ALL')
  const [dateRange, setDateRange] = useState<string>('7d')

  const fetchLogs = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (accountId) params.set('accountId', accountId)
      if (actionFilter !== 'ALL') params.set('action', actionFilter)
      if (dateRange !== 'all') params.set('range', dateRange)

      const { data } = await apiClient.get(
        `/companies/${companyId}/accounting/accounts/audit-log?${params.toString()}`
      )
      setLogs(Array.isArray(data) ? data : (data?.logs ?? []))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load audit history')
    } finally {
      setLoading(false)
    }
  }, [companyId, accountId, actionFilter, dateRange])

  useEffect(() => {
    if (open) fetchLogs()
    else setLogs([])
  }, [open, fetchLogs])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  // Group logs by date
  const grouped = logs.reduce<Record<string, AuditEntry[]>>((acc, log) => {
    const date = new Date(log.performedAt).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {})

  const today = new Date().toLocaleDateString()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock size={15} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Account Audit Log</h2>
                  <p className="text-xs text-slate-500 truncate max-w-[260px]">
                    {accountName
                      ? accountName
                      : 'All account changes across your chart of accounts'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLogs}
                  disabled={loading}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  title="Close audit log"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter size={12} />
                <span className="font-medium">Filters:</span>
              </div>

              {/* Action filter */}
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE">Created</option>
                <option value="UPDATE">Updated</option>
                <option value="DEACTIVATE">Deactivated</option>
                <option value="REACTIVATE">Reactivated</option>
                <option value="DELETE">Deleted</option>
              </select>

              {/* Date range filter */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>

              {!loading && logs.length > 0 && (
                <span className="text-xs text-slate-400 ml-auto">
                  {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <RefreshCw size={28} className="animate-spin mb-3 opacity-40" />
                  <p className="text-sm">Loading audit trail…</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 px-6 text-center">
                  <AlertCircle size={28} className="mb-3 text-rose-400" />
                  <p className="text-sm font-medium text-rose-600">{error}</p>
                  <button
                    onClick={fetchLogs}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
                  >
                    Try again
                  </button>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 px-6 text-center">
                  <Clock size={32} className="mb-3 opacity-25" />
                  <p className="text-sm font-medium text-slate-500">No audit history</p>
                  <p className="text-xs mt-1">
                    {accountId
                      ? 'No changes have been recorded for this account.'
                      : 'No account changes have been recorded yet.'}
                  </p>
                </div>
              ) : (
                <div className="px-5 py-4">
                  {Object.entries(grouped).map(([date, dayLogs]) => (
                    <div key={date} className="mb-6">
                      {/* Date group header */}
                      <div className="sticky top-0 bg-white py-2 mb-3 border-b border-slate-100 z-10">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {date === today ? 'Today' : date}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2">
                          ({dayLogs.length} {dayLogs.length === 1 ? 'entry' : 'entries'})
                        </span>
                      </div>

                      {/* Timeline */}
                      <div className="relative">
                        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />

                        <div className="space-y-5">
                          {dayLogs.map((log) => (
                            <div key={log.id} className="relative flex gap-4">
                              {/* Timeline dot */}
                              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                log.action.toUpperCase().includes('CREATE')
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : log.action.toUpperCase().includes('DELETE') || log.action.toUpperCase().includes('DEACTIVATE')
                                  ? 'bg-rose-100 text-rose-600'
                                  : log.action.toUpperCase().includes('REACTIVATE')
                                  ? 'bg-teal-100 text-teal-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {log.action.toUpperCase().includes('CREATE')
                                  ? <Plus size={13} />
                                  : log.action.toUpperCase().includes('DELETE') || log.action.toUpperCase().includes('DEACTIVATE')
                                  ? <Trash2 size={13} />
                                  : log.action.toUpperCase().includes('REACTIVATE')
                                  ? <RotateCcw size={13} />
                                  : <Pencil size={13} />
                                }
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 pb-1">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <ActionBadge action={log.action} />
                                    <span className="text-xs font-medium text-slate-700">{log.tableName}</span>
                                  </div>
                                  <time
                                    dateTime={log.performedAt}
                                    title={formatAbsoluteTime(log.performedAt)}
                                    className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0"
                                  >
                                    {formatRelativeTime(log.performedAt)}
                                  </time>
                                </div>

                                {/* Performer */}
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
                                  <User size={10} />
                                  <span>{log.performedBy}</span>
                                </div>

                                {/* Field changes */}
                                {log.lines && log.lines.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                      <ArrowRight size={10} />
                                      {log.lines.length} field {log.lines.length === 1 ? 'change' : 'changes'}
                                    </div>
                                    {log.lines.map((line, j) => (
                                      <div
                                        key={j}
                                        className="bg-slate-50 rounded-lg px-3 py-2 text-xs border border-slate-100"
                                      >
                                        <span className="font-semibold text-slate-600 capitalize">
                                          {line.fieldName.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        {line.oldValue != null && (
                                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            <span className="line-through text-rose-500 font-medium font-mono">
                                              {line.oldValue || '(empty)'}
                                            </span>
                                            <span className="text-slate-400">→</span>
                                            <span className="text-emerald-600 font-semibold font-mono">
                                              {line.newValue || '(empty)'}
                                            </span>
                                          </div>
                                        )}
                                        {line.oldValue == null && line.newValue != null && (
                                          <div className="mt-0.5 text-emerald-600 font-semibold font-mono">
                                            {line.newValue}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-[10px] text-slate-400 text-center">
                Showing up to 100 most recent events · All times local
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
