'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, PackageOpen, Search } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { inventoryService } from '@/services/inventory.service'
import { formatCurrency } from '@/lib/format'

const TYPE_STYLES: Record<string, string> = {
  INVENTORY: 'bg-emerald-50 text-emerald-700',
  NON_INVENTORY: 'bg-slate-100 text-slate-600',
  SERVICE: 'bg-blue-50 text-blue-700',
  BUNDLE: 'bg-amber-50 text-amber-700',
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  INACTIVE: 'bg-rose-50 text-rose-700',
}

const TYPE_OPTIONS = ['ALL', 'INVENTORY', 'NON_INVENTORY', 'SERVICE'] as const
const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'INACTIVE'] as const

export default function ItemListPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [activeType, setActiveType] = useState('ALL')
  const [activeStatus, setActiveStatus] = useState('ALL')

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await inventoryService.listItems(companyId, { limit: 999 })
      setItems(data?.data ?? [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load inventory items')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchItems()
  }, [companyId, companyLoading, fetchItems])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !searchValue ||
        item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchValue.toLowerCase())
      const matchesType = activeType === 'ALL' || item.type === activeType
      const matchesStatus = activeStatus === 'ALL' || item.status === activeStatus
      return matchesSearch && matchesType && matchesStatus
    })
  }, [items, searchValue, activeType, activeStatus])

  const stockOnHand = (item: any) => {
    return item.stockLevels?.reduce((sum: number, lvl: any) => sum + Number(lvl.quantity || 0), 0) ?? 0
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Inventory Items</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your product and service catalog</p>
        </div>
        <button
          type="button"
          onClick={fetchItems}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((type) => {
            const active = activeType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {type}
              </button>
            )
          })}
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
        ) : !filteredItems.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <PackageOpen className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No inventory items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">SKU</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Item Name</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Sales Price</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Purchase Cost</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Stock on Hand</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 text-slate-700">{item.sku ?? '—'}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${TYPE_STYLES[item.type] ?? 'bg-slate-100 text-slate-600'}`}>
                        {item.type ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{item.category ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-900">{item.salesPrice ? formatCurrency(Number(item.salesPrice), currency) : '—'}</td>
                    <td className="px-5 py-3 text-slate-900">{item.purchaseCost ? formatCurrency(Number(item.purchaseCost), currency) : '—'}</td>
                    <td className="px-5 py-3 text-slate-700">{stockOnHand(item)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[item.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {item.status ?? '—'}
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
