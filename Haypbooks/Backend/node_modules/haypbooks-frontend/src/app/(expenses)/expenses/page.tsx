"use client"
import { Suspense, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { DataTable } from '@/components/DataTable'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import ExpensesFilters from '@/components/ExpensesFilters'
import { formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'

type Expense = { id: string; date: string; payee: string; category: string; amount: number }

export default function ExpensesPage() {
  const [rows, setRows] = useState<Expense[]>([])
  const [error, setError] = useState<string | null>(null)
  const [canWrite, setCanWrite] = useState<boolean>(false)
  useEffect(() => {
    api<{ expenses: Expense[] }>(`/api/expenses?page=1&limit=20`).then((d) => setRows(d.expenses)).catch((e) => setError(e.message))
    ;(async () => {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        setCanWrite(!!p?.permissions?.includes?.('journal:write'))
      } catch { setCanWrite(false) }
    })()
  }, [])

  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden overflow-x-auto">
        <div className="flex items-end gap-2 whitespace-nowrap">
          <div className="min-w-0 grow">
            <Suspense fallback={null}><ExpensesFilters /></Suspense>
          </div>
          <div className="flex items-center gap-1.5">
            <Suspense fallback={null}>
              <ExportCsvButton exportPath="/api/expenses/export" />
            </Suspense>
            <PrintButton />
            <a href="/activity/expense" className="btn-secondary" aria-label="View expense activity">Activity</a>
            {canWrite && (<a href="/expenses/new" className="btn-primary">New Expense</a>)}
          </div>
        </div>
      </div>
      {error ? (
        <div className="glass-card text-red-600">{error}</div>
      ) : (
        <div className="glass-card">
          <DataTable<Expense>
            keyField="id"
            columns={[
              { key: 'date', header: 'Date', hideBelow: 'md', render: (v) => formatMMDDYYYY(String(v)) },
              { key: 'payee', header: 'Payee', cellClassName: 'inline-block max-w-[18ch] truncate align-top' },
              { key: 'category', header: 'Category', hideBelow: 'sm', cellClassName: 'inline-block max-w-[12ch] truncate align-top' },
              { key: 'amount', header: 'Amount', align: 'right', render: (v) => <span className="tabular-nums"><Amount value={Number(v as number || 0)} /></span> },
              { key: 'id', header: '', align: 'right', render: (_v, r) => (
                <div className="flex justify-end gap-2">
                  {canWrite && (
                    <button
                      className="btn-secondary py-1 px-2 text-xs"
                      onClick={async () => {
                        try {
                          const updated = { ...r, memo: (r as any).memo ? `${(r as any).memo} • edited` : 'edited' }
                          const res = await api<{ expense: Expense }>(`/api/expenses`, { method: 'PUT', body: JSON.stringify(updated) })
                          setRows((prev) => prev.map((x) => (x.id === r.id ? (res.expense as any) : x)))
                        } catch (e: any) {
                          setError(e.message)
                        }
                      }}
                      aria-label={`Edit ${r.payee}`}
                    >
                      Edit
                    </button>
                  )}
                  {canWrite && (
                    <button
                      className="btn-secondary py-1 px-2 text-xs"
                      onClick={async () => {
                        try {
                          await api(`/api/expenses?id=${encodeURIComponent(r.id)}`, { method: 'DELETE' })
                          setRows((prev) => prev.filter((x) => x.id !== r.id))
                        } catch (e: any) {
                          setError(e.message)
                        }
                      }}
                      aria-label={`Delete ${r.payee}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            ]}
            rows={rows}
          />
        </div>
      )}
    </div>
  )
}
