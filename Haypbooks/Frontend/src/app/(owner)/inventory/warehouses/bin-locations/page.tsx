'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, LayoutGrid } from 'lucide-react'
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

  if (companyLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Bin Locations</h2>
        </div>
        <button
          type="button"
          title="Refresh"
          onClick={fetchData}
          disabled={loading}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Name</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Code</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Warehouse</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBins.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">
                  No bin locations found.
                </td>
              </tr>
            ) : (
              filteredBins.map((bin) => (
                <tr key={bin.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{bin.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{bin.code ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{warehouseMap.get(bin.warehouseId) ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${bin.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {bin.isActive ? 'Active' : 'Inactive'}
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
