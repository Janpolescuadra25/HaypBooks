'use client'

import { useMemo, useState } from 'react'

type SalesOrderRow = {
  id: string
  orderNumber: string
  customer: string
  orderDate: string
  shipDate: string
  total: string
  status: 'Open' | 'Fulfilled' | 'Cancelled'
}

export default function SalesOrdersPage() {
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const items: SalesOrderRow[] = useMemo(() => [
    { id: 's1', orderNumber: 'SO-2026-100', customer: 'Acme Trading', orderDate: '2026-03-02', shipDate: '2026-03-05', total: '$4,200.00', status: 'Open' },
    { id: 's2', orderNumber: 'SO-2026-101', customer: 'Beta Supplies', orderDate: '2026-03-04', shipDate: '2026-03-09', total: '$5,125.50', status: 'Fulfilled' },
    { id: 's3', orderNumber: 'SO-2026-102', customer: 'Zeta Retail', orderDate: '2026-03-06', shipDate: '2026-03-12', total: '$1,980.00', status: 'Cancelled' },
  ], [])

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((row) =>
      row.orderNumber.toLowerCase().includes(q) ||
      row.customer.toLowerCase().includes(q) ||
      row.orderDate.toLowerCase().includes(q) ||
      row.shipDate.toLowerCase().includes(q) ||
      row.total.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    )
  }, [search, items])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Orders</h1>
            <p className="text-sm text-slate-500 mt-1">Track customer orders from acceptance to fulfillment</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">New Sales Order</button>
            <button onClick={() => setHelpOpen((cur) => !cur)} type="button" aria-label="Open documentation for Sales Orders" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">?</button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3">
          <input
            title="Search sales orders"
            placeholder="Search by order number, customer, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-xs text-slate-500 sm:col-span-2">Search by order number, customer, date, or status.</div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Order #</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Order Date</th>
                <th className="text-left px-4 py-3">Ship Date</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">No sales orders found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{row.orderDate}</td>
                    <td className="px-4 py-3 text-slate-600">{row.shipDate}</td>
                    <td className="px-4 py-3 text-slate-600">{row.total}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${
                      row.status === 'Fulfilled' ? 'text-emerald-700' :
                      row.status === 'Cancelled' ? 'text-rose-700' :
                      'text-sky-700'
                    }`}>{row.status}</td>
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
              <h2 className="text-lg font-bold">Sales Orders Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Monitor sales orders and fulfillment progress from quote acceptance through shipping and invoicing.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create sales orders directly from accepted quotes or manual entry.</li>
                <li>Track shipment dates and delivery status to improve operations.</li>
                <li>Manage cancellations and order updates with audit trail.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
