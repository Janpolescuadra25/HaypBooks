import { getBaseUrl } from '@/lib/server-url'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import React from 'react'

type ReconSummary = {
  buckets: Array<{ status: string; count: number; total: number }>
  inflows: number
  outflows: number
  net: number
  progress: number
  counts: { for_review: number; categorized: number; excluded: number }
}

type AgingPayload = { totals: { total: number } }
type IssuesPayload = { total: number; asOf: string }
type PeriodsPayload = { closedThrough: string | null }

function fmtUsd(n: number) {
  return Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const base = getBaseUrl()
    const res = await fetch(`${base}${path}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

async function BooksReviewServer() {
  const [recon, ar, ap, issues, periods] = await Promise.all([
    fetchJson<ReconSummary>('/api/reconciliation/summary'),
    fetchJson<AgingPayload>('/api/reports/ar-aging'),
    fetchJson<AgingPayload>('/api/reports/ap-aging'),
    fetchJson<IssuesPayload>('/api/reports/invalid-journal-transactions'),
    fetchJson<PeriodsPayload>('/api/periods'),
  ])

  const forReview = recon?.counts.for_review ?? 0
  const progress = recon?.progress ?? 0
  const inflows = recon?.inflows ?? 0
  const outflows = recon ? recon.outflows : 0
  const arTotal = ar?.totals?.total ?? 0
  const apTotal = ap?.totals?.total ?? 0
  const exceptions = issues?.total ?? 0
  const closedThrough = periods?.closedThrough ?? null

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Books review</h1>
          <p className="text-slate-600 text-sm">Month-end close checklist and health snapshot.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export a concise CSV snapshot for review status */}
          <React.Suspense fallback={<span className="inline-flex items-center rounded-lg border border-slate-200 bg-white/60 p-1.5 text-slate-400">…</span>}>
            <ExportCsvButton exportPath="/api/reconciliation/summary/export" />
          </React.Suspense>
          <PrintButton />
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4" aria-label="Reconciliation status">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-slate-900">Banking reconciliation</h2>
            <a className="btn-secondary !px-2 !py-1 text-xs" href="/transactions/reconcile">Open Reconcile</a>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-slate-500">Progress</div>
              <div className="text-lg font-semibold">{progress}%</div>
            </div>
            <div>
              <div className="text-slate-500">Inflows</div>
              <div className="text-lg font-semibold">{fmtUsd(inflows)}</div>
            </div>
            <div>
              <div className="text-slate-500">Outflows</div>
              <div className="text-lg font-semibold">{fmtUsd(outflows)}</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">Transactions to review: <span className="font-medium text-slate-900">{forReview}</span></div>
          <div className="mt-2">
            <a className="text-sky-700 hover:underline text-sm" href="/bank-transactions?bankStatus=for_review">Categorize transactions</a>
          </div>
        </div>

        <div className="glass-card p-4" aria-label="Receivables and Payables">
          <h2 className="font-medium text-slate-900">Receivables & Payables</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded border p-3">
              <div className="text-slate-500">A/R total</div>
              <div className="text-lg font-semibold">{fmtUsd(arTotal)}</div>
              <div className="mt-2"><a className="text-sky-700 hover:underline text-sm" href="/reports/ar-aging">View A/R aging</a></div>
            </div>
            <div className="rounded border p-3">
              <div className="text-slate-500">A/P total</div>
              <div className="text-lg font-semibold">{fmtUsd(apTotal)}</div>
              <div className="mt-2"><a className="text-sky-700 hover:underline text-sm" href="/reports/ap-aging">View A/P aging</a></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4" aria-label="Exceptions and warnings">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-slate-900">Exceptions</h2>
            <a className="btn-secondary !px-2 !py-1 text-xs" href="/reports/invalid-journal-transactions">Open report</a>
          </div>
          <p className="text-sm text-slate-600 mt-2">Issues detected in journals (unbalanced totals, zero lines, future-dated, etc.).</p>
          <div className="mt-3 text-sm">Open issues: <span className="font-semibold">{exceptions}</span></div>
        </div>

        <div className="glass-card p-4" aria-label="Close period">
          <h2 className="font-medium text-slate-900">Close date</h2>
          <p className="text-sm text-slate-600 mt-1">Prevent changes before the close date to lock your books.</p>
          <div className="mt-2 text-sm">Closed through: <span className="font-semibold">{closedThrough || 'Not set'}</span></div>
          <div className="mt-2"><a className="text-sky-700 hover:underline text-sm" href="/settings/close-books">Manage close date</a></div>
        </div>
      </section>
    </main>
  )
}

export default async function BooksReviewPage() {
  // Await the server-rendered content to avoid returning a Promise as a child
  return await BooksReviewServer()
}
