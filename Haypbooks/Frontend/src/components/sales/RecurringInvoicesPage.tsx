'use client'

import { useMemo, useState } from 'react'

type RecurringRow = {
  id: string
  templateName: string
  customer: string
  frequency: 'Monthly' | 'Yearly'
  amount: string
  nextRunDate: string
  status: 'Active' | 'Paused'
}

export default function RecurringInvoicesPage() {
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const items: RecurringRow[] = useMemo(() => [
    { id: 'r1', templateName: 'Monthly Rent - Acme', customer: 'Acme Corp', frequency: 'Monthly', amount: '$5,000.00', nextRunDate: '2026-04-01', status: 'Active' },
    { id: 'r2', templateName: 'Annual Support - TechStart', customer: 'TechStart LLC', frequency: 'Yearly', amount: '$15,000.00', nextRunDate: '2027-01-01', status: 'Active' },
    { id: 'r3', templateName: 'Quarterly Service - Global', customer: 'Global Services', frequency: 'Monthly', amount: '$7,500.00', nextRunDate: '2026-06-01', status: 'Paused' },
  ], [])

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((row) =>
      row.templateName.toLowerCase().includes(q) ||
      row.customer.toLowerCase().includes(q) ||
      row.frequency.toLowerCase().includes(q) ||
      row.amount.toLowerCase().includes(q) ||
      row.nextRunDate.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    )
  }, [search, items])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Recurring Invoices</h1>
            <p className="text-sm text-slate-500 mt-1">Automate recurring billing cycles</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">New Template</button>
            <button onClick={() => setHelpOpen((cur) => !cur)} type="button" aria-label="Open documentation for Recurring Invoices" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">?</button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3">
          <input
            title="Search recurring invoices"
            placeholder="Search templates, customer, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-xs text-slate-500 sm:col-span-2">Search by template name, customer, frequency, or status.</div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Template Name</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Frequency</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Next Run Date</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">No recurring invoices found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.templateName}</td>
                    <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{row.frequency}</td>
                    <td className="px-4 py-3 text-slate-600">{row.amount}</td>
                    <td className="px-4 py-3 text-slate-600">{row.nextRunDate}</td>
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
              <h2 className="text-lg font-bold">Recurring Invoices Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Set up, schedule, and manage recurring invoice templates for customers.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create recurring templates with configurable frequency and amounts.</li>
                <li>Pause and activate templates as needed for customer contracts.</li>
                <li>View upcoming run dates and status for automatic billing cycles.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
