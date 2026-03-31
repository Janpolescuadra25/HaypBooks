'use client'

import { useMemo, useState } from 'react'

type ItemRow = {
  id: string
  itemCode: string
  name: string
  category: string
  type: 'Product' | 'Service'
  salesPrice: string
  status: 'Active' | 'Inactive'
}

export default function ProductsServicesPage() {
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const items: ItemRow[] = [
    { id: 'i1', itemCode: 'LP15', name: 'Laptop Pro 15', category: 'Electronics', type: 'Product', salesPrice: '$2,200', status: 'Active' },
    { id: 'i2', itemCode: 'CH01', name: 'Consulting Hourly', category: 'Services', type: 'Service', salesPrice: '$180', status: 'Active' },
    { id: 'i3', itemCode: 'SL-ENT', name: 'Software License', category: 'Software', type: 'Product', salesPrice: '$950', status: 'Inactive' },
  ]

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((row) =>
      row.itemCode.toLowerCase().includes(q) ||
      row.name.toLowerCase().includes(q) ||
      row.category.toLowerCase().includes(q) ||
      row.type.toLowerCase().includes(q) ||
      row.salesPrice.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products & Services</h1>
            <p className="text-sm text-slate-500 mt-1">Manage items you sell to customers</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">New Item</button>
            <button onClick={() => setHelpOpen((cur) => !cur)} type="button" aria-label="Open documentation for Products & Services" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">?</button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3">
          <input
            title="Search products or services"
            placeholder="Search items"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-xs text-slate-500 sm:col-span-2">Search by item code, name, category, or status.</div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Item Code</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Sales Price</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">No products or services found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.itemCode}</td>
                    <td className="px-4 py-3 text-slate-600">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.category}</td>
                    <td className="px-4 py-3 text-slate-600">{row.type}</td>
                    <td className="px-4 py-3 text-slate-600">{row.salesPrice}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${row.status === 'Active' ? 'text-emerald-700' : 'text-amber-700'}`}>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Products & Services Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Configure and manage products & services items for sales quoting and inventory.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Set categories, types, and pricing values for customer-facing catalog.</li>
                <li>Enable/disable items for sale with this status toggle.</li>
                <li>Manage data for quotations, invoices, and product catalog exports.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
