'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search, Trash2, RefreshCw, Download, Tag, X, ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriceList {
  id: string
  name: string
  currency: string
  isDefault: boolean
  description: string | null
  status: string
  startDate: string | null
  endDate: string | null
  customerGroup: { id: string; name: string } | null
  entryCount: number
  createdAt: string
  updatedAt: string
}

interface InventoryItem {
  id: string
  name: string
  sku: string | null
  salesPrice: string | null
}

interface EntryForm {
  itemId: string
  itemName: string
  itemSku: string
  standardPrice: string
  unitPrice: string
  discountPct: string
  minQuantity: string
}

interface PriceListForm {
  name: string
  currency: string
  description: string
  status: string
  isDefault: boolean
  startDate: string
  endDate: string
  customerGroupId: string
  entries: EntryForm[]
}

interface CustomerGroup {
  id: string
  name: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY = 'sales-price-lists-column-widths'
const DEFAULT_COLS = [40, 220, 110, 90, 90, 160, 90, 120, 120, 110]
const COL_HEADERS = ['', 'Name', 'Status', 'Currency', 'Default', 'Customer Group', 'Products', 'Start Date', 'End Date', 'Actions']
const PAGE_SIZE = 50

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'MXN', 'BRL', 'INR', 'SGD']

function fmt(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function PriceListModal({
  initial,
  customerGroups,
  companyId,
  onSave,
  onClose,
}: {
  initial: PriceList | null
  customerGroups: CustomerGroup[]
  companyId: string
  onSave: () => void
  onClose: () => void
}) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [itemSearch, setItemSearch] = useState('')
  const [itemResults, setItemResults] = useState<InventoryItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const itemSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [form, setForm] = useState<PriceListForm>({
    name: initial?.name ?? '',
    currency: initial?.currency ?? 'USD',
    description: initial?.description ?? '',
    status: initial?.status ?? 'ACTIVE',
    isDefault: initial?.isDefault ?? false,
    startDate: initial?.startDate ? initial.startDate.slice(0, 10) : '',
    endDate: initial?.endDate ? initial.endDate.slice(0, 10) : '',
    customerGroupId: initial?.customerGroup?.id ?? '',
    entries: [],
  })

  // Load existing entries when editing
  useEffect(() => {
    if (!initial) return
    apiClient.get(`/companies/${companyId}/ar/price-lists/${initial.id}`).then(({ data }) => {
      if (data?.entries?.length) {
        setForm(f => ({
          ...f,
          entries: data.entries.map((e: any) => ({
            itemId: e.item.id,
            itemName: e.item.name,
            itemSku: e.item.sku ?? '',
            standardPrice: e.item.salesPrice ?? '0',
            unitPrice: String(e.unitPrice ?? ''),
            discountPct: String(e.discountPct ?? '0'),
            minQuantity: String(e.minQuantity ?? '1'),
          })),
        }))
      }
    }).catch(() => {})
  }, [initial, companyId])

  const searchItems = useCallback((q: string) => {
    if (itemSearchRef.current) clearTimeout(itemSearchRef.current)
    if (!q.trim()) { setItemResults([]); return }
    itemSearchRef.current = setTimeout(async () => {
      setLoadingItems(true)
      try {
        const { data } = await apiClient.get(`/companies/${companyId}/inventory/items`, { params: { search: q, limit: 20 } })
        setItemResults(Array.isArray(data) ? data : data?.data ?? [])
      } catch { setItemResults([]) }
      finally { setLoadingItems(false) }
    }, 300)
  }, [companyId])

  useEffect(() => { searchItems(itemSearch) }, [itemSearch, searchItems])

  function addEntry(item: InventoryItem) {
    if (form.entries.some(e => e.itemId === item.id)) return
    setForm(f => ({
      ...f,
      entries: [...f.entries, {
        itemId: item.id, itemName: item.name, itemSku: item.sku ?? '',
        standardPrice: item.salesPrice ?? '0', unitPrice: item.salesPrice ?? '',
        discountPct: '0', minQuantity: '1',
      }],
    }))
    setItemSearch('')
    setItemResults([])
  }

  function removeEntry(itemId: string) {
    setForm(f => ({ ...f, entries: f.entries.filter(e => e.itemId !== itemId) }))
  }

  function updateEntry(itemId: string, field: keyof EntryForm, value: string) {
    setForm(f => ({
      ...f,
      entries: f.entries.map(e => e.itemId === itemId ? { ...e, [field]: value } : e),
    }))
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.currency) { toast.error('Currency is required'); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        currency: form.currency,
        description: form.description.trim() || null,
        status: form.status,
        isDefault: form.isDefault,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        customerGroupId: form.customerGroupId || null,
        entries: form.entries.map(e => ({
          itemId: e.itemId,
          unitPrice: parseFloat(e.unitPrice) || 0,
          discountPct: parseFloat(e.discountPct) || 0,
          minQuantity: parseFloat(e.minQuantity) || 1,
        })),
      }
      if (initial) {
        await apiClient.put(`/companies/${companyId}/ar/price-lists/${initial.id}`, payload)
        toast.success('Price list updated')
      } else {
        await apiClient.post(`/companies/${companyId}/ar/price-lists`, payload)
        toast.success('Price list created')
      }
      onSave()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{initial ? 'Edit Price List' : 'New Price List'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Name + Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Name <span className="text-rose-500">*</span></label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Wholesale Price List"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Currency <span className="text-rose-500">*</span></label>
              <select
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Optional description"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Status + Default */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                  className="accent-blue-600 w-4 h-4"
                />
                Set as default price list
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Customer Group */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Group</label>
            <select
              value={form.customerGroupId}
              onChange={e => setForm(f => ({ ...f, customerGroupId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— No group —</option>
              {customerGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          {/* Products / Entries */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Products &amp; Pricing</label>

            {/* Item search */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={itemSearch}
                onChange={e => setItemSearch(e.target.value)}
                placeholder="Search products to add…"
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {loadingItems && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {itemResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {itemResults.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addEntry(item)}
                      disabled={form.entries.some(e => e.itemId === item.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed border-b border-slate-100 last:border-0"
                    >
                      <span className="font-medium text-slate-800">{item.name}</span>
                      {item.sku && <span className="ml-2 text-xs text-slate-500">SKU: {item.sku}</span>}
                      {item.salesPrice && <span className="ml-2 text-xs text-slate-500">${parseFloat(item.salesPrice).toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Entries table */}
            {form.entries.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-slate-600">Product</th>
                      <th className="text-right px-3 py-2 font-semibold text-slate-600">Std. Price</th>
                      <th className="text-right px-3 py-2 font-semibold text-slate-600">Unit Price</th>
                      <th className="text-right px-3 py-2 font-semibold text-slate-600">Disc. %</th>
                      <th className="text-right px-3 py-2 font-semibold text-slate-600">Min Qty</th>
                      <th className="px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {form.entries.map(entry => (
                      <tr key={entry.itemId} className="border-t border-slate-100">
                        <td className="px-3 py-2">
                          <div className="font-medium text-slate-800 truncate max-w-[140px]">{entry.itemName}</div>
                          {entry.itemSku && <div className="text-slate-400">{entry.itemSku}</div>}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-500">
                          {entry.standardPrice ? `$${parseFloat(entry.standardPrice).toFixed(2)}` : '—'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={entry.unitPrice}
                            onChange={e => updateEntry(entry.itemId, 'unitPrice', e.target.value)}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-right text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={entry.discountPct}
                            onChange={e => updateEntry(entry.itemId, 'discountPct', e.target.value)}
                            className="w-16 px-2 py-1 border border-slate-300 rounded text-right text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={entry.minQuantity}
                            onChange={e => updateEntry(entry.itemId, 'minQuantity', e.target.value)}
                            className="w-14 px-2 py-1 border border-slate-300 rounded text-right text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.itemId)}
                            className="p-1 rounded hover:bg-rose-50 text-rose-400 hover:text-rose-600"
                          >
                            <X size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {form.entries.length === 0 && (
              <p className="text-xs text-slate-400 italic">No products added yet. Search above to add pricing rules.</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
            {initial ? 'Save Changes' : 'Create Price List'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PriceListsPage() {
  const router = useRouter()
  const { companyId, loading: companyLoading } = useCompanyId()
  const toast = useToast()

  const [priceLists, setPriceLists] = useState<PriceList[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PriceList | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<PriceList | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [batchDeleting, setBatchDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!companyId) return
    const editId = searchParams.get('edit')
    if (!editId) return
    if (modalOpen && editing?.id === editId) return

    const existing = priceLists.find(pl => pl.id === editId)
    if (existing) {
      setEditing(existing)
      setModalOpen(true)
      router.replace('/sales/customers/price-lists')
      return
    }

    apiClient.get(`/companies/${companyId}/ar/price-lists/${editId}`)
      .then(({ data }) => {
        setEditing(data)
        setModalOpen(true)
      })
      .catch(() => {})
      .finally(() => {
        router.replace('/sales/customers/price-lists')
      })
  }, [companyId, editing?.id, modalOpen, priceLists, router, searchParams])

  // Column widths
  const [colWidths, setColWidths] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '') } catch { return DEFAULT_COLS }
  })
  const dragState = useRef<{ col: number; startX: number; startW: number } | null>(null)

  function startResize(e: React.MouseEvent, col: number) {
    e.preventDefault()
    dragState.current = { col, startX: e.clientX, startW: colWidths[col] }
    const onMove = (me: MouseEvent) => {
      if (!dragState.current) return
      const diff = me.clientX - dragState.current.startX
      setColWidths(prev => {
        const next = [...prev]
        next[dragState.current!.col] = Math.max(40, dragState.current!.startW + diff)
        return next
      })
    }
    const onUp = () => {
      setColWidths(prev => { localStorage.setItem(LS_KEY, JSON.stringify(prev)); return prev })
      dragState.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const fetchPriceLists = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/price-lists`, {
        params: { search: search || undefined, status: statusFilter || undefined, limit: PAGE_SIZE, offset: page * PAGE_SIZE },
      })
      setPriceLists(data?.data ?? [])
      setTotal(data?.total ?? 0)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load price lists')
    } finally {
      setLoading(false)
    }
  }, [companyId, search, statusFilter, page])

  const fetchCustomerGroups = useCallback(async () => {
    if (!companyId) return
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customer-groups`)
      setCustomerGroups(Array.isArray(data) ? data : data?.data ?? [])
    } catch { setCustomerGroups([]) }
  }, [companyId])

  useEffect(() => { fetchPriceLists() }, [fetchPriceLists])
  useEffect(() => { fetchCustomerGroups() }, [fetchCustomerGroups])

  const allSelected = priceLists.length > 0 && priceLists.every(pl => selected.has(pl.id))

  function toggleAll() {
    setSelected(prev => {
      if (allSelected) return new Set()
      return new Set(priceLists.map(pl => pl.id))
    })
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function handleDelete(pl: PriceList) {
    setDeleting(true)
    try {
      await apiClient.delete(`/companies/${companyId}/ar/price-lists/${pl.id}`)
      toast.success('Price list deleted')
      setDeleteConfirm(null)
      setSelected(prev => { const next = new Set(prev); next.delete(pl.id); return next })
      fetchPriceLists()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  async function handleBatchDelete() {
    if (!selected.size) return
    setBatchDeleting(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/price-lists/batch/delete`, { ids: Array.from(selected) })
      toast.success(`${selected.size} price list(s) deleted`)
      setSelected(new Set())
      fetchPriceLists()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Batch delete failed')
    } finally {
      setBatchDeleting(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/price-lists/export`)
      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'price-lists.csv'; a.click()
      URL.revokeObjectURL(url)
      toast.success('Export downloaded')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(pl: PriceList, e: React.MouseEvent) { e.stopPropagation(); setEditing(pl); setModalOpen(true) }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (companyLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Price Lists</h1>
            <p className="text-sm text-slate-500 mt-0.5">Define custom pricing for customer groups and regions</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download size={14} />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
            <button
              onClick={() => fetchPriceLists()}
              disabled={loading}
              className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm"
            >
              <Plus size={14} />
              New Price List
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search price lists…"
              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <span className="text-sm text-slate-500 ml-auto">{total} price list{total !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Batch action bar */}
      {selected.size > 0 && (
        <div className="sticky top-[105px] z-20 bg-emerald-600 text-white px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <button
            onClick={handleBatchDelete}
            disabled={batchDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Trash2 size={13} />
            {batchDeleting ? 'Deleting…' : 'Delete Selected'}
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-sm underline opacity-80 hover:opacity-100">
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 px-6 py-5 overflow-x-auto">
        {error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
            <p className="text-rose-600 font-medium mb-2">{error}</p>
            <button onClick={fetchPriceLists} className="text-sm text-emerald-600 hover:underline">Retry</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: colWidths.reduce((a, b) => a + b, 0) }}>
              <colgroup>
                {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
              </colgroup>
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs font-semibold">
                  {COL_HEADERS.map((h, i) => (
                    <th key={i} className="relative px-3 py-3 text-left select-none" style={{ width: colWidths[i] }}>
                      {i === 0 ? (
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          className="accent-blue-600 w-4 h-4"
                        />
                      ) : h}
                      {i < COL_HEADERS.length - 1 && (
                        <div
                          onMouseDown={e => startResize(e, i)}
                          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-emerald-400 opacity-0 hover:opacity-100 transition-opacity"
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={COL_HEADERS.length} className="px-4 py-12 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading…
                    </td>
                  </tr>
                ) : priceLists.length === 0 ? (
                  <tr>
                    <td colSpan={COL_HEADERS.length} className="px-4 py-16 text-center">
                      <Tag size={36} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium">No price lists found</p>
                      <p className="text-slate-400 text-xs mt-1">Create your first price list to define custom pricing.</p>
                      <button onClick={openCreate} className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg">
                        New Price List
                      </button>
                    </td>
                  </tr>
                ) : (
                  priceLists.map(pl => (
                    <tr
                      key={pl.id}
                      className="border-t border-slate-100 hover:bg-blue-50/30 cursor-pointer transition-colors"
                      onClick={() => router.push(`/sales/customers/price-lists/${pl.id}`)}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3" onClick={e => { e.stopPropagation(); toggleOne(pl.id) }}>
                        <input type="checkbox" checked={selected.has(pl.id)} onChange={() => toggleOne(pl.id)} className="accent-blue-600 w-4 h-4" />
                      </td>
                      {/* Name */}
                      <td className="px-3 py-3">
                        <span className="font-medium text-slate-900 hover:text-emerald-700 truncate block">{pl.name}</span>
                        {pl.description && <span className="text-xs text-slate-400 truncate block">{pl.description}</span>}
                      </td>
                      {/* Status */}
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${pl.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {pl.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* Currency */}
                      <td className="px-3 py-3 text-slate-600">{pl.currency}</td>
                      {/* Default */}
                      <td className="px-3 py-3">
                        {pl.isDefault ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Default</span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      {/* Customer Group */}
                      <td className="px-3 py-3 text-slate-600 truncate">{pl.customerGroup?.name ?? '—'}</td>
                      {/* Products */}
                      <td className="px-3 py-3 text-slate-600 text-center">{pl.entryCount}</td>
                      {/* Start Date */}
                      <td className="px-3 py-3 text-slate-500 text-xs">{fmt(pl.startDate)}</td>
                      {/* End Date */}
                      <td className="px-3 py-3 text-slate-500 text-xs">{fmt(pl.endDate)}</td>
                      {/* Actions */}
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={e => openEdit(pl, e)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                            title="Edit"
                          >
                            <Tag size={13} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setDeleteConfirm(pl) }}
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <PriceListModal
          initial={editing}
          customerGroups={customerGroups}
          companyId={companyId!}
          onSave={() => { setModalOpen(false); fetchPriceLists() }}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Price List?</h3>
            <p className="text-sm text-slate-600 mb-5">
              Are you sure you want to delete <span className="font-semibold">&quot;{deleteConfirm.name}&quot;</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={deleting} className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
