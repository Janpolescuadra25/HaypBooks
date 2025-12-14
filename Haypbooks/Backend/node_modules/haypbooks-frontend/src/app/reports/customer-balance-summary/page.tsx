import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { AccessDeniedCard } from '@/components/AccessDeniedCard'
import { formatAsOf, formatDateRange } from '@/lib/date'
import Amount from '@/components/Amount'
import ReportLive from '@/components/ReportLive'

export default async function CustomerBalanceSummaryPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  // Deterministic origin to support Back on detail page
  const fromUrl = new URL('https://app.local/reports/customer-balance-summary')
  if (searchParams?.period) fromUrl.searchParams.set('period', searchParams.period)
  if (searchParams?.start) fromUrl.searchParams.set('start', searchParams.start)
  if (searchParams?.end) fromUrl.searchParams.set('end', searchParams.end)
  const fromStr = `${fromUrl.pathname}${fromUrl.search ? fromUrl.search : ''}`
  const res = await fetch(`${getBaseUrl()}/api/reports/customer-balance-summary${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
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
      <ReportHeader exportPath="/api/reports/customer-balance-summary/export" periodValue={data.period} />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Customer Balance Summary">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Customer Balance Summary</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.asOf)}</div>
            <ReportLive>
              <>Totals updated. Open Balance <Amount value={Number(data.totals?.openBalance || 0)} /></>
            </ReportLive>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-right tabular-nums">Open Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-slate-800">
                  <a
                    className="text-sky-700 hover:underline"
                    href={`/reports/customer-balance-detail${sp.toString() ? `?${sp.toString()}&customer=${encodeURIComponent(r.customer)}` : `?customer=${encodeURIComponent(r.customer)}`}&from=${encodeURIComponent(fromStr)}`}
                    aria-label={`View balance detail for ${r.customer}`}
                  >
                    {r.customer}
                  </a>
                </td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.openBalance || 0)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900">Totals</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium"><Amount value={Number(data.totals.openBalance || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
