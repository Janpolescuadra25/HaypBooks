'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Package, Wrench, Tag, Pencil, Trash2, Loader2, AlertCircle, RefreshCw, Clock } from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn, HaypActionItem } from '@/components/shared/HaypDataTable.types'
import ProductFormModal from './ProductFormModal'

export interface Item {
  id: string
  sku: string | null
  name: string
  description?: string | null
  type: string        // e.g. PRODUCT | SERVICE | INVENTORY | BUNDLE
  category: string | null
  unit: string | null
  status: string
  salesPrice: number | null
  purchaseCost: number | null
  trackingType: string | null
  deletedAt: string | null
  stockLevels?: { quantity: number }[]
  [key: string]: any
}

type FilterType = 'ALL' | 'PRODUCT' | 'SERVICE' | 'INVENTORY' | 'BUNDLE'

export const extractItems = (payload: any): Item[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

export const extractTotal = (payload: any): number => {
  if (typeof payload?.total === 'number') return payload.total
  return extractItems(payload).length
}

export default function ProductsServicesPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL')
  const [modalItem, setModalItem] = useState<Item | null | 'new'>(null)

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const response = await salesService.listInventoryItems(companyId, { limit: 9999 })
      setItems(extractItems(response.data))
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = useCallback(async (item: Item) => {
    if (!companyId) return
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    setLoading(true)
    try {
      await salesService.deleteInventoryItem(companyId, item.id)
      toast.success('Item deleted')
      fetchData()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to delete item')
    } finally {
      setLoading(false)
      setModalItem(null)
    }
  }, [companyId, fetchData, toast])

  const handleSaved = useCallback(async (saved: Item) => {
    setModalItem(null)
    await fetchData()
  }, [fetchData])

  const filteredItems = useMemo(() => {
    if (typeFilter === 'ALL') return items
    return items.filter((item) => item.type === typeFilter)
  }, [items, typeFilter])

  const totalStock = useMemo(
    () => items.reduce((sum, item) => sum + (item.stockLevels?.reduce((s, level) => s + (level.quantity ?? 0), 0) ?? 0), 0),
    [items],
  )

  const productCount = useMemo(
    () => items.filter((i) => i.type === 'PRODUCT' || i.type === 'INVENTORY').length,
    [items],
  )

  const serviceCount = useMemo(
    () => items.filter((i) => i.type === 'SERVICE').length,
    [items],
  )

  const typeLabel = useCallback((type: string) => {
    const map: Record<string, string> = { PRODUCT: 'Product', SERVICE: 'Service', INVENTORY: 'Inventory', BUNDLE: 'Bundle' }
    return map[type] ?? type
  }, [])

  const typeColor = useCallback((type: string) => {
    const map: Record<string, string> = {
      PRODUCT: 'bg-blue-50 text-blue-700 border border-blue-200',
      SERVICE: 'bg-purple-50 text-purple-700 border border-purple-200',
      INVENTORY: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      BUNDLE: 'bg-amber-50 text-amber-700 border border-amber-200',
    }
    return map[type] ?? 'bg-slate-50 text-slate-600 border border-slate-200'
  }, [])

  const columns = useMemo<HaypColumn<Item>[]>(() => [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      size: 220,
    },
    {
      id: 'description',
      header: 'Description',
      accessorKey: 'description',
      size: 240,
      render: (value: any) => value ? <span className="block text-slate-500 text-sm truncate" title={String(value)}>{String(value)}</span> : <span className="text-slate-300">—</span>,
    },
    {
      id: 'sku',
      header: 'SKU',
      accessorKey: 'sku',
      size: 120,
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      size: 130,
      render: (_value: any, row: Item) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${typeColor(row.type)}`}>
          {typeLabel(row.type)}
        </span>
      ),
    },
    {
      id: 'salesPrice',
      header: 'Sales Price',
      accessorKey: 'salesPrice',
      size: 120,
      align: 'right',
      render: (value: any) => formatCurrency(value, currency),
    },
    {
      id: 'purchaseCost',
      header: 'Cost',
      accessorKey: 'purchaseCost',
      size: 120,
      align: 'right',
      render: (value: any) => formatCurrency(value, currency),
    },
    {
      id: 'stock',
      header: 'In Stock',
      accessorKey: 'stockLevels',
      size: 110,
      align: 'right',
      render: (_value: any, row: Item) => {
        const stockQty = row.stockLevels?.reduce((sum, level) => sum + (level.quantity ?? 0), 0) ?? 0
        return row.type === 'SERVICE' ? <span className="text-xs text-slate-400 italic">N/A</span> : <span className={`font-semibold ${stockQty <= 0 ? 'text-red-500' : 'text-slate-700'}`}>{stockQty}</span>
      },
    },
  ], [currency, typeColor, typeLabel])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      onClick: (_rowId, row) => setModalItem(row),
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      onClick: async (_rowId, row) => { await handleDelete(row) },
    },
  ], [handleDelete])

  const stats = useMemo(() => [
    { icon: Tag, label: 'Total Items', value: items.length, color: 'slate' },
    { icon: Package, label: 'Products', value: productCount, color: 'blue' },
    { icon: Wrench, label: 'Services', value: serviceCount, color: 'purple' },
    { icon: Package, label: 'Units in Stock', value: totalStock, color: 'emerald' },
  ], [items.length, productCount, serviceCount, totalStock])

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => router.push('/sales/opportunities/products-services/activity')}
        className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-100 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
      >
        <Clock size={14} /> Activity Log
      </button>
      <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
        {(['ALL', 'PRODUCT', 'SERVICE', 'INVENTORY', 'BUNDLE'] as FilterType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${typeFilter === type ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {type === 'ALL' ? 'All' : typeLabel(type)}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setModalItem('new')}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        <Plus size={14} /> New Item
      </button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 space-y-4">
        {error && (
          <div className="mb-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <HaypDataTable
          data={filteredItems}
          columns={columns}
          tableId="products-services"
          title="Products & Services"
          description="Create and manage your product, service, inventory, and bundle items."
          loading={loading}
          searchPlaceholder="Search products and services..."
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          headerActions={headerActions}
          primaryAction={
            <button
              type="button"
              onClick={() => setModalItem('new')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={14} /> Add Product
            </button>
          }
          stats={stats}
          onRefresh={fetchData}
          actions={actions}
          onRowClick={(row) => router.push(`/sales/opportunities/products-services/${row.id}`)}
          emptyTitle="No products or services"
          emptySubtitle="Add your first product or service to get started."
        />

      {modalItem !== null && (
        <ProductFormModal
          item={modalItem === 'new' ? null : modalItem}
          onSaved={handleSaved}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  )
}
