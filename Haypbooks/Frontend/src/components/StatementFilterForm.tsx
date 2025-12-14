"use client"

import React from 'react'

type StatementType = 'balance-forward' | 'transaction' | 'open-item' | undefined

export default function StatementFilterForm({ initialType, initialStart, initialAsOf }: { initialType?: StatementType; initialStart?: string | null; initialAsOf: string }) {
  const [type, setType] = React.useState<Exclude<StatementType, undefined>>(initialType || 'open-item')
  const [start, setStart] = React.useState<string>(initialStart || '')
  const [asOf, setAsOf] = React.useState<string>(initialAsOf)

  const startDisabled = type === 'open-item'

  return (
    <form method="get" className="mt-3 print:hidden" aria-label="Statement filters">
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="flex flex-col">
          <label htmlFor="type" className="text-xs text-slate-600">Type</label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="min-w-[12rem] rounded border border-slate-300 px-2 py-1"
          >
            <option value="open-item">Open item</option>
            <option value="transaction">Transaction</option>
            <option value="balance-forward">Balance forward</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="start" className="text-xs text-slate-600">Start date</label>
          <input
            id="start"
            name="start"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-400 dark:bg-slate-800 dark:text-slate-100"
            disabled={startDisabled}
            aria-describedby="start-help"
          />
          <span id="start-help" className="text-[10px] text-slate-500">Used for transaction/balance-forward</span>
        </div>
        <div className="flex flex-col">
          <label htmlFor="asOf" className="text-xs text-slate-600">End date</label>
          <input
            id="asOf"
            name="asOf"
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <button className="btn-primary" type="submit">Apply</button>
        </div>
      </div>
    </form>
  )
}
