'use client'

import { useMemo, useState } from 'react'

type StatementRow = {
  id: string
  statementId: string
  customer: string
  periodStart: string
  periodEnd: string
  openingBalance: string
  closingBalance: string
  status: 'Sent' | 'Viewed' | 'Paid'
}

export default function CustomerStatementsPage() {
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const items: StatementRow[] = useMemo(() => [
    { id: 's1', statementId: 'STMT-2026-03', customer: 'Acme Corp', periodStart: '2026-03-01', periodEnd: '2026-03-31', openingBalance: '$5,100.00', closingBalance: '$3,650.00', status: 'Sent' },
    { id: 's2', statementId: 'STMT-2026-02', customer: 'Omega Ltd', periodStart: '2026-02-01', periodEnd: '2026-02-28', openingBalance: '$4,300.00', closingBalance: '$2,900.00', status: 'Viewed' },
    { id: 's3', statementId: 'STMT-2026-01', customer: 'Nova Supplies', periodStart: '2026-01-01', periodEnd: '2026-01-31', openingBalance: '$2,200.00', closingBalance: '$0.00', status: 'Paid' },
  ], [])

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((row) =>
      row.statementId.toLowerCase().includes(q) ||
      row.customer.toLowerCase().includes(q) ||
      row.periodStart.toLowerCase().includes(q) ||
      row.periodEnd.toLowerCase().includes(q) ||
      row.openingBalance.toLowerCase().includes(q) ||
      row.closingBalance.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    )
  }, [search, items])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Statements</h1>
            <p className="text-sm text-slate-500 mt-1">Generate customer account statements</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">Generate Statement</button>
            <button onClick={() => setHelpOpen((cur) => !cur)} type="button" aria-label="Open documentation for Customer Statements" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">?</button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3">
          <input
            title="Search customer statements"
            placeholder="Search by statement, customer, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-xs text-slate-500 sm:col-span-2">Search by statement ID, customer, or status.</div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Statement ID</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Period Start</th>
                <th className="text-left px-4 py-3">Period End</th>
                <th className="text-left px-4 py-3">Opening Balance</th>
                <th className="text-left px-4 py-3">Closing Balance</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No statements found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.statementId}</td>
                    <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{row.periodStart}</td>
                    <td className="px-4 py-3 text-slate-600">{row.periodEnd}</td>
                    <td className="px-4 py-3 text-slate-600">{row.openingBalance}</td>
                    <td className="px-4 py-3 text-slate-600">{row.closingBalance}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${
                      row.status === 'Sent' ? 'text-sky-700' :
                      row.status === 'Viewed' ? 'text-emerald-700' :
                      'text-amber-700'
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
              <h2 className="text-lg font-bold">Customer Statements Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Generate and send account statements to customers for a selected date range.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Choose period-specific statements and monitor delivery status.</li>
                <li>Track opening and closing balances per customer.</li>
                <li>Provide a clear history for collections and account reconciliation.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
