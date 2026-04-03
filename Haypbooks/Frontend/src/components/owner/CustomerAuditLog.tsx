'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Clock, User, Pencil, Plus, Trash2, RefreshCw, AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'

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
  customerId: string | null
  customerName?: string
  isOpen: boolean
  onClose: () => void
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
  if (normalized.includes('DELETE')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
        <Trash2 size={9} /> Deleted
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

export default function CustomerAuditLog({ customerId, customerName, isOpen, onClose }: Props) {
  const { companyId } = useCompanyId()
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    if (!customerId || !companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get(
        `/companies/${companyId}/contacts/customers/${customerId}/audit-log`
      )
      setLogs(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load audit history')
    } finally {
      setLoading(false)
    }
  }, [customerId, companyId])

  useEffect(() => {
    if (isOpen) fetchLogs()
    else setLogs([])
  }, [isOpen, fetchLogs])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock size={15} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Audit History</h2>
                  {customerName && (
                    <p className="text-xs text-slate-500 truncate max-w-[220px]">{customerName}</p>
                  )}
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
                  onClick={onClose}
                  title="Close audit log"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
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
                  <p className="text-xs mt-1">Changes to this customer will appear here.</p>
                </div>
              ) : (
                <div className="px-5 py-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                    {logs.length} event{logs.length !== 1 ? 's' : ''}
                  </p>

                  {/* Timeline */}
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />

                    <div className="space-y-5">
                      {logs.map((log, i) => (
                        <div key={log.id} className="relative flex gap-4">
                          {/* Dot */}
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            log.action.toUpperCase().includes('CREATE')
                              ? 'bg-emerald-100 text-emerald-600'
                              : log.action.toUpperCase().includes('DELETE')
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {log.action.toUpperCase().includes('CREATE') ? <Plus size={13} /> :
                             log.action.toUpperCase().includes('DELETE') ? <Trash2 size={13} /> :
                             <Pencil size={13} />}
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
                                {log.lines.map((line, j) => (
                                  <div
                                    key={j}
                                    className="bg-slate-50 rounded-lg px-3 py-2 text-xs border border-slate-100"
                                  >
                                    <span className="font-semibold text-slate-600 capitalize">
                                      {line.fieldName.replace(/_/g, ' ')}
                                    </span>
                                    {line.oldValue != null && (
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="line-through text-rose-500 font-medium">
                                          {line.oldValue || '(empty)'}
                                        </span>
                                        <span className="text-slate-400">→</span>
                                        <span className="text-emerald-600 font-semibold">
                                          {line.newValue || '(empty)'}
                                        </span>
                                      </div>
                                    )}
                                    {line.oldValue == null && line.newValue != null && (
                                      <div className="mt-0.5 text-emerald-600 font-semibold">
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
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-[10px] text-slate-400 text-center">
                Showing up to 100 most recent events • All times local
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
