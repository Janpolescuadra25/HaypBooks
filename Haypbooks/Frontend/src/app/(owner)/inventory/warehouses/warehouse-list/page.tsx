'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Warehouse } from 'lucide-react'
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
          <Warehouse className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Warehouses</h2>
        </div>
        <button
          type="button"
          onClick={fetchLocations}
          disabled={loading}
          title="Refresh"
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      {locations.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">No warehouses found.</div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Default</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{loc.name}</td>
                    <td className="px-4 py-3 text-slate-700">{loc.description ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${loc.isDefault ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {loc.isDefault ? 'Default' : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{new Date(loc.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
