'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { inventoryService } from '@/services/inventory.service'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ReorderPointsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [rules, setRules] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const [rulesResp, itemsResp, locsResp] = await Promise.all([
        inventoryService.listReorderRules(companyId),
        inventoryService.listItems(companyId, { limit: 999 }),
        inventoryService.listLocations(companyId),
      ])

      const rulesData = Array.isArray(rulesResp.data) ? rulesResp.data : (rulesResp.data?.data ?? [])
      const itemsData = itemsResp.data?.data ?? []
      const locsData = Array.isArray(locsResp.data) ? locsResp.data : (locsResp.data?.data ?? [])

      setRules(rulesData)
      setItems(itemsData)
      setLocations(locsData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load reorder points')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchData()
  }, [companyId, companyLoading, fetchData])

  const itemMap = useMemo(
    () => new Map(items.map((item: any) => [item.id, { name: item.name, sku: item.sku }])),
    [items],
  )

  const warehouseMap = useMemo(
    () => new Map(locations.map((l: any) => [l.id, l.name])),
    [locations],
  )

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
          <AlertTriangle className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Reorder Points</h2>
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

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
        {rules.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-slate-400">No reorder rules found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Warehouse</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Reorder Point</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Safety Stock</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Reorder Qty</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Max Stock</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Lead Time</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule) => {
                  const item = itemMap.get(rule.itemId)
                  const itemLabel = item ? `${item.name}${item.sku ? ` (${item.sku})` : ''}` : '—'
                  const warehouseLabel = rule.warehouseId ? warehouseMap.get(rule.warehouseId) ?? '—' : 'All'
                  const reorderPoint = Number(rule.reorderPoint)
                  const safetyStockLevel = Number(rule.safetyStockLevel)
                  const reorderQty = Number(rule.reorderQty)
                  const maxStockLevel = rule.maxStockLevel ? Number(rule.maxStockLevel) : null

                  return (
                    <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{itemLabel}</td>
                      <td className="px-4 py-3 text-slate-700">{warehouseLabel}</td>
                      <td className="px-4 py-3 text-slate-700">{reorderPoint}</td>
                      <td className="px-4 py-3 text-slate-700">{safetyStockLevel}</td>
                      <td className="px-4 py-3 text-slate-700">{reorderQty}</td>
                      <td className="px-4 py-3 text-slate-700">{maxStockLevel !== null ? maxStockLevel : '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{rule.leadTimeDays ? `${rule.leadTimeDays} days` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${rule.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
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
