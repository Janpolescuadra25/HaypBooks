'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { RefreshCw, Send } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { taxService } from '@/services/tax.service'

function formatDateTime(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
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
        <div className="flex items-center gap-3">
          <Send className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">E-Filing</h2>
        </div>
        <button
          onClick={fetchPackages}
          disabled={loading}
          className="rounded-xl bg-slate-900 p-2.5 text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Package Type</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Generated</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Submitted</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Acknowledgement No.</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                  <div className="flex h-64 items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
                  </div>
                </td>
              </tr>
            ) : !packages.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No e-filing packages found</td>
              </tr>
            ) : (
              packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${packageBadge(pkg.packageType)}`}>
                      {pkg.packageType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatDateTime(pkg.generatedAt)}</td>
                  <td className="px-4 py-3 text-slate-700">{pkg.submittedAt ? formatDateTime(pkg.submittedAt) : <span className="text-slate-400">Not submitted</span>}</td>
                  <td className="px-4 py-3 text-slate-700">{pkg.acknowledgementNumber ? <span className="font-mono text-slate-700">{pkg.acknowledgementNumber}</span> : <span className="text-slate-400">Pending</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeStyles(pkg.submittedAt, pkg.acknowledgementNumber)}`}>
                      {statusBadge(pkg.submittedAt, pkg.acknowledgementNumber)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
