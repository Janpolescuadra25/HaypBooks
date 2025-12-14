import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange } from '@/lib/date'
import { flags } from '@/lib/flags'
import TagSelect from '@/components/TagSelect'
import ActiveFilterBar from '@/components/ActiveFilterBar'
import Amount from '@/components/Amount'
import { formatNumber } from '@/lib/format'

async function fetchData(params?: { period?: string; start?: string; end?: string; tag?: string }) {
  const sp = new URLSearchParams()
  if (params?.period) sp.set('period', params.period)
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  if (params?.tag) sp.set('tag', params.tag)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/expenses-by-vendor-summary${qs}`, { cache: 'no-store' })
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

export default async function ExpensesByVendorSummaryPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string; tag?: string } }) {
  const data = await fetchData({ period: searchParams?.period, start: searchParams?.start, end: searchParams?.end, tag: searchParams?.tag }) as any
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data as any
  const asOfIso = (data?.asOf || (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString()).slice(0,10)
  // Build deterministic origin for drill-down back behavior
  const fromUrl = new URL('https://app.local/reports/expenses-by-vendor-summary')
  if (searchParams?.period) fromUrl.searchParams.set('period', searchParams.period)
  if (searchParams?.start) fromUrl.searchParams.set('start', searchParams.start)
  if (searchParams?.end) fromUrl.searchParams.set('end', searchParams.end)
  if (searchParams?.tag) fromUrl.searchParams.set('tag', searchParams.tag)
  const fromStr = `${fromUrl.pathname}${fromUrl.search ? fromUrl.search : ''}`
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <ReportPeriodSelect value={data.period} />
            {flags.tags && <TagSelect />}
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/expenses-by-vendor-summary/export" />
            <PrintButton />
          </div>
        </div>
      </div>
      <ActiveFilterBar slug="expenses-by-vendor-summary" />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Expenses by Vendor Summary">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Expenses by Vendor Summary</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(asOfIso)}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-center">Vendor</th>
              <th className="px-3 py-2 text-center">Transactions</th>
              <th className="px-3 py-2 text-center">Qty</th>
              <th className="px-3 py-2 text-center">Amount</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-top border-slate-200">
                <td className="px-3 py-2 text-center">
                  <a
                    className="text-blue-700 hover:underline"
                    href={`/reports/purchases-by-vendor-detail?vendor=${encodeURIComponent(r.vendor)}${searchParams?.period ? `&period=${encodeURIComponent(searchParams.period)}` : ''}${searchParams?.start ? `&start=${encodeURIComponent(searchParams.start)}` : ''}${searchParams?.end ? `&end=${encodeURIComponent(searchParams.end)}` : ''}${searchParams?.tag ? `&tag=${encodeURIComponent(searchParams.tag)}` : ''}&from=${encodeURIComponent(fromStr)}`}
                  >
                    {r.vendor}
                  </a>
                </td>
                <td className="px-3 py-2 text-center tabular-nums">{formatNumber(Number(r.transactions))}</td>
                <td className="px-3 py-2 text-center tabular-nums">{formatNumber(Number(r.qty))}</td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.amount)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-center">Totals</td>
              <td className="px-3 py-2 text-center tabular-nums font-medium">{formatNumber(Number(data.totals.transactions || 0))}</td>
              <td className="px-3 py-2 text-center tabular-nums font-medium">{formatNumber(Number(data.totals.qty || 0))}</td>
              <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.amount || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
