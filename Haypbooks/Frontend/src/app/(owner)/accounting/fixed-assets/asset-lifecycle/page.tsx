'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, PackageOpen, Building2, PauseCircle, Wrench, XCircle, ShoppingBag } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { inventoryService } from '@/services/inventory.service'
import { formatCurrency } from '@/lib/format'

const STATUS_ORDER = ['ACTIVE', 'IDLE', 'UNDER_MAINTENANCE', 'DISPOSED', 'SOLD'] as const

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  ACTIVE: { label: 'Active', icon: Building2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  IDLE: { label: 'Idle', icon: PauseCircle, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  UNDER_MAINTENANCE: { label: 'Under Maintenance', icon: Wrench, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  DISPOSED: { label: 'Disposed', icon: XCircle, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  SOLD: { label: 'Sold', icon: ShoppingBag, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
}

export default function AssetLifecyclePage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAssets = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await inventoryService.getFixedAssets(companyId)
      setAssets(Array.isArray(data) ? data : (data?.data ?? []))
    } catch (err: any) {
      setError(err?.message || 'Failed to load fixed assets')
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
    fetchAssets()
  }, [companyId, companyLoading, fetchAssets])

  const groupedAssets = useMemo(() => {
    const groups: Record<string, any[]> = {}
    for (const status of STATUS_ORDER) {
      const filtered = assets.filter((a) => a.status === status)
      if (filtered.length > 0) groups[status] = filtered
    }
    return groups
  }, [assets])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Asset Lifecycle</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track asset lifecycle stages from acquisition to disposal</p>
        </div>
        <button
          type="button"
          onClick={fetchAssets}
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

      {loading ? (
        <div className="flex items-center justify-center h-64 rounded-2xl border border-slate-200 bg-white">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : !assets.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 text-center text-slate-500">
          <PackageOpen className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-sm">No fixed assets found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {STATUS_ORDER.map((status) => {
              const config = STATUS_CONFIG[status]
              const count = assets.filter((a) => a.status === status).length
              if (!count) return null
              const Icon = config.icon
              return (
                <div key={status} className={`inline-flex items-center gap-2 rounded-full ${config.bg} ${config.color} px-3 py-1.5 text-xs font-medium`}>
                  <Icon className="h-4 w-4" />
                  <span>{config.label} ({count})</span>
                </div>
              )
            })}
          </div>

          {STATUS_ORDER.map((status) => {
            const group = groupedAssets[status]
            if (!group?.length) return null
            const config = STATUS_CONFIG[status]
            const StatusIcon = config.icon
            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <StatusIcon className="h-4 w-4" />
                  <span className={`${config.color}`}>{config.label} ({group.length})</span>
                </div>
                <div className={`rounded-2xl border ${config.border} bg-white overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Asset Name</th>
                          <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Category</th>
                          <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Acquired</th>
                          <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cost</th>
                          <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Entries</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.map((asset) => (
                          <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-900">{asset.name}</td>
                            <td className="px-5 py-3 text-slate-700">{asset.category?.name ?? '—'}</td>
                            <td className="px-5 py-3 text-slate-700">{asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                            <td className="px-5 py-3 text-slate-900 font-medium">{formatCurrency(Number(asset.cost || 0), currency)}</td>
                            <td className="px-5 py-3 text-slate-700">{asset._count?.depreciations ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
