'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Building2, CheckCircle, Wallet, Wrench, RefreshCw, PackageOpen } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { inventoryService } from '@/services/inventory.service'
import { formatCurrency } from '@/lib/format'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  IDLE: 'bg-slate-100 text-slate-600',
  UNDER_MAINTENANCE: 'bg-amber-50 text-amber-700',
  DISPOSED: 'bg-rose-50 text-rose-700',
  SOLD: 'bg-blue-50 text-blue-700',
}

const METHOD_LABELS: Record<string, string> = {
  STRAIGHT_LINE: 'Straight Line',
  DECLINING_BALANCE: 'Declining Balance',
  DOUBLE_DECLINING: 'Double Declining',
  UNITS_OF_PRODUCTION: 'Units of Production',
}

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'IDLE', 'UNDER_MAINTENANCE', 'DISPOSED', 'SOLD'] as const

export default function AssetManagementPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeStatus, setActiveStatus] = useState<string>('ALL')

  const fetchAssets = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await inventoryService.getFixedAssets(companyId)
      setAssets(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load fixed assets')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchAssets()
  }, [companyId, companyLoading, fetchAssets])

  const filteredAssets = useMemo(() => {
    if (activeStatus === 'ALL') return assets
    return assets.filter((asset) => asset.status === activeStatus)
  }, [assets, activeStatus])

  const totalAssets = assets.length
  const activeCount = assets.filter((asset) => asset.status === 'ACTIVE').length
  const totalValue = assets.reduce((sum, asset) => sum + Number(asset.cost || 0), 0)
  const maintenanceCount = assets.filter((asset) => asset.status === 'UNDER_MAINTENANCE').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Asset Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage fixed assets with status filters and value insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-500"><Building2 className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Assets</p>
              <p className="text-2xl font-bold text-slate-900">{totalAssets}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-5 text-emerald-700">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/80 p-3 text-emerald-500"><CheckCircle className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-blue-50 p-5 text-blue-700">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/80 p-3 text-blue-500"><Wallet className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValue, currency)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-amber-50 p-5 text-amber-700">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/80 p-3 text-amber-500"><Wrench className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium">Under Maintenance</p>
              <p className="text-2xl font-bold">{maintenanceCount}</p>
            </div>
          </div>
        </div>
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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !filteredAssets.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <PackageOpen className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No fixed assets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Asset</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Acquired</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cost</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Method</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Useful Life</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Entries</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900">{asset.name}</div>
                      {asset.description && <div className="text-xs text-slate-500">{asset.description}</div>}
                    </td>
                    <td className="px-5 py-3 text-slate-700">{asset.category?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-700">{asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                    <td className="px-5 py-3 text-slate-900 font-medium">{formatCurrency(Number(asset.cost || 0), currency)}</td>
                    <td className="px-5 py-3 text-slate-700">{METHOD_LABELS[asset.depreciationMethod] ?? asset.depreciationMethod}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[asset.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{asset.usefulLifeMonths ? `${asset.usefulLifeMonths} months` : '—'}</td>
                    <td className="px-5 py-3 text-slate-700">{asset._count?.depreciations ?? 0}</td>
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
