'use client'

import { useMemo, useState } from 'react'

type DunningRuleRow = {
  id: string
  ruleName: string
  trigger: string
  action: 'Email' | 'Call' | 'Letter'
  template: string
  status: 'Active' | 'Paused'
}

export default function DunningManagementPage() {
  const [helpOpen, setHelpOpen] = useState(false)

  const rows: DunningRuleRow[] = useMemo(
    () => [
      { id: 'd1', ruleName: 'First Reminder - 30 Days', trigger: '30 Days Overdue', action: 'Email', template: 'First Reminder Email', status: 'Active' },
      { id: 'd2', ruleName: 'Second Reminder - 60 Days', trigger: '60 Days Overdue', action: 'Call', template: 'Second Reminder Script', status: 'Active' },
      { id: 'd3', ruleName: 'Final Notice - 90 Days', trigger: '90 Days Overdue', action: 'Letter', template: 'Final Notice Letter', status: 'Paused' },
    ],
    []
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dunning Management</h1>
            <p className="text-sm text-slate-500 mt-1">Automate collection reminders and escalations</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">New Dunning Rule</button>
            <button
              onClick={() => setHelpOpen((cur) => !cur)}
              type="button"
              aria-label="Open documentation for Dunning Management"
              className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold"
            >
              ?
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Rule Name</th>
                <th className="text-left px-4 py-3">Trigger</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Template</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.ruleName}</td>
                  <td className="px-4 py-3 text-slate-600">{row.trigger}</td>
                  <td className="px-4 py-3 text-slate-600">{row.action}</td>
                  <td className="px-4 py-3 text-slate-600">{row.template}</td>
                  <td className={`px-4 py-3 text-sm font-semibold ${row.status === 'Active' ? 'text-emerald-700' : 'text-amber-700'}`}>{row.status}</td>
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
              <h2 className="text-lg font-bold">Dunning Management Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Define and manage automated dunning rules for overdue receivables.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Set triggers based on days overdue and assign actions by priority.</li>
                <li>Use templates for email, call script, and letters.</li>
                <li>Enable, pause, or disable rules as collection strategy changes.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
