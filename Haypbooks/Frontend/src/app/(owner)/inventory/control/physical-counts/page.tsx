'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, PackageOpen, ClipboardCheck } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { inventoryService } from '@/services/inventory.service'

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-700',
  COUNTING: 'bg-amber-50 text-amber-700',
  REVIEWED: 'bg-slate-100 text-slate-600',
  CLOSED: 'bg-emerald-50 text-emerald-700',
}

const STATUS_OPTIONS = ['ALL', 'OPEN', 'COUNTING', 'REVIEWED', 'CLOSED'] as const

export default function PhysicalCountsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [counts, setCounts] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeStatus, setActiveStatus] = useState('ALL')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const [countsResp, locsResp] = await Promise.all([
        inventoryService.listPhysicalCounts(companyId),
        inventoryService.listLocations(companyId),
      ])

      const countsData = Array.isArray(countsResp.data) ? countsResp.data : (countsResp.data?.data ?? [])
      const locsData = Array.isArray(locsResp.data) ? locsResp.data : (locsResp.data?.data ?? [])

      setCounts(countsData)
      setLocations(locsData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load physical counts')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchData()
  }, [companyId, companyLoading, fetchData])

  const warehouseMap = useMemo(() => new Map(locations.map((l: any) => [l.id, l.name])), [locations])

  const filteredCounts = useMemo(() => {
    if (activeStatus === 'ALL') return counts
    return counts.filter((count: any) => count.status === activeStatus)
  }, [counts, activeStatus])

  if (companyLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Physical Counts</h2>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          title="Refresh"
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((status) => {
          const active = activeStatus === status
          return (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {status}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Warehouse</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Count Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Variance</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Lines</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No physical counts found.</td>
              </tr>
            ) : (
              filteredCounts.map((count) => {
                const variance = count.varianceTotal ? Number(count.varianceTotal) : null
                return (
                  <tr key={count.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-700">{warehouseMap.get(count.warehouseId) ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{format(new Date(count.countDate), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[count.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {count.status ?? '—'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${variance !== null && variance < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {variance !== null ? variance : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{count.lines?.length ?? 0}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
