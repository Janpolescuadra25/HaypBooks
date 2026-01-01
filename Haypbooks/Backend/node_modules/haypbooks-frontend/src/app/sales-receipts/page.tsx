"use client"
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { DataTable } from '@/components/DataTable'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { useSearchParams } from 'next/navigation'
import { formatMMDDYYYY } from '@/lib/date'
import Notice from '@/components/Notice'
import Amount from '@/components/Amount'

type Receipt = { id: string; date: string; customer: string; description?: string; amount: number }

function SalesReceiptsContent() {
  const [rows, setRows] = useState<Receipt[]>([])
  const [error, setError] = useState<string | null>(null)
  const [canWrite, setCanWrite] = useState<boolean>(false)
  const sp = useSearchParams() ?? new URLSearchParams()
  const from = sp.get('from') || ''
  useEffect(() => {
    api<{ receipts: Receipt[] }>(`/api/sales-receipts?page=1&limit=20`).then((d) => setRows(d.receipts)).catch((e) => setError(e.message))
    ;(async () => {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        setCanWrite(!!p?.permissions?.includes?.('invoices:write'))
      } catch { setCanWrite(false) }
    })()
  }, [])

  return (
    <div className="space-y-4">
      <Notice />
      <div className="glass-card print:hidden overflow-x-auto">
        <div className="flex items-end gap-2 whitespace-nowrap text-sm">
          <div className="min-w-0 grow">
            {/* Filters placeholder (optional) */}
          </div>
          <div className="flex items-center gap-1.5">
            {from === '/sales' && (<BackButton fallback="/sales" ariaLabel="Back to Sales" />)}
            <Suspense fallback={null}><ExportCsvButton exportPath="/api/sales-receipts/export" /></Suspense>
            <PrintButton />
            <a href="/activity/sales-receipt" className="btn-secondary !px-2 !py-1 text-xs" aria-label="View sales receipt activity">Activity</a>
            {canWrite && (<a href="/sales-receipts/new" className="btn-primary !px-2 !py-1 text-xs">New Sales Receipt</a>)}
          </div>
        </div>
      </div>
      {error ? (
        <div className="glass-card text-red-600">{error}</div>
      ) : (
        <div className="glass-card">
          <DataTable<Receipt>
            keyField="id"
            columns={[
              { key: 'date', header: 'Date', hideBelow: 'md', render: (v, r) => (<Link className="text-sky-700 hover:underline" href={`/sales-receipts/${r.id}` as any}>{formatMMDDYYYY(String(v))}</Link>) },
              { key: 'customer', header: 'Customer', cellClassName: 'inline-block max-w-[18ch] truncate align-top', render: (v, r) => (<Link className="text-sky-700 hover:underline" href={`/sales-receipts/${r.id}` as any}>{String(v)}</Link>) },
              { key: 'description', header: 'Description', hideBelow: 'sm', cellClassName: 'inline-block max-w-[18ch] truncate align-top' },
              { key: 'amount', header: 'Amount', align: 'right', render: (v) => <Amount value={Number(v)} /> },
              { key: 'id', header: '', align: 'right', render: (_v, r) => (
                <div className="flex justify-end gap-2">
                  {canWrite && (<button
                    className="btn-secondary py-1 px-2 text-xs"
                    onClick={async () => {
                      try {
                        const updated = { ...r, description: r.description ? `${r.description} • edited` : 'edited' }
                        const res = await api<{ receipt: Receipt }>(`/api/sales-receipts`, { method: 'PUT', body: JSON.stringify(updated) })
                        setRows((prev) => prev.map((x) => (x.id === r.id ? (res.receipt as any) : x)))
                      } catch (e: any) { setError(e.message) }
                    }}
                    aria-label={`Edit receipt for ${r.customer}`}
                  >Edit</button>)}
                  {canWrite && (<button
                    className="btn-secondary py-1 px-2 text-xs"
                    onClick={async () => {
                      try {
                        await api(`/api/sales-receipts?id=${encodeURIComponent(r.id)}`, { method: 'DELETE' })
                        setRows((prev) => prev.filter((x) => x.id !== r.id))
                      } catch (e: any) { setError(e.message) }
                    }}
                    aria-label={`Delete receipt for ${r.customer}`}
                  >Delete</button>)}
                </div>
              )},
            ]}
            rows={rows}
          />
        </div>
      )}
    </div>
  )
}

export default function SalesReceiptsPage() {
  return (
    <Suspense fallback={null}>
      <SalesReceiptsContent />
    </Suspense>
  )
}
