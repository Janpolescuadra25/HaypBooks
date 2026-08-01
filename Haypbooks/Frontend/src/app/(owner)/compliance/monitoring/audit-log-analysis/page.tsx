'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, ShieldCheck, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'

interface LedgerHealthCheck {
  id: string
  name: string
  severity: 'PASS' | 'WARNING' | 'ERROR'
  description: string
  count?: number
  affectedItems?: { id: string; label: string }[]
}

interface LedgerHealthResponse {
  checkedAt: string
  summary: {
    total: number
    passed: number
    warnings: number
    errors: number
  }
  checks: LedgerHealthCheck[]
}

const severityBadge = (severity: LedgerHealthCheck['severity']) => {
  switch (severity) {
    case 'PASS':
      return 'bg-emerald-100 text-emerald-700'
    case 'WARNING':
      return 'bg-amber-100 text-amber-700'
    case 'ERROR':
      return 'bg-rose-100 text-rose-700'
  }
}

const severityIcon = (severity: LedgerHealthCheck['severity']) => {
  switch (severity) {
    case 'PASS':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case 'WARNING':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case 'ERROR':
      return <XCircle className="h-4 w-4 text-rose-500" />
  }
}

export default function LedgerHealthPage() {
  const { companyId, loading: companyLoading } = useCompanyId()

  const [data, setData] = useState<LedgerHealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get('/reporting/ledger-health', { params: { companyId } })
      setData(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load ledger health data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchHealth()
  }, [companyLoading, companyId, fetchHealth])

  const sortedChecks = useMemo(() => {
    if (!data?.checks) return []
    const order: Record<string, number> = { ERROR: 0, WARNING: 1, PASS: 2 }
    return [...data.checks].sort((a, b) => order[a.severity] - order[b.severity])
  }, [data])

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-semibold text-slate-900">Ledger Health Monitor</h1>
          </div>
          {data?.checkedAt && (
            <p className="text-sm text-slate-500 mt-0.5">
              Last checked: {new Date(data.checkedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Passed</p>
              <p className="text-lg font-semibold text-emerald-700 mt-0.5">{data?.summary.passed ?? '—'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Warnings</p>
              <p className="text-lg font-semibold text-amber-700 mt-0.5">{data?.summary.warnings ?? '—'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl">
              <XCircle className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Errors</p>
              <p className="text-lg font-semibold text-rose-700 mt-0.5">{data?.summary.errors ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Integrity Checks</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <p className="text-sm mb-2">{error}</p>
            <button onClick={fetchHealth} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Retry</button>
          </div>
        ) : !data?.checks?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <ShieldCheck className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No health check data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Check</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Count</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Affected Items</th>
                </tr>
              </thead>
              <tbody>
                {sortedChecks.map((check) => (
                  <tr key={check.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {severityIcon(check.severity)}
                        <span className="font-medium text-slate-800">{check.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityBadge(check.severity)}`}>
                        {check.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-md">{check.description}</td>
                    <td className="px-5 py-3 text-right text-slate-700 font-medium">
                      {check.count != null ? check.count : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {check.affectedItems && check.affectedItems.length > 0 ? (
                        <div className="max-h-32 overflow-y-auto space-y-0.5">
                          {check.affectedItems.map((item) => (
                            <p key={item.id} className="text-xs text-slate-500 truncate">{item.label}</p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
