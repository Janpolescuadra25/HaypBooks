'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Layers } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { inventoryService } from '@/services/inventory.service'

export default function UnitsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUnits = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await inventoryService.listUOM(companyId)
      setUnits(Array.isArray(data) ? data : (data?.data ?? []))
    } catch (err: any) {
      setError(err?.message || 'Failed to load units of measure')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchUnits()
  }, [companyId, companyLoading, fetchUnits])

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
          <Layers className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Units of Measure</h2>
        </div>
        <button
          type="button"
          onClick={fetchUnits}
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

      {units.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">No units of measure found.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Name</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Abbreviation</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{unit.name}</td>
                    <td className="px-4 py-3 text-slate-700">{unit.abbreviation ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${unit.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {unit.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
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
