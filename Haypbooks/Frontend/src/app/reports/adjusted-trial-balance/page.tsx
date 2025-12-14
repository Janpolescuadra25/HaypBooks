import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange } from '@/lib/date'
import Amount from '@/components/Amount'

export default async function AdjustedTrialBalancePage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  const res = await fetch(`${getBaseUrl()}/api/reports/adjusted-trial-balance${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
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
  const data = await res.json()

  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <ReportPeriodSelect value={data.period} />
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/adjusted-trial-balance/export" />
            <PrintButton />
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Adjusted Trial Balance">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Adjusted Trial Balance</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.asOf)}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-center">Account</th>
              <th className="px-3 py-2 text-center">Name</th>
              <th className="px-3 py-2 text-center">Unadj Debit</th>
              <th className="px-3 py-2 text-center">Unadj Credit</th>
              <th className="px-3 py-2 text-center">Adj Debit</th>
              <th className="px-3 py-2 text-center">Adj Credit</th>
              <th className="px-3 py-2 text-center">Final Debit</th>
              <th className="px-3 py-2 text-center">Final Credit</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-slate-800 text-center tabular-nums">{r.number}</td>
                <td className="px-3 py-2 text-slate-800 text-center">{r.name}</td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.unadjDebit || 0)} /></td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.unadjCredit || 0)} /></td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.adjDebit || 0)} /></td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.adjCredit || 0)} /></td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.finalDebit || 0)} /></td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.finalCredit || 0)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-center" colSpan={2}>Totals</td>
              <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.unadjDebit || 0)} /></td>
              <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.unadjCredit || 0)} /></td>
              <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.adjDebit || 0)} /></td>
              <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.adjCredit || 0)} /></td>
              <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.finalDebit || 0)} /></td>
              <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.finalCredit || 0)} /></td>
            </tr>
          </tfoot>
        </table>
        {!data.balanced && (
          <div className="text-red-700 text-sm mt-3">Warning: Adjusted trial balance does not balance</div>
        )}
      </div>
    </div>
  )
}
