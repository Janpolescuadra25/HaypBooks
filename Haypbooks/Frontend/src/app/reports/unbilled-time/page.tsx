import React from 'react'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { getBaseUrl } from '@/lib/server-url'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'
import { formatNumber } from '@/lib/format'

async function fetchData(searchParams: { period?: string; start?: string; end?: string }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  const res = await fetch(`${getBaseUrl()}/api/reports/unbilled-time${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  return res
}

export default async function UnbilledTimePage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const res = await fetchData(searchParams)
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <div className="glass-card print:hidden">
          <div className="flex items-center justify-between gap-2">
            <BackButton ariaLabel="Back to Reports" />
          </div>
        </div>
        <div className="glass-card"><p className="text-slate-800">Access denied. You don’t have permission to view this report.</p></div>
      </div>
    )
  }
  const data = await res.json()
  const { rows } = data
  const caption = (searchParams?.start && searchParams?.end)
    ? formatDateRange(searchParams.start, searchParams.end)
    : formatAsOf(data.asOf)
  // Use centralized numeric formatting
  const fmtNumber = (n: number) => formatNumber(Number(n), { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <ReportPeriodSelect value={data.period} />
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/unbilled-time/export" />
            <PrintButton />
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Unbilled Time">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Unbilled Time</div>
            <div className="text-xs text-slate-600">{caption}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Service</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-right">Hours</th>
              <th className="px-3 py-2 text-right">Rate</th>
              <th className="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-slate-800">{formatMMDDYYYY(r.date)}</td>
                <td className="px-3 py-2 text-slate-800">{r.employee}</td>
                <td className="px-3 py-2 text-slate-800">{r.customer}</td>
                <td className="px-3 py-2 text-slate-800">{r.service}</td>
                <td className="px-3 py-2 text-slate-800">{r.description || ''}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtNumber(r.hours)}</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.rate || 0)} /></td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.amount || 0)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900" colSpan={5}>Totals</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium">{fmtNumber(data.totals.hours)}</td>
              <td className="px-3 py-2 text-right"></td>
              <td className="px-3 py-2 text-right tabular-nums font-medium"><Amount value={Number(data.totals.amount || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
