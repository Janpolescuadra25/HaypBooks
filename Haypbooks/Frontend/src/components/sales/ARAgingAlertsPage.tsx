'use client'

import { useMemo, useState } from 'react'

type AgingAlertRow = {
  id: string
  customer: string
  daysOverdue: string
  amountOverdue: string
  lastContact: string
  alertStatus: 'Sent' | 'Pending' | 'Escalated'
  action: string
}

export default function ARAgingAlertsPage() {
  const [helpOpen, setHelpOpen] = useState(false)

  const summary = useMemo(
    () => [
      { label: 'Total Overdue', value: '$27,640.00' },
      { label: 'High Risk Accounts', value: '9' },
      { label: 'Alert Sent Today', value: '5' },
      { label: 'Notes Added', value: '14' },
    ],
    []
  )

  const rows: AgingAlertRow[] = useMemo(
    () => [
      { id: 'r1', customer: 'TechStart Inc', daysOverdue: '45', amountOverdue: '$7,340.00', lastContact: '2026-03-01', alertStatus: 'Sent', action: 'Follow-up' },
      { id: 'r2', customer: 'Global Logistics', daysOverdue: '62', amountOverdue: '$9,120.00', lastContact: '2026-02-24', alertStatus: 'Escalated', action: 'Escalate' },
      { id: 'r3', customer: 'Apex Retail', daysOverdue: '91', amountOverdue: '$11,180.00', lastContact: '2026-02-15', alertStatus: 'Pending', action: 'Send Alert' },
    ],
    []
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">A/R Aging with Alerts</h1>
            <p className="text-sm text-slate-500 mt-1">Proactive monitoring of overdue accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">Configure Alerts</button>
            <button
              onClick={() => setHelpOpen((cur) => !cur)}
              type="button"
              aria-label="Open documentation for A/R Aging with Alerts"
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
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-right px-4 py-3">Days Overdue</th>
                <th className="text-right px-4 py-3">Amount Overdue</th>
                <th className="text-left px-4 py-3">Last Contact</th>
                <th className="text-left px-4 py-3">Alert Status</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.customer}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{row.daysOverdue}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{row.amountOverdue}</td>
                  <td className="px-4 py-3 text-slate-600">{row.lastContact}</td>
                  <td className={`px-4 py-3 text-sm font-semibold ${row.alertStatus === 'Escalated' ? 'text-rose-700' : row.alertStatus === 'Pending' ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {row.alertStatus}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.action}</td>
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
              <h2 className="text-lg font-bold">A/R Aging with Alerts Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Monitor overdue accounts with proactive alert actions to improve collections.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Define trigger thresholds for aging buckets and risk levels.</li>
                <li>Track last contact and automated alert status for each customer.</li>
                <li>Execute actions like follow-up, escalate, or suspend credit directly from the table.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
