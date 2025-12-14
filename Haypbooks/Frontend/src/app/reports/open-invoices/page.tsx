import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { AccessDeniedCard } from '@/components/AccessDeniedCard'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import Link from 'next/link'
import Amount from '@/components/Amount'

export default async function OpenInvoicesPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  // Build deterministic origin to support BackButton on drill-down pages
  const fromUrl = new URL('https://app.local/reports/open-invoices')
  if (searchParams?.period) fromUrl.searchParams.set('period', searchParams.period)
  if (searchParams?.start) fromUrl.searchParams.set('start', searchParams.start)
  if (searchParams?.end) fromUrl.searchParams.set('end', searchParams.end)
  const fromStr = `${fromUrl.pathname}${fromUrl.search ? fromUrl.search : ''}`
  const res = await fetch(`${getBaseUrl()}/api/reports/open-invoices${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) return (
    <div className="space-y-4">
      <ReportHeader />
      <AccessDeniedCard message="You don’t have permission to view this report." />
    </div>
  )
  const data = await res.json()
  const asOfIso = (data?.asOf || (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString()).slice(0,10)
  return (
    <div className="space-y-4">
      <ReportHeader
        exportPath="/api/reports/open-invoices/export"
        periodValue={data.period}
      />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Open Invoices">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Open Invoices</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(asOfIso)}</div>
            <div className="sr-only" aria-live="polite">Totals updated. Open Balance <Amount value={Number(data.totals?.openBalance || 0)} /></div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Number</th>
              <th className="px-3 py-2 text-left">Invoice Date</th>
              <th className="px-3 py-2 text-left">Due Date</th>
              <th className="px-3 py-2 text-right">Aging (days)</th>
              <th className="px-3 py-2 text-right">Open Balance</th>
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
                  <td className="px-3 py-2 text-slate-800">
                    <Link
                      className="hover:underline"
                      href={`/reports/customer-balance-detail?${sp.toString()}${sp.toString() ? '&' : ''}customer=${encodeURIComponent(r.customer)}&from=${encodeURIComponent(fromStr)}`}
                    >
                      {r.customer}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-left">{r.type}</td>
                  <td className="px-3 py-2 text-left">{r.number}</td>
                  <td className="px-3 py-2 text-left">{formatMMDDYYYY(r.invoiceDate)}</td>
                  <td className="px-3 py-2 text-left">{formatMMDDYYYY(r.dueDate)}</td>
                  <td className="px-3 py-2 tabular-nums">{r.aging}</td>
                  <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.openBalance || 0)} /></td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-left" colSpan={6}>Totals</td>
              <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.openBalance || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
