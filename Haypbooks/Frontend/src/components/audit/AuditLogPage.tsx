'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, RefreshCw, Search, Calendar } from 'lucide-react'
import { getCompanyAuditLogs, type AuditLogEntry } from '@/services/audit.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import HaypSelect from '@/components/shared/HaypSelect'
import { cn } from '@/lib/utils'

const ENTITY_TYPES = [
  { value: '', label: 'All entities' },
  { value: 'ExpenseClaim', label: 'Expense Claim' },
  { value: 'BillPayment', label: 'Bill Payment' },
  { value: 'VendorCredit', label: 'Vendor Credit' },
  { value: 'MileageLog', label: 'Mileage Log' },
  { value: 'PerDiem', label: 'Per Diem' },
  { value: 'PurchaseRequest', label: 'Purchase Request' },
  { value: 'Receipt', label: 'Receipt' },
]

const ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'VOIDED', label: 'Voided' },
  { value: 'PAY', label: 'Pay' },
]

const PAGE_SIZE = 50

function formatDetails(log: AuditLogEntry) {
  const detailObj = {
    oldValue: log.oldValue,
    newValue: log.newValue,
    metadata: log.metadata,
  }
  const json = JSON.stringify(detailObj, null, 2)
  return json === '{}' ? '-' : json
}

export default function AuditLogPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
      })
      setLogs(result.items ?? [])
      setTotal(result.total ?? 0)
    } catch (err) {
      console.error('Failed to load audit logs', err)
      setError('Failed to load audit logs')
      setLogs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [companyId, entityType, action, startDate, endDate, page])

  useEffect(() => {
    if (!cidLoading) {
      fetchLogs()
    }
  }, [cidLoading, fetchLogs])

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  const handleResetFilters = useCallback(() => {
    setEntityType('')
    setAction('')
    setStartDate('')
    setEndDate('')
    setPage(0)
  }, [])

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
          <Button variant="outline" onClick={handleResetFilters} disabled={loading || cidLoading}>
            Clear filters
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <HaypSelect
            id="entityType"
            label="Entity type"
            value={entityType}
            onChange={(value) => { setEntityType(value); setPage(0) }}
            options={ENTITY_TYPES}
          />
        </div>
        <div>
          <HaypSelect
            id="action"
            label="Action"
            value={action}
            onChange={(value) => { setAction(value); setPage(0) }}
            options={ACTIONS}
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Start date</label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => { setStartDate(event.target.value); setPage(0) }}
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">End date</label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) => { setEndDate(event.target.value); setPage(0) }}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-[13px] uppercase tracking-[0.16em] text-slate-600">
            <tr>
              <th className="px-4 py-3">Date / Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Entity ID</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Details</th>
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
              logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 align-top font-medium text-slate-900">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700">
                    {log.user?.firstName || 'Unknown'} {log.user?.lastName || ''}
                    <div className="text-xs text-slate-500">{log.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700">{log.entityType}</td>
                  <td className="px-4 py-3 align-top text-slate-700">{log.entityId ?? '-'}</td>
                  <td className="px-4 py-3 align-top text-slate-700">{log.action}</td>
                  <td className="px-4 py-3 align-top text-slate-700 whitespace-pre-wrap font-mono text-[13px]">{formatDetails(log)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Showing {logs.length} of {total} entries</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-slate-600">Page {page + 1} of {pageCount}</span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1 || loading}
            className="inline-flex items-center gap-2"
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
