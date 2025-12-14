import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'

export default async function CollectionsReportPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/collections-report${qs}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <ReportHeader />
        <div className="glass-card"><p className="text-slate-800">Access denied. You don’t have permission to view this report.</p></div>
      </div>
    )
  }
  const data = await res.json()
  return (
    <div className="space-y-4">
      <ReportHeader exportPath="/api/reports/collections-report/export" periodValue={data.period} />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Collections Report">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Collections Report</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.asOf)}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Invoice Number</th>
              <th className="px-3 py-2 text-left">Due Date</th>
              <th className="px-3 py-2 text-right">Days Overdue</th>
              <th className="px-3 py-2 text-right">Open Balance</th>
              <th className="px-3 py-2 text-left">Contact</th>
              <th className="px-3 py-2 text-left">Phone</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-slate-800">{r.customer}</td>
                <td className="px-3 py-2 text-slate-800">{r.invoiceNumber}</td>
                <td className="px-3 py-2 text-slate-800">{formatMMDDYYYY(r.dueDate)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.daysOverdue}</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.openBalance)} /></td>
                <td className="px-3 py-2 text-slate-800">{r.contact}</td>
                <td className="px-3 py-2 text-slate-800">{r.phone}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900" colSpan={4}>Totals</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium"><Amount value={Number(data.totals.openBalance)} /></td>
              <td className="px-3 py-2" colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
