'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit2, Trash2, Tag } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import ProductFormModal from '@/components/sales/ProductFormModal'
import { formatCurrency } from '@/lib/format'

interface AuditEntry {
  id: string
  action: string
  changes?: Record<string, any> | null
  createdAt: string
  performedBy?: string | null
}

interface InvoiceSummary {
  id: string
  number: string | null
  date: string
  status: string
  quantity: number
  total: number
}

interface QuoteSummary {
  id: string
  number: string | null
  date: string
  status: string
  quantity: number
  total: number
}

interface ProductDetail {
  id: string
  name: string
  description?: string | null
  sku: string | null
  type: string
  category: string | null
  unit: string | null
  status: string
  trackingType: string | null
  salesPrice: number | null
  purchaseCost: number | null
  stockQty: number | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  soldCount: number
  revenueGenerated: number
  quotedCount: number
  pricingRuleUsageCount: number
  recentInvoices: InvoiceSummary[]
  recentQuotes: QuoteSummary[]
  activity: AuditEntry[]
}

const TAB_OPTIONS = [
  { key: 'overview', label: 'Overview' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'activity', label: 'Activity' },
]

function fmtDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function typeBadge(type: string) {
  return <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{type}</span>
}

export default function ProductDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const toast = useToast()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchProduct = useCallback(async () => {
    if (!companyId || !id) return
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get(`/companies/${companyId}/inventory/items/${id}`)
      const raw = response.data ?? {}
      setProduct({
        ...raw,
        pricingRuleUsageCount: Number(raw.pricingRuleUsageCount ?? raw.usedInPriceLists ?? 0),
      } as ProductDetail)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load item')
    } finally {
      setLoading(false)
    }
  }, [companyId, id])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const handleDelete = useCallback(async () => {
    if (!companyId || !product) return
    setDeleting(true)
    try {
      await apiClient.delete(`/companies/${companyId}/inventory/items/${product.id}`)
      toast.success('Item deleted')
      router.push('/sales/sales/products-services')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Delete failed')
      setDeleting(false)
    }
  }, [companyId, product, router, toast])

  const handleSaved = useCallback(() => {
    setModalOpen(false)
    fetchProduct()
    toast.success('Item updated')
  }, [fetchProduct, toast])

  const salesPrice = useMemo(
    () => product?.salesPrice != null ? formatCurrency(product.salesPrice, 'USD') : '—',
    [product],
  )

  const purchaseCost = useMemo(
    () => product?.purchaseCost != null ? formatCurrency(product.purchaseCost, 'USD') : '—',
    [product],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <p className="text-rose-600 font-semibold mb-3">{error || 'Item not found'}</p>
          <button onClick={() => router.push('/sales/sales/products-services')} className="text-sm text-emerald-600 hover:underline">
            ← Back to Products & Services
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/sales/sales/products-services')}
              aria-label="Back to products"
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              <p className="text-sm text-slate-500">Product & service details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50">
              <Edit2 size={14} /> Edit
            </button>
            <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-rose-300 text-sm text-rose-600 hover:bg-rose-50">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Sales Price</p>
            <p className="text-xl font-semibold text-slate-900">{salesPrice}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Purchase Cost</p>
            <p className="text-xl font-semibold text-slate-900">{purchaseCost}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Revenue Generated</p>
            <p className="text-xl font-semibold text-slate-900">{formatCurrency(product.revenueGenerated, 'USD')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Times Sold</p>
            <p className="text-xl font-semibold text-slate-900">{product.soldCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-wrap gap-2 items-center border-b border-slate-200 pb-3 mb-4">
            {TAB_OPTIONS.map((tabOption) => (
              <button
                key={tabOption.key}
                onClick={() => setTab(tabOption.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${tab === tabOption.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {tabOption.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'SKU', value: product.sku ?? '—' },
                { label: 'Type', value: typeBadge(product.type) },
                { label: 'Category', value: product.category ?? '—' },
                { label: 'Unit', value: product.unit ?? '—' },
                { label: 'Status', value: product.status },
                { label: 'Tracking', value: product.trackingType ?? 'NONE' },
                { label: 'Stock Quantity', value: product.stockQty != null ? product.stockQty : 'Not tracked' },
                { label: 'Pricing Rules', value: product.pricingRuleUsageCount },
                { label: 'Created', value: fmtDate(product.createdAt) },
                { label: 'Updated', value: fmtDate(product.updatedAt) },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">{item.label}</div>
                  <div className="text-sm font-medium text-slate-900">{item.value}</div>
                </div>
              ))}

              {product.description && (
                <div className="col-span-full bg-slate-50 rounded-2xl p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Description</div>
                  <div className="text-sm text-slate-700">{product.description}</div>
                </div>
              )}
            </div>
          )}

          {tab === 'invoices' && (
            <div className="space-y-4">
              {product.recentInvoices.length === 0 ? (
                <div className="text-center py-16 text-slate-400">No recent invoices include this item.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-left text-xs font-semibold uppercase">
                        <th className="px-4 py-3">Invoice #</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Quantity</th>
                        <th className="px-4 py-3 text-right">Line Total</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.recentInvoices.map((inv) => (
                        <tr key={inv.id} className="border-t border-slate-100">
                          <td className="px-4 py-3 text-slate-900">{inv.number ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-500">{fmtDate(inv.date)}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{inv.quantity}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(inv.total, 'USD')}</td>
                          <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{inv.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'quotes' && (
            <div className="space-y-4">
              {product.recentQuotes.length === 0 ? (
                <div className="text-center py-16 text-slate-400">No recent quotes include this item.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-left text-xs font-semibold uppercase">
                        <th className="px-4 py-3">Quote #</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Quantity</th>
                        <th className="px-4 py-3 text-right">Line Total</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.recentQuotes.map((quote) => (
                        <tr key={quote.id} className="border-t border-slate-100">
                          <td className="px-4 py-3 text-slate-900">{quote.number ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-500">{fmtDate(quote.date)}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{quote.quantity}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(quote.total, 'USD')}</td>
                          <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{quote.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="space-y-4">
              {product.activity.length === 0 ? (
                <div className="text-center py-16 text-slate-400">No activity has been recorded for this item yet.</div>
              ) : (
                <div className="space-y-3">
                  {product.activity.map((entry) => (
                    <div key={entry.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{entry.action}</div>
                          <div className="text-xs text-slate-500">{entry.performedBy ?? 'System'} · {fmtDate(entry.createdAt)}</div>
                        </div>
                        <Tag size={16} className="text-slate-400" />
                      </div>
                      {entry.changes && typeof entry.changes === 'object' && (
                        <div className="mt-3 grid gap-2">
                          {Object.entries(entry.changes).map(([key, value]) => (
                            <div key={key} className="text-sm text-slate-600"><span className="font-medium text-slate-900">{key}:</span> {String(value)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {modalOpen && product && (
        <ProductFormModal item={product} onSaved={handleSaved} onClose={() => setModalOpen(false)} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Item?</h3>
            <p className="text-sm text-slate-600 mb-5">
              Are you sure you want to delete <span className="font-semibold">{product.name}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(false)} disabled={deleting} className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
