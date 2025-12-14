import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { AccessDeniedCard } from '@/components/AccessDeniedCard'
import { formatAsOf, formatDateRange } from '@/lib/date'
import Amount from '@/components/Amount'
import ReportLive from '@/components/ReportLive'

export default async function ARAgingPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  // Deterministic origin for back-navigation
  const fromUrl = new URL('https://app.local/reports/ar-aging')
  if (searchParams?.period) fromUrl.searchParams.set('period', searchParams.period)
  if (searchParams?.start) fromUrl.searchParams.set('start', searchParams.start)
  if (searchParams?.end) fromUrl.searchParams.set('end', searchParams.end)
  const fromStr = `${fromUrl.pathname}${fromUrl.search ? fromUrl.search : ''}`
  const res = await fetch(`${getBaseUrl()}/api/reports/ar-aging${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <ReportHeader />
        <AccessDeniedCard message="You don’t have permission to view this report." />
      </div>
    )
  }
  const data = await res.json()
  const buckets = ['current','30','60','90','120+'] as const
  return (
    <div className="space-y-4">
      <ReportHeader
        exportPath="/api/reports/ar-aging/export"
        periodValue={data.period}
      />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Accounts Receivable Aging">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">A/R Aging</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.asOf)}</div>
            <ReportLive>
              <>Totals updated. Total <Amount value={Number(data.totals?.total || 0)} /></>
            </ReportLive>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-center">Customer</th>
              {buckets.map((b) => (
                <th key={b} className="px-3 py-2 text-center">{b.toUpperCase()}</th>
              ))}
              <th className="px-3 py-2 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                  <div className="inline-flex flex-col items-center gap-1">
                    <div className="font-medium">No results</div>
                    <div className="text-xs">Try a different date range or clear filters.</div>
                  </div>
                </td>
              </tr>
            ) : (
              data.rows.map((r: any, idx: number) => (
                <tr key={idx} className="border-t border-slate-200">
                  <td className="px-3 py-2 text-slate-800 text-center">
                    <a className="text-sky-700 hover:underline"
                      href={`/reports/ar-aging-detail${sp.toString() ? `?${sp.toString()}&customer=${encodeURIComponent(r.name)}` : `?customer=${encodeURIComponent(r.name)}`}&from=${encodeURIComponent(fromStr)}`}
                      aria-label={`View aging detail for ${r.name}`}>
                      {r.name}
                    </a>
                  </td>
                  {buckets.map((b) => (
                    <td key={b} className="px-3 py-2 text-center tabular-nums">
                      <a
                        className="text-sky-700 hover:underline"
                        href={`/reports/ar-aging-detail${sp.toString() ? `?${sp.toString()}&customer=${encodeURIComponent(r.name)}&bucket=${encodeURIComponent(b)}` : `?customer=${encodeURIComponent(r.name)}&bucket=${encodeURIComponent(b)}`}&from=${encodeURIComponent(fromStr)}`}
                        aria-label={`View ${b.toUpperCase()} detail for ${r.name}`}
                      >
                        <Amount value={Number(r[b] || 0)} />
                      </a>
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(r.total || 0)} /></td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-center">Totals</td>
              {buckets.map((b) => (
                <td key={b} className="px-3 py-2 text-center tabular-nums">
                  <a
                    className="text-sky-700 hover:underline"
                    href={`/reports/ar-aging-detail${sp.toString() ? `?${sp.toString()}&bucket=${encodeURIComponent(b)}` : `?bucket=${encodeURIComponent(b)}`}&from=${encodeURIComponent(fromStr)}`}
                    aria-label={`View ${b.toUpperCase()} aging detail across all customers`}
                  >
                    <Amount value={Number(data.totals[b] || 0)} />
                  </a>
                </td>
              ))}
              <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.total || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
