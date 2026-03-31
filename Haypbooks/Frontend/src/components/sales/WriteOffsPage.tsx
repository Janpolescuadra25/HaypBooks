'use client'

import { useMemo, useState } from 'react'

type WriteOffRow = {
  id: string
  writeOffNumber: string
  customer: string
  invoiceNumber: string
  amount: string
  reason: string
  date: string
  approvedBy: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export default function WriteOffsPage() {
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const rows: WriteOffRow[] = useMemo(() => [
    { id: 'w1', writeOffNumber: 'WO-2026-001', customer: 'Acme Corp', invoiceNumber: 'INV-2025-210', amount: '$1,250.00', reason: 'Customer bankruptcy', date: '2026-03-10', approvedBy: 'J. Doe', status: 'Approved' },
    { id: 'w2', writeOffNumber: 'WO-2026-002', customer: 'Global Logistics', invoiceNumber: 'INV-2025-315', amount: '$890.00', reason: 'Uncollectable', date: '2026-03-12', approvedBy: 'R. Singh', status: 'Pending' },
    { id: 'w3', writeOffNumber: 'WO-2026-003', customer: 'Nova Supplies', invoiceNumber: 'INV-2025-402', amount: '$430.00', reason: 'Disputed and no resolution', date: '2026-03-14', approvedBy: 'M. Lee', status: 'Rejected' },
  ], [])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((row) =>
      row.writeOffNumber.toLowerCase().includes(q) ||
      row.customer.toLowerCase().includes(q) ||
      row.invoiceNumber.toLowerCase().includes(q) ||
      row.amount.toLowerCase().includes(q) ||
      row.reason.toLowerCase().includes(q) ||
      row.date.toLowerCase().includes(q) ||
      row.approvedBy.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    )
  }, [rows, search])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Write-Offs</h1>
            <p className="text-sm text-slate-500 mt-1">Manage bad debt and invoice write-offs</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">New Write-Off</button>
            <button
              onClick={() => setHelpOpen((cur) => !cur)}
              type="button"
              aria-label="Open documentation for Write-Offs"
              className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold"
            >
              ?
            </button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3">
          <input
            title="Search write-offs"
            placeholder="Search by write-off, customer, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-xs text-slate-500 sm:col-span-2">Search by write-off #, customer, invoice, reason, or approval status.</div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Write-Off #</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Invoice #</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Reason</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Approved By</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">No write-offs found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.writeOffNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{row.invoiceNumber}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{row.amount}</td>
                    <td className="px-4 py-3 text-slate-600">{row.reason}</td>
                    <td className="px-4 py-3 text-slate-600">{row.date}</td>
                    <td className="px-4 py-3 text-slate-600">{row.approvedBy}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${
                      row.status === 'Approved' ? 'text-emerald-700' :
                      row.status === 'Pending' ? 'text-amber-700' :
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
              <h2 className="text-lg font-bold">Write-Offs Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Manage invoice write-offs and bad debt adjustments with approvals and audit tracking.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create and review write-off requests for aged receivables.</li>
                <li>Track approval status and responsible approver.</li>
                <li>Maintain history of bad debt reasons and accounting actions.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
