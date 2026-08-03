'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Tag } from 'lucide-react'
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

  if (companyLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Categories</h2>
        </div>
        <button
          type="button"
          onClick={fetchCategories}
          disabled={loading}
          title="Refresh"
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">No categories found. Categories are derived from items.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-100">
            <p className="text-sm text-slate-500">{categories.length} categories total</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Category Name</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{cat.name}</td>
                    <td className="px-4 py-3 text-slate-700">{cat.count}</td>
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
