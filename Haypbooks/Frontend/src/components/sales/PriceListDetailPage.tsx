'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit2, Trash2, Tag, Package } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriceListEntry {
  id: string
  unitPrice: string
  discountPct: string
  minQuantity: string
  item: {
    id: string
    name: string
    sku: string | null
    salesPrice: string | null
  }
}

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
  entries: PriceListEntry[]
  createdAt: string
  updatedAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function money(val: string | number | null, currency = 'USD') {
  if (val === null || val === undefined) return '—'
  const n = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(n)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: 2 }).format(n)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PriceListDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const toast = useToast()

  const [priceList, setPriceList] = useState<PriceList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchPriceList = useCallback(async () => {
    if (!companyId || !id) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/price-lists/${id}`)
      setPriceList(data)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load price list')
    } finally {
      setLoading(false)
    }
  }, [companyId, id])

  useEffect(() => { fetchPriceList() }, [fetchPriceList])

  async function handleDelete() {
    if (!companyId || !priceList) return
    setDeleting(true)
    try {
      await apiClient.delete(`/companies/${companyId}/ar/price-lists/${priceList.id}`)
      toast.success('Price list deleted')
      router.push('/sales/customers/price-lists')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Delete failed')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !priceList) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <p className="text-rose-600 font-medium">{error || 'Price list not found'}</p>
        <button onClick={() => router.push('/sales/customers/price-lists')} className="text-sm text-emerald-600 hover:underline">
          ← Back to Price Lists
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/sales/customers/price-lists')}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{priceList.name}</h1>
              <p className="text-sm text-slate-500">Price List Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/sales/customers/price-lists?edit=${priceList.id}`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Edit2 size={14} />
              Edit
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-300 text-rose-600 text-sm hover:bg-rose-50"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Tag size={22} className="text-emerald-600" />
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Status</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${priceList.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {priceList.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Currency</p>
                <p className="text-sm font-medium text-slate-900">{priceList.currency}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Default</p>
                <p className="text-sm font-medium text-slate-900">{priceList.isDefault ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Customer Group</p>
                <p className="text-sm font-medium text-slate-900">{priceList.customerGroup?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Start Date</p>
                <p className="text-sm font-medium text-slate-900">{fmt(priceList.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">End Date</p>
                <p className="text-sm font-medium text-slate-900">{fmt(priceList.endDate)}</p>
              </div>
              {priceList.description && (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-slate-700">{priceList.description}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Created</p>
                <p className="text-sm text-slate-500">{fmt(priceList.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Last Updated</p>
                <p className="text-sm text-slate-500">{fmt(priceList.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Entries */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Package size={16} className="text-slate-500" />
            <h2 className="text-base font-semibold text-slate-800">Product Pricing</h2>
            <span className="ml-auto text-sm text-slate-500">{priceList.entries.length} product{priceList.entries.length !== 1 ? 's' : ''}</span>
          </div>
          {priceList.entries.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <Package size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No products added to this price list yet.</p>
              <p className="text-slate-400 text-xs mt-1">Edit the price list to add product-specific pricing rules.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 text-xs">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">SKU</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs">Standard Price</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs">Custom Price</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs">Discount %</th>
                  <th className="text-right px-6 py-3 font-semibold text-slate-600 text-xs">Min Qty</th>
                </tr>
              </thead>
              <tbody>
                {priceList.entries.map((entry, idx) => {
                  const effPrice = parseFloat(entry.unitPrice)
                  const stdPrice = entry.item.salesPrice ? parseFloat(entry.item.salesPrice) : null
                  const savings = stdPrice && effPrice < stdPrice ? stdPrice - effPrice : null
                  return (
                    <tr key={entry.id} className={`border-t border-slate-100 ${idx % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                      <td className="px-6 py-3 font-medium text-slate-900">{entry.item.name}</td>
                      <td className="px-4 py-3 text-slate-500">{entry.item.sku ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{money(entry.item.salesPrice, priceList.currency)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-900">{money(entry.unitPrice, priceList.currency)}</span>
                        {savings !== null && savings > 0 && (
                          <span className="ml-2 text-xs text-emerald-600">-{money(savings, priceList.currency)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {parseFloat(entry.discountPct) > 0 ? `${parseFloat(entry.discountPct).toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-6 py-3 text-right text-slate-600">{parseFloat(entry.minQuantity).toFixed(0)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Price List?</h3>
            <p className="text-sm text-slate-600 mb-5">
              Are you sure you want to delete <span className="font-semibold">&quot;{priceList.name}&quot;</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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
