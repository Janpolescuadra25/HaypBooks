'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, PackageOpen, BellRing } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { inventoryService } from '@/services/inventory.service'

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reorder Points</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage automatic reorder thresholds for inventory items</p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <BellRing className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
        ) : !rules.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <BellRing className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No reorder rules found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Item</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Warehouse</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Reorder Point</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Safety Stock</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Reorder Qty</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Max Stock</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Lead Time</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Active</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => {
                  const item = itemMap.get(rule.itemId)
                  const itemLabel = item ? `${item.name}${item.sku ? ` (${item.sku})` : ''}` : '—'
                  const warehouseLabel = rule.warehouseId ? warehouseMap.get(rule.warehouseId) ?? '—' : 'All'
                  const reorderPoint = Number(rule.reorderPoint)
                  const safetyStockLevel = Number(rule.safetyStockLevel)
                  const reorderQty = Number(rule.reorderQty)
                  const maxStockLevel = rule.maxStockLevel ? Number(rule.maxStockLevel) : null

                  return (
                    <tr key={rule.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-900">{itemLabel}</td>
                      <td className="px-5 py-4 text-slate-700">{warehouseLabel}</td>
                      <td className="px-5 py-4 text-slate-700">{reorderPoint}</td>
                      <td className="px-5 py-4 text-slate-700">{safetyStockLevel}</td>
                      <td className="px-5 py-4 text-slate-700">{reorderQty}</td>
                      <td className="px-5 py-4 text-slate-700">{maxStockLevel !== null ? maxStockLevel : '—'}</td>
                      <td className="px-5 py-4 text-slate-700">{rule.leadTimeDays ? `${rule.leadTimeDays} days` : '—'}</td>
                      <td className="px-5 py-4">
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
