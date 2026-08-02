'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, PackageOpen, LayoutGrid } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { inventoryService } from '@/services/inventory.service'

export default function BinLocationsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [bins, setBins] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeWarehouse, setActiveWarehouse] = useState('ALL')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const [binsResp, locsResp] = await Promise.all([
        inventoryService.listBinLocations(companyId),
        inventoryService.listLocations(companyId),
      ])

      const binsData = Array.isArray(binsResp.data) ? binsResp.data : (binsResp.data?.data ?? [])
      const locsData = Array.isArray(locsResp.data) ? locsResp.data : (locsResp.data?.data ?? [])

      setBins(binsData)
      setLocations(locsData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load bin locations')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchData()
  }, [companyId, companyLoading, fetchData])

  const warehouseMap = useMemo(() => {
    return new Map(locations.map((l: any) => [l.id, l.name]))
  }, [locations])

  const filteredBins = useMemo(() => {
    if (activeWarehouse === 'ALL') return bins
    return bins.filter((b: any) => b.warehouseId === activeWarehouse)
  }, [bins, activeWarehouse])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Bin Locations</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage bin locations within warehouses</p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <LayoutGrid className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Warehouse filter
          <select
            value={activeWarehouse}
            onChange={(event) => setActiveWarehouse(event.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          >
            <option value="ALL">All Warehouses</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </label>
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
        ) : !filteredBins.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <LayoutGrid className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No bin locations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Code</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Warehouse</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBins.map((bin) => (
                  <tr key={bin.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">{bin.name}</td>
                    <td className="px-5 py-4 text-slate-700">{bin.code ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-700">{warehouseMap.get(bin.warehouseId) ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${bin.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {bin.isActive ? 'Active' : 'Inactive'}
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
