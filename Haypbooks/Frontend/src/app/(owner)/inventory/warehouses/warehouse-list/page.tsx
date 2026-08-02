'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, PackageOpen, Warehouse } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { inventoryService } from '@/services/inventory.service'

export default function WarehouseListPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLocations = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const { data } = await inventoryService.listLocations(companyId)
      setLocations(Array.isArray(data) ? data : (data?.data ?? []))
    } catch (err: any) {
      setError(err?.message || 'Failed to load warehouses')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchLocations()
  }, [companyId, companyLoading, fetchLocations])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Warehouses</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage storage locations for inventory</p>
        </div>
        <button
          type="button"
          onClick={fetchLocations}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Warehouse className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
        ) : !locations.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Warehouse className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No warehouses found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Default</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">{loc.name}</td>
                    <td className="px-5 py-4 text-slate-700">{loc.description ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${loc.isDefault ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {loc.isDefault ? 'Default' : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{new Date(loc.createdAt).toLocaleDateString()}</td>
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
