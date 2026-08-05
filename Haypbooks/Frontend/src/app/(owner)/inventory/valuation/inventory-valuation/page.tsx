'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { BarChart3, RefreshCw, Search } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { inventoryService } from '@/services/inventory.service'
import { formatCurrency } from '@/lib/format'

export default function InventoryValuationPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [stockSummary, setStockSummary] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchSummary = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const { data } = await inventoryService.getStockSummary(companyId)
      const stockSummaryData: any[] = Array.isArray(data) ? data : (data?.data ?? [])
      setStockSummary(stockSummaryData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load inventory valuation')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchSummary()
  }, [companyId, companyLoading, fetchSummary])

  const kpis = useMemo(() => {
    const totalItems = stockSummary.length
    const totalQty = stockSummary.reduce((sum: number, item: any) => sum + item.totalQty, 0)
    const totalReserved = stockSummary.reduce((sum: number, item: any) => sum + item.reservedQty, 0)
    const totalStockValue = stockSummary.reduce(
      (sum: number, item: any) => sum + (item.totalQty * Number(item.salesPrice || 0)),
      0,
    )

    return { totalItems, totalQty, totalReserved, totalStockValue }
  }, [stockSummary])

  const filtered = useMemo(() => {
    const result = stockSummary.filter((item: any) => {
      if (!search) return true
      const q = search.toLowerCase()
      return item.name?.toLowerCase().includes(q) || item.sku?.toLowerCase().includes(q)
    })

    result.sort((a: any, b: any) => {
      const valA = a.totalQty * Number(a.salesPrice || 0)
      const valB = b.totalQty * Number(b.salesPrice || 0)
      return valB - valA
    })

    return result
  }, [stockSummary, search])

  if (companyLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Inventory Valuation</h2>
        </div>
        <button
          type="button"
          title="Refresh"
          onClick={() => fetchSummary()}
          disabled={loading}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Stock Value</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(kpis.totalStockValue, currency)}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Items</p>
          <p className="text-xl font-bold text-slate-800">{kpis.totalItems.toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Qty on Hand</p>
          <p className="text-xl font-bold text-slate-800">{kpis.totalQty.toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Reserved</p>
          <p className="text-xl font-bold text-slate-800">{kpis.totalReserved.toLocaleString()}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by item name or SKU..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
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
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SKU</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ITEM NAME</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SALES PRICE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TOTAL QTY</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">RESERVED</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">AVAILABLE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STOCK VALUE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">LOCATIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                  No inventory data found
                </td>
              </tr>
            ) : (
              filtered.map((item: any) => {
                const available = item.totalQty - item.reservedQty
                const locationName = item.locations?.[0]?.location?.name || '—'
                const moreCount = (item.locations?.length || 0) - 1
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{item.sku || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(Number(item.salesPrice || 0), currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.totalQty.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.reservedQty.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-sm ${available <= 0 ? 'text-rose-600 font-medium' : 'text-slate-700'}`}>
                      {available.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(item.totalQty * Number(item.salesPrice || 0), currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {locationName}
                      {moreCount > 0 && (
                        <span className="text-[11px] text-slate-400 ml-1">+{moreCount} more</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
