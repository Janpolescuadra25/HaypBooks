'use client'

import { useMemo, useState } from 'react'

type CreditNoteRow = {
  id: string
  creditNoteNumber: string
  customer: string
  invoiceNumber: string
  date: string
  amount: string
  reason: string
  status: 'Issued' | 'Applied' | 'Void'
}

export default function CreditNotesPage() {
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const items: CreditNoteRow[] = useMemo(() => [
    { id: 'c1', creditNoteNumber: 'CN-2026-001', customer: 'Omega Ltd', invoiceNumber: 'INV-2026-001', date: '2026-03-02', amount: '$250.00', reason: 'Product return', status: 'Issued' },
    { id: 'c2', creditNoteNumber: 'CN-2026-002', customer: 'Gamma Co', invoiceNumber: 'INV-2026-015', date: '2026-03-05', amount: '$550.00', reason: 'Billing correction', status: 'Applied' },
    { id: 'c3', creditNoteNumber: 'CN-2026-003', customer: 'Delta LLC', invoiceNumber: 'INV-2026-032', date: '2026-03-07', amount: '$120.00', reason: 'Discount adjustment', status: 'Void' },
  ], [])

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((row) =>
      row.creditNoteNumber.toLowerCase().includes(q) ||
      row.customer.toLowerCase().includes(q) ||
      row.invoiceNumber.toLowerCase().includes(q) ||
      row.date.toLowerCase().includes(q) ||
      row.amount.toLowerCase().includes(q) ||
      row.reason.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    )
  }, [search, items])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Credit Notes</h1>
            <p className="text-sm text-slate-500 mt-1">Manage customer credit notes and adjustments</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">New Credit Note</button>
            <button onClick={() => setHelpOpen((cur) => !cur)} type="button" aria-label="Open documentation for Credit Notes" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">?</button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3">
          <input
            title="Search credit notes"
            placeholder="Search by credit note, customer, invoice, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-xs text-slate-500 sm:col-span-2">Search by number, customer, invoice, reason, or status.</div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Credit Note #</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Invoice #</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Reason</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No credit notes found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.creditNoteNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{row.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{row.date}</td>
                    <td className="px-4 py-3 text-slate-600">{row.amount}</td>
                    <td className="px-4 py-3 text-slate-600">{row.reason}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${
                      row.status === 'Issued' ? 'text-sky-700' :
                      row.status === 'Applied' ? 'text-emerald-700' :
                      'text-rose-700'
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
              <h2 className="text-lg font-bold">Credit Notes Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Issue and manage credit notes to adjust invoices and customer balances.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create credit notes for returned goods, billing errors, and discounts.</li>
                <li>Apply credits against open invoices or refund as necessary.</li>
                <li>Track status through issued, applied, or voided steps.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
