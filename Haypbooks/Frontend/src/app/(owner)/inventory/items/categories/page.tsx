'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, PackageOpen, Tag } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { inventoryService } from '@/services/inventory.service'

export default function CategoriesPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCategories = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const [catsResp, itemsResp] = await Promise.all([
        inventoryService.listItemCategories(companyId),
        inventoryService.listItems(companyId, { limit: 999 }),
      ])
      const catNames = Array.isArray(catsResp.data) ? catsResp.data : []
      const items = itemsResp.data?.data ?? []
      const categoryData = catNames.map((name: string) => ({
        name,
        count: items.filter((i: any) => i.category === name).length,
      }))
      setCategories(categoryData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!companyId || companyLoading) return
    fetchCategories()
  }, [companyId, companyLoading, fetchCategories])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">Item categories derived from your inventory</p>
        </div>
        <button
          type="button"
          onClick={fetchCategories}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 rounded-2xl border border-slate-200 bg-white">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : !categories.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 text-center text-slate-500">
          <Tag className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-sm">No categories found. Categories are derived from items.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm text-slate-500">{categories.length} categories total</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Category Name</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Items</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.name} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">{cat.name}</td>
                    <td className="px-5 py-3 text-slate-700">{cat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
