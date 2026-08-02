'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Send } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { taxService } from '@/services/tax.service'

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
}

function packageBadge(type: string) {
  switch (type) {
    case 'PRIMARY':
      return 'bg-blue-100 text-blue-700'
    case 'AMENDMENT':
      return 'bg-amber-100 text-amber-700'
    case 'SUPPORTING_DOCS':
      return 'bg-slate-100 text-slate-600'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

function statusBadge(submittedAt: string | null, acknowledgementNumber: string | null) {
  if (acknowledgementNumber) return 'Acknowledged'
  if (submittedAt) return 'Submitted'
  return 'Draft'
}

function statusBadgeStyles(submittedAt: string | null, acknowledgementNumber: string | null) {
  if (acknowledgementNumber) return 'bg-emerald-100 text-emerald-700'
  if (submittedAt) return 'bg-blue-100 text-blue-700'
  return 'bg-slate-100 text-slate-600'
}

export default function EFilingPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPackages = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await taxService.getEFiling(companyId)
      const packagesData = Array.isArray(data) ? data : (data?.data ?? [])
      setPackages(packagesData.sort((a: any, b: any) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()))
    } catch (err: any) {
      setError(err?.message || 'Failed to load e-filing packages')
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
    fetchPackages()
  }, [companyLoading, companyId, fetchPackages])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">E-Filing</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track electronic filing packages and submission status</p>
        </div>
        <button
          onClick={fetchPackages}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !packages.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Send className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No e-filing packages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Package Type</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Generated</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Submitted</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Acknowledgement No.</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${packageBadge(pkg.packageType)}`}>
                        {pkg.packageType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{formatDateTime(pkg.generatedAt)}</td>
                    <td className="px-5 py-3 text-slate-700">{pkg.submittedAt ? formatDateTime(pkg.submittedAt) : <span className="text-slate-400">Not submitted</span>}</td>
                    <td className="px-5 py-3 text-slate-700">{pkg.acknowledgementNumber ? <span className="font-mono text-slate-700">{pkg.acknowledgementNumber}</span> : <span className="text-slate-400">Pending</span>}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeStyles(pkg.submittedAt, pkg.acknowledgementNumber)}`}>
                        {statusBadge(pkg.submittedAt, pkg.acknowledgementNumber)}
                      </span>
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
