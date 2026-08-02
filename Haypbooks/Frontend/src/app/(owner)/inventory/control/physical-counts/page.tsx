'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, PackageOpen, ClipboardCheck } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { inventoryService } from '@/services/inventory.service'

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-700',
  COUNTING: 'bg-amber-50 text-amber-700',
  REVIEWED: 'bg-purple-50 text-purple-700',
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Physical Counts</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track stock count operations and variances</p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <ClipboardCheck className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
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

      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !filteredCounts.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <ClipboardCheck className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No physical counts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Warehouse</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Count Date</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Variance</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Lines</th>
                </tr>
              </thead>
              <tbody>
                {filteredCounts.map((count) => {
                  const variance = count.varianceTotal ? Number(count.varianceTotal) : null
                  return (
                    <tr key={count.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 text-slate-700">{warehouseMap.get(count.warehouseId) ?? '—'}</td>
                      <td className="px-5 py-4 text-slate-700">{new Date(count.countDate).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[count.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {count.status ?? '—'}
                        </span>
                      </td>
                      <td className={`px-5 py-4 ${variance !== null && variance < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {variance !== null ? variance : '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-700">{count.lines?.length ?? 0}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
