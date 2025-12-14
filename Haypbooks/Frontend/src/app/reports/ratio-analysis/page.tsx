import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange } from '@/lib/date'
import { formatNumber } from '@/lib/format'

async function fetchData(params?: { period?: string; start?: string; end?: string }) {
  const sp = new URLSearchParams()
  if (params?.period) sp.set('period', params.period)
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/ratio-analysis${qs}`, { cache: 'no-store' })
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

export default async function RatioAnalysisPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
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
            <ExportCsvButton exportPath="/api/reports/ratio-analysis/export" />
            <PrintButton />
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Financial Ratio Analysis">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Financial Ratio Analysis</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(asOfIso)}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-center">Metric</th>
              <th className="px-3 py-2 text-center">Value</th>
              <th className="px-3 py-2 text-center">Unit</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-top border-slate-200">
                <td className="px-3 py-2 text-center">{r.metric}</td>
                <td className="px-3 py-2 text-center tabular-nums">{formatNumber(Number(r.value), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-3 py-2 text-center">{r.unit || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
