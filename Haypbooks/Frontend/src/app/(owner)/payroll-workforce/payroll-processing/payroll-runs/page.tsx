'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Calculator, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { payrollService } from '@/services/payroll.service'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  POSTED: 'Posted',
  VOID: 'Void',
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SUBMITTED: 'bg-amber-50 text-amber-700',
  POSTED: 'bg-emerald-50 text-emerald-700',
  VOID: 'bg-rose-50 text-rose-700',
}

const POSTING_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  REVIEWED: 'Reviewed',
  APPROVED: 'Approved',
  POSTED: 'Posted',
  VOIDED: 'Voided',
}

const POSTING_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  REVIEWED: 'bg-blue-50 text-blue-700',
  APPROVED: 'bg-amber-50 text-amber-700',
  POSTED: 'bg-emerald-50 text-emerald-700',
  VOIDED: 'bg-rose-50 text-rose-700',
}

export default function PayrollRunsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'SUBMITTED' | 'POSTED' | 'VOID'>('ALL')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const res = await payrollService.listRuns(
        companyId,
        statusFilter !== 'ALL' ? { status: statusFilter } : undefined,
      )
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
      setRuns(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load payroll runs')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    if (!search) return runs
    const q = search.toLowerCase()
    return runs.filter((run: any) => {
      const start = format(new Date(run.startDate), 'MMM d, yyyy').toLowerCase()
      const end = format(new Date(run.endDate), 'MMM d, yyyy').toLowerCase()
      const schedule = run.paySchedule?.name?.toLowerCase() || ''
      return start.includes(q) || end.includes(q) || schedule.includes(q)
    })
  }, [runs, search])

  if (companyLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Payroll Runs</h2>
        </div>
        <button
          type="button"
          onClick={() => fetchData()}
          disabled={loading}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-4">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by period or schedule..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'DRAFT', 'SUBMITTED', 'POSTED', 'VOID'].map((status) => {
            const active = statusFilter === status
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status as 'ALL' | 'DRAFT' | 'SUBMITTED' | 'POSTED' | 'VOID')}
                className={`rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {status}
              </button>
            )
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">PERIOD</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SCHEDULE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">EMPLOYEES</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">PAYCHECKS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">POSTING STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SUBMITTED</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">CREATED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                  No payroll runs found
                </td>
              </tr>
            ) : (
              filtered.map((run: any) => (
                <tr key={run.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {format(new Date(run.startDate), 'MMM d')} – {format(new Date(run.endDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{run.paySchedule?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{run._count?.employees ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{run._count?.paychecks ?? 0}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[run.status] || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABELS[run.status] || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${POSTING_STATUS_COLORS[run.postingStatus] || 'bg-slate-100 text-slate-600'}`}>
                      {POSTING_STATUS_LABELS[run.postingStatus] || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{run.submittedAt ? format(new Date(run.submittedAt), 'MMM d, yyyy') : '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{format(new Date(run.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
