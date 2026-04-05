'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import type { Item } from './ProductsServicesPage'

interface Props {
  item: Item | null   // null = create new
  onSaved: (saved: Item) => void
  onClose: () => void
}

const ITEM_TYPES = [
  { value: 'PRODUCT', label: 'Product' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'INVENTORY', label: 'Inventory (tracked)' },
  { value: 'BUNDLE', label: 'Bundle' },
]

export default function ProductFormModal({ item, onSaved, onClose }: Props) {
  const { companyId } = useCompanyId()
  const isEdit = !!item

  const [name, setName] = useState(item?.name ?? '')
  const [type, setType] = useState(item?.type ?? 'SERVICE')
  const [sku, setSku] = useState(item?.sku ?? '')
  const [salesPrice, setSalesPrice] = useState(item?.salesPrice != null ? String(item.salesPrice) : '')
  const [purchaseCost, setPurchaseCost] = useState(item?.purchaseCost != null ? String(item.purchaseCost) : '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Focus name on mount
  useEffect(() => {
    setTimeout(() => document.getElementById('item-name-input')?.focus(), 50)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    if (!name.trim()) { setError('Name is required.'); return }

    setSaving(true)
    setError('')
    try {
      const payload = {
        name: name.trim(),
        type,
        sku: sku.trim() || null,
        salesPrice: salesPrice !== '' ? parseFloat(salesPrice) : null,
        purchaseCost: purchaseCost !== '' ? parseFloat(purchaseCost) : null,
      }

      let saved: Item
      if (isEdit) {
        const { data } = await apiClient.put(`/companies/${companyId}/inventory/items/${item.id}`, payload)
        saved = data
      } else {
        const { data } = await apiClient.post(`/companies/${companyId}/inventory/items`, payload)
        saved = data
      }
      onSaved(saved)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to save item.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? `Edit "${item.name}"` : 'New Product / Service'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {ITEM_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold border transition-colors text-left ${
                    type === t.value
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="item-name-input" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              id="item-name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Web Design Services"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              required
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">SKU / Code</label>
            <input
              value={sku}
              onChange={e => setSku(e.target.value)}
              placeholder="Optional — e.g. WD-001"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>

          {/* Price / Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sales Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={salesPrice}
                  onChange={e => setSalesPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-6 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 tabular-nums"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Purchase Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={purchaseCost}
                  onChange={e => setPurchaseCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-6 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 tabular-nums"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-lg transition-colors shadow-sm"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Item'}
          </button>
        </div>
      </div>
    </div>
  )
}
