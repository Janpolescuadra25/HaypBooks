import React from 'react'
import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'
import { formatCurrency } from '@/lib/format'
import TLSBody from './TLSBody'

async function fetchTLS(params?: { period?: string; start?: string; end?: string }) {
  const sp = new URLSearchParams()
  if (params?.period) sp.set('period', params.period)
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/transaction-list-with-splits${qs}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <div className="glass-card print:hidden">
          <div className="flex items-center justify-between gap-2">
            <BackButton ariaLabel="Back to Reports" />
          </div>
        </div>
        <div className="glass-card">
          <p className="text-slate-800">Access denied. You don’t have permission to view this report.</p>
        </div>
      </div>
    )
  }
  return res.json()
}

export default async function TransactionListWithSplitsPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const data = await fetchTLS({ period: searchParams?.period, start: searchParams?.start, end: searchParams?.end }) as any
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data as any
  const asOfIso = (data?.asOf || (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString()).slice(0,10)

  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <ReportPeriodSelect value={data.period} />
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/transaction-list-with-splits/export" />
            <PrintButton />
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Transaction List with Splits">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Transaction List with Splits</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(asOfIso)}</div>
            {/* Announce totals changes politely for assistive tech */}
            <div className="sr-only" aria-live="polite">Totals updated. Debit {formatCurrency(Number(data.totals.debit || 0))}; Credit {formatCurrency(Number(data.totals.credit || 0))}.</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Txn ID</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Number</th>
              <th className="px-3 py-2 text-left">Payee</th>
              <th className="px-3 py-2 text-left">Memo</th>
              <th className="px-3 py-2 text-left">Split Account</th>
              <th className="px-3 py-2 tabular-nums">Debit</th>
              <th className="px-3 py-2 tabular-nums">Credit</th>
            </tr>
          </thead>
          <TLSBody rows={data.rows} />
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-left" colSpan={7}>Totals</td>
              <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.debit || 0)} /></td>
              <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.credit || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

