'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Download, RefreshCw, Search } from 'lucide-react'
import { exportAuditLogs, getCompanyAuditLogs, type AuditLogEntry } from '@/services/audit.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import HaypSelect from '@/components/shared/HaypSelect'

const ENTITY_TYPES = [
  { value: '', label: 'All entities' },
  { value: 'JournalEntry', label: 'Journal Entry' },
  { value: 'Invoice', label: 'Invoice' },
  { value: 'Bill', label: 'Bill' },
  { value: 'CustomerPayment', label: 'Payment' },
  { value: 'BankTransaction', label: 'Bank Transaction' },
  { value: 'Customer', label: 'Customer' },
  { value: 'Vendor', label: 'Vendor' },
  { value: 'Item', label: 'Inventory Item' },
  { value: 'Account', label: 'Chart of Account' },
]

const ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'CREATE', label: 'Created' },
  { value: 'UPDATE', label: 'Updated' },
  { value: 'DELETE', label: 'Deleted' },
  { value: 'VOID', label: 'Voided' },
  { value: 'REALLOCATE', label: 'Reallocated' },
]

const PAGE_SIZES = [25, 50, 100]

function getActionBadgeVariant(action: string) {
  if (action === 'CREATE') return 'secondary'
  if (action === 'UPDATE') return 'default'
  if (action === 'DELETE' || action === 'VOID') return 'destructive'
  return 'outline'
}

function getSummary(log: AuditLogEntry) {
  if (Array.isArray(log.lines) && log.lines.length > 0) {
    const line = log.lines[0]
    if (line.oldValue && line.newValue) {
      return `${line.fieldName} changed from ${line.oldValue} to ${line.newValue}`
    }
    if (line.oldValue) {
      return `${line.fieldName} removed`
    }
    if (line.newValue) {
      return `${line.fieldName} set to ${line.newValue}`
    }
  }

  if (log.changes && typeof log.changes === 'object') {
    const keys = Object.keys(log.changes)
    if (keys.length === 1) {
      const key = keys[0]
      return `${key} updated`
    }
    if (keys.length > 1) {
      return `${keys.length} fields changed`
    }
  }

  return `${log.entityType}${log.entityId ? ` ${log.entityId}` : ''}`
}

function formatDetails(log: AuditLogEntry) {
  if (Array.isArray(log.lines) && log.lines.length > 0) {
    return log.lines.map((line) => `${line.fieldName}: ${line.oldValue ?? '—'} → ${line.newValue ?? '—'}`).join('\n')
  }
  if (log.changes && typeof log.changes === 'object') {
    return JSON.stringify(log.changes, null, 2)
  }
  return '-'
}

export default function AuditLogPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set())
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchLogs = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const result = await getCompanyAuditLogs(companyId, {
        entityType: entityType || undefined,
        action: action || undefined,
        search: search || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit,
      })
      setLogs(result.data)
      setTotal(result.total)
    } catch (err) {
      console.error('Failed to load audit logs', err)
      setError('Failed to load audit logs')
      setLogs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [companyId, entityType, action, search, from, to, page, limit])

  useEffect(() => {
    if (!cidLoading) {
      fetchLogs()
    }
  }, [cidLoading, fetchLogs])

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  const toggleExpand = useCallback((id: string) => {
    setExpandedLogIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const resetFilters = useCallback(() => {
    setEntityType('')
    setAction('')
    setSearch('')
    setFrom('')
    setTo('')
    setPage(1)
  }, [])

  const handleExport = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const blob = await exportAuditLogs(companyId, {
        entityType: entityType || undefined,
        action: action || undefined,
        search: search || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit,
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'audit-log-export.csv'
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export audit logs', err)
      setError('Failed to export CSV')
    } finally {
      setLoading(false)
    }
  }, [companyId, entityType, action, search, from, to, page, limit])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">Audit Logs</p>
          <h1 className="text-2xl font-bold text-slate-900">Company audit history</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="secondary" onClick={fetchLogs} disabled={loading || cidLoading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" onClick={resetFilters} disabled={loading || cidLoading}>
            Clear filters
          </Button>
          <Button variant="secondary" onClick={handleExport} disabled={loading || cidLoading}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <HaypSelect
          id="entityType"
          label="Entity type"
          value={entityType}
          onChange={(value) => { setEntityType(value); setPage(1) }}
          options={ENTITY_TYPES}
        />
        <HaypSelect
          id="action"
          label="Action"
          value={action}
          onChange={(value) => { setAction(value); setPage(1) }}
          options={ACTIONS}
        />
        <div>
          <label htmlFor="from" className="block text-sm font-medium text-slate-700 mb-1">From</label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(event) => { setFrom(event.target.value); setPage(1) }}
          />
        </div>
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-slate-700 mb-1">To</label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(event) => { setTo(event.target.value); setPage(1) }}
          />
        </div>
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="search"
              type="text"
              value={search}
              placeholder="User or entity ID"
              className="pl-10"
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-slate-50 text-[13px] uppercase tracking-[0.16em] text-slate-600">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Entity Type</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3">Record</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No audit entries found.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const expanded = expandedLogIds.has(log.id)
                return (
                  <React.Fragment key={log.id}>
                    <tr className="border-t border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 align-top font-medium text-slate-900">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-700">
                        {log.user?.firstName || log.user?.email}
                        <div className="text-xs text-slate-500">{log.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-700"><Badge variant="outline">{log.entityType}</Badge></td>
                      <td className="px-4 py-3 align-top"><Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge></td>
                      <td className="px-4 py-3 align-top text-slate-700">{getSummary(log)}</td>
                      <td className="px-4 py-3 align-top text-slate-700">{log.entityId ?? '-'}</td>
                    </tr>
                    {expanded && (
                      <tr className="bg-slate-50">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="space-y-3">
                            {log.lines?.length ? (
                              <div className="grid gap-3 md:grid-cols-2">
                                {log.lines.map((line) => (
                                  <div key={line.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">{line.fieldName}</div>
                                    <div className="flex gap-3 text-[13px] text-slate-700">
                                      <div className="min-w-[72px] text-slate-500">Before</div>
                                      <div className="break-words">{line.oldValue ?? '—'}</div>
                                    </div>
                                    <div className="mt-2 flex gap-3 text-[13px] text-slate-700">
                                      <div className="min-w-[72px] text-slate-500">After</div>
                                      <div className="break-words">{line.newValue ?? '—'}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-3 text-[13px] text-slate-700">{formatDetails(log)}</pre>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={6} className="bg-slate-100 px-4 py-2 text-xs text-slate-500">
                        <button
                          type="button"
                          className="text-slate-700 underline"
                          onClick={() => toggleExpand(log.id)}
                        >
                          {expanded ? 'Hide details' : 'Show details'}
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-500">Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} entries</p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-500">
            Page size
            <select
              value={limit}
              onChange={(event) => { setLimit(Number(event.target.value)); setPage(1) }}
              className="ml-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-slate-600">Page {page} of {pageCount}</span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount || loading}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
