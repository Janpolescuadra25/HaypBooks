'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Search, Plus, MoreHorizontal, Package, Wrench, Tag,
  Pencil, Trash2, Loader2, AlertCircle, X, RefreshCw,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import ProductFormModal from './ProductFormModal'

export interface Item {
  id: string
  sku: string | null
  name: string
  type: string        // e.g. PRODUCT | SERVICE | INVENTORY | BUNDLE
  salesPrice: number | null
  purchaseCost: number | null
  trackingType: string | null
  deletedAt: string | null
  stockLevels?: { quantity: number }[]
}

type FilterType = 'ALL' | 'PRODUCT' | 'SERVICE' | 'INVENTORY' | 'BUNDLE'

export default function ProductsServicesPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number | null) => n == null ? '—' : formatCurrency(n, currency), [currency])

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [modalItem, setModalItem] = useState<Item | null | 'new'>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: '200' })
      if (typeFilter !== 'ALL') params.set('type', typeFilter)
      if (search) params.set('search', search)
      const { data } = await apiClient.get(`/companies/${companyId}/inventory/items?${params}`)
      setItems(Array.isArray(data) ? data : data.items ?? [])
    } catch {
      setError('Failed to load products & services.')
    } finally {
      setLoading(false)
    }
  }, [companyId, typeFilter, search])

  useEffect(() => { fetchItems() }, [fetchItems])

  // Close row menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDelete = useCallback(async (item: Item) => {
    if (!companyId) return
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    setDeletingId(item.id)
    try {
      await apiClient.delete(`/companies/${companyId}/inventory/items/${item.id}`)
      setItems(p => p.filter(i => i.id !== item.id))
    } catch {
      alert('Failed to delete item.')
    } finally {
      setDeletingId(null)
      setOpenMenuId(null)
    }
  }, [companyId])

  const handleSaved = useCallback((saved: Item) => {
    setItems(p => {
      const idx = p.findIndex(i => i.id === saved.id)
      return idx >= 0 ? p.map(i => i.id === saved.id ? saved : i) : [saved, ...p]
    })
    setModalItem(null)
  }, [])

  const totalStock = useMemo(
    () => items.reduce((s, i) => s + (i.stockLevels?.reduce((ss, l) => ss + (l.quantity ?? 0), 0) ?? 0), 0),
    [items],
  )
  const productCount = items.filter(i => i.type === 'PRODUCT' || i.type === 'INVENTORY').length
  const serviceCount = items.filter(i => i.type === 'SERVICE').length

  const typeLabel = (t: string) => {
    const map: Record<string, string> = { PRODUCT: 'Product', SERVICE: 'Service', INVENTORY: 'Inventory', BUNDLE: 'Bundle' }
    return map[t] ?? t
  }
  const typeColor = (t: string) => {
    const map: Record<string, string> = {
      PRODUCT: 'bg-blue-50 text-blue-700 border border-blue-200',
      SERVICE: 'bg-purple-50 text-purple-700 border border-purple-200',
      INVENTORY: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      BUNDLE: 'bg-amber-50 text-amber-700 border border-amber-200',
    }
    return map[t] ?? 'bg-slate-50 text-slate-600 border border-slate-200'
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products &amp; Services</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage items used in invoices and purchases</p>
          </div>
          <button
            onClick={() => setModalItem('new')}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus size={15} /> New Item
          </button>
        </div>

        {/* ── Filters bar ── */}
        <div className="px-6 pb-3 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              placeholder="Search by name or SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>

          {/* Type pills */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {(['ALL', 'PRODUCT', 'SERVICE', 'INVENTORY', 'BUNDLE'] as FilterType[]).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${typeFilter === t ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'ALL' ? 'All' : typeLabel(t)}
              </button>
            ))}
          </div>

          <button onClick={fetchItems} title="Refresh" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── Stats Strip ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Items', value: items.length, icon: Tag, color: 'text-slate-700' },
          { label: 'Products', value: productCount, icon: Package, color: 'text-blue-700' },
          { label: 'Services', value: serviceCount, icon: Wrench, color: 'text-purple-700' },
          { label: 'Units in Stock', value: totalStock, icon: Package, color: 'text-emerald-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <s.icon size={20} className={s.color} />
            <div>
              <div className="text-xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="px-6 pb-8">
        {error && (
          <div className="mb-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
              <Loader2 size={18} className="animate-spin" /> Loading…
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200">Name</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-28">SKU</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-28">Type</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-32">Sales Price</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-32">Cost</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-24">In Stock</th>
                  <th className="w-10 px-2 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-slate-400">
                      <Package size={32} className="mx-auto mb-3 text-slate-300" />
                      <p className="font-medium">No items yet</p>
                      <p className="text-xs mt-1">Click <strong>New Item</strong> to add your first product or service.</p>
                    </td>
                  </tr>
                ) : items.map(row => {
                  const stockQty = row.stockLevels?.reduce((s, l) => s + (l.quantity ?? 0), 0) ?? null
                  const isDeleting = deletingId === row.id
                  return (
                    <tr key={row.id} className={`group border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${isDeleting ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-2.5 text-slate-700 border-r border-gray-100 font-medium">{row.name}</td>
                      <td className="px-4 py-2.5 text-slate-500 border-r border-gray-100 font-mono text-xs">{row.sku ?? '—'}</td>
                      <td className="px-4 py-2.5 border-r border-gray-100">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${typeColor(row.type)}`}>
                          {typeLabel(row.type)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700 border-r border-gray-100 tabular-nums">{fmt(row.salesPrice)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-500 border-r border-gray-100 tabular-nums">{fmt(row.purchaseCost)}</td>
                      <td className="px-4 py-2.5 text-right border-r border-gray-100">
                        {row.type === 'SERVICE' ? (
                          <span className="text-xs text-slate-400 italic">N/A</span>
                        ) : (
                          <span className={`text-sm font-semibold tabular-nums ${(stockQty ?? 0) <= 0 ? 'text-red-500' : 'text-slate-700'}`}>
                            {stockQty ?? 0}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 relative">
                        <div ref={openMenuId === row.id ? menuRef : undefined} className="relative inline-block">
                        <button
                          onClick={() => setOpenMenuId(p => p === row.id ? null : row.id)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {openMenuId === row.id && (
                          <div className="absolute right-2 top-8 z-30 bg-white rounded-xl shadow-xl border border-slate-200 py-1 w-40 text-sm">
                            <button
                              onClick={() => { setModalItem(row); setOpenMenuId(null) }}
                              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-50 text-slate-700"
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(row)}
                              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Create/Edit Modal ─────────────────────────────────────────────────── */}
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
