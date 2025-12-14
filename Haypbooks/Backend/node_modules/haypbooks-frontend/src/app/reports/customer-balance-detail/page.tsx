import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { AccessDeniedCard } from '@/components/AccessDeniedCard'
import ActiveFilterBar from '@/components/ActiveFilterBar'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'
import ReportLive from '@/components/ReportLive'

export default async function CustomerBalanceDetailPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/customer-balance-detail${qs}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <ReportHeader />
        <AccessDeniedCard message="You don’t have permission to view this report." />
      </div>
    )
  }
  const data = await res.json()
  return (
    <div className="space-y-4">
      <ReportHeader 
        exportPath="/api/reports/customer-balance-detail/export" 
        periodValue={data.period}
      />
      <ActiveFilterBar slug="customer-balance-detail" />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Customer Balance Detail">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Customer Balance Detail</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.asOf)}</div>
            <ReportLive>
              <>Totals updated. Amount <Amount value={Number(data.totals?.amount || 0)} /></>
            </ReportLive>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Number</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Memo</th>
              <th className="px-3 py-2 tabular-nums">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-left text-slate-800">{formatMMDDYYYY(r.date)}</td>
                <td className="px-3 py-2 text-slate-800">{r.type}</td>
                <td className="px-3 py-2 text-slate-800">{r.number}</td>
                <td className="px-3 py-2 text-slate-800">{r.customer}</td>
                <td className="px-3 py-2 text-slate-800">{r.memo}</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.amount || 0)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900" colSpan={5}>Totals</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium"><Amount value={Number(data.totals.amount || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
