'use client'

import { useMemo, useState } from 'react'

type CaseRow = {
  id: string
  caseNumber: string
  customer: string
  amount: string
  age: string
  collector: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Open' | 'In Progress' | 'Resolved'
}

export default function CollectionsCenterPage() {
  const [helpOpen, setHelpOpen] = useState(false)

  const summary = useMemo(
    () => [
      { label: 'Total Outstanding', value: '$36,200.00' },
      { label: 'In Collection', value: '18' },
      { label: 'Promised to Pay', value: '7' },
      { label: 'Disputed', value: '4' },
    ],
    []
  )

  const rows = useMemo<CaseRow[]>(
    () => [
      { id: 'c1', caseNumber: 'COL-2026-001', customer: 'Acme Corp', amount: '$12,400.00', age: '31 days', collector: 'Lisa T.', priority: 'High', status: 'Open' },
      { id: 'c2', caseNumber: 'COL-2026-002', customer: 'TechStart Inc', amount: '$9,250.00', age: '45 days', collector: 'Aaron M.', priority: 'Medium', status: 'In Progress' },
      { id: 'c3', caseNumber: 'COL-2026-003', customer: 'Global Logistics', amount: '$14,550.00', age: '73 days', collector: 'Nina K.', priority: 'High', status: 'Open' },
    ],
    []
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Collections Center</h1>
            <p className="text-sm text-slate-500 mt-1">Centralized workflow for collections activities</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">New Collection Case</button>
            <button
              onClick={() => setHelpOpen((cur) => !cur)}
              type="button"
              aria-label="Open documentation for Collections Center"
              className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold"
            >
              ?
            </button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-4">
          {summary.map((item) => (
            <div key={item.label} className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-xs text-slate-500 font-medium">{item.label}</p>
              <p className="text-lg font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Case #</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Age</th>
                <th className="text-left px-4 py-3">Collector</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.caseNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{row.amount}</td>
                  <td className="px-4 py-3 text-slate-600">{row.age}</td>
                  <td className="px-4 py-3 text-slate-600">{row.collector}</td>
                  <td className="px-4 py-3 text-slate-600">{row.priority}</td>
                  <td className={`px-4 py-3 text-sm font-semibold ${row.status === 'Open' ? 'text-emerald-700' : row.status === 'In Progress' ? 'text-amber-700' : 'text-blue-700'}`}>
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Collections Center Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Centralize and coordinate collections activities across team cases.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create, assign, and track collection case workflows.</li>
                <li>Prioritize high-risk accounts and overdue balances.</li>
                <li>Manage status transitions and record collector actions.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
