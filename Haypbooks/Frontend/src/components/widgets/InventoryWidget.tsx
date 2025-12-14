"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import Amount from '@/components/Amount'

type InventoryItem = {
  id: string
  name: string
  sku: string
  quantity: number
  reorderPoint: number
  value: number
  needsReorder: boolean
}

type InventorySummary = {
  totalValue: number
  itemCount: number
  lowStockCount: number
  items: InventoryItem[]
}

export default function InventoryWidget() {
  const [summary, setSummary] = useState<InventorySummary>({
    totalValue: 0,
    itemCount: 0,
    lowStockCount: 0,
    items: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        type InventoryApiResponse = { summary?: InventorySummary }
        const data = await api<InventoryApiResponse>('/api/dashboard/inventory')
        setSummary(data?.summary || { totalValue: 0, itemCount: 0, lowStockCount: 0, items: [] })
      } catch (err) {
        console.error('Failed to load inventory', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="animate-pulse bg-slate-100 rounded h-32" />
  }

  return (
    <div className="glass-card !shadow-none border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Inventory</h3>
        <Link href="/inventory" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          View all
        </Link>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <p className="text-2xl font-bold text-slate-900">{summary.itemCount}</p>
          <p className="text-xs text-slate-600 mt-1">Items</p>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-lg font-bold text-green-900">
            <Amount value={summary.totalValue} />
          </p>
          <p className="text-xs text-green-700 mt-1">Total Value</p>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-2xl font-bold text-red-900">{summary.lowStockCount}</p>
          <p className="text-xs text-red-700 mt-1">Low Stock</p>
        </div>
      </div>
      
      {summary.lowStockCount > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-900 mb-2">⚠️ Items Need Reordering</p>
          <div className="space-y-2">
            {summary.items.filter(i => i.needsReorder).slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-red-900 font-medium truncate">{item.name}</span>
                <span className="text-red-700 ml-2">
                  {item.quantity} / {item.reorderPoint}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-slate-500 uppercase">Recent Items</h4>
        {summary.items.filter(i => !i.needsReorder).length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No inventory items</p>
        ) : (
          summary.items.filter(i => !i.needsReorder).slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                <p className="text-xs text-slate-500">SKU: {item.sku}</p>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-semibold text-slate-900">{item.quantity}</p>
                <p className="text-xs text-slate-500">
                  <Amount value={item.value} />
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3 text-sm">
        <Link href={'/inventory/adjust' as any} className="text-sky-600 hover:text-sky-700 font-medium">
          Adjust
        </Link>
        <Link href={'/inventory/reports' as any} className="text-sky-600 hover:text-sky-700 font-medium">
          Reports
        </Link>
      </div>
    </div>
  )
}
