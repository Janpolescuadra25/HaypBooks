import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import dynamic from 'next/dynamic'
import { formatNumber } from '@/lib/format'
const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })

async function fetchData(params?: { period?: string; start?: string; end?: string }) {
  const sp = new URLSearchParams()
  if (params?.period) sp.set('period', params.period)
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/open-po-detail${qs}`, { cache: 'no-store' })
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

export default async function OpenPODetailPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const data = await fetchData({ period: searchParams?.period, start: searchParams?.start, end: searchParams?.end }) as any
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
            <ExportCsvButton exportPath="/api/reports/open-po-detail/export" />
            <PrintButton />
          </div>
        </div>
      </div>
  <div className="glass-card overflow-x-auto avoid-break-inside">
        <table className="min-w-full text-sm caption-top" aria-label="Open Purchase Order Detail">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Open Purchase Order Detail</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(asOfIso)}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-center">Date</th>
              <th className="px-3 py-2 text-center">Type</th>
              <th className="px-3 py-2 text-center">Number</th>
              <th className="px-3 py-2 text-center">Vendor</th>
              <th className="px-3 py-2 text-center">Item</th>
              <th className="px-3 py-2 text-center">Qty Ordered</th>
              <th className="px-3 py-2 text-center">Qty Received</th>
              <th className="px-3 py-2 text-center">Qty Open</th>
              <th className="px-3 py-2 text-center">Rate</th>
              <th className="px-3 py-2 text-center">Amount Open</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-center">{formatMMDDYYYY(r.date)}</td>
                <td className="px-3 py-2 text-center">{r.type}</td>
                <td className="px-3 py-2 text-center">{r.number}</td>
                <td className="px-3 py-2 text-center">{r.vendor}</td>
                <td className="px-3 py-2 text-center">{r.item}</td>
                <td className="px-3 py-2 text-center tabular-nums">{formatNumber(Number(r.qtyOrdered))}</td>
                <td className="px-3 py-2 text-center tabular-nums">{formatNumber(Number(r.qtyReceived))}</td>
                <td className="px-3 py-2 text-center tabular-nums">{formatNumber(Number(r.qtyOpen))}</td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.rate)} /></td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.amountOpen)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-center" colSpan={5}>Totals</td>
              <td className="px-3 py-2 text-center tabular-nums font-medium">{formatNumber(Number(data.totals.qtyOrdered || 0))}</td>
              <td className="px-3 py-2 text-center tabular-nums font-medium">{formatNumber(Number(data.totals.qtyReceived || 0))}</td>
              <td className="px-3 py-2 text-center tabular-nums font-medium">{formatNumber(Number(data.totals.qtyOpen || 0))}</td>
              <td className="px-3 py-2 text-center tabular-nums font-medium"></td>
              <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.amountOpen || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
