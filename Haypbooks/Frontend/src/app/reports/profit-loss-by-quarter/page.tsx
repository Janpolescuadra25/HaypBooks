import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { BackButton } from '@/components/BackButton'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { formatAsOf, formatDateRange } from '@/lib/date'
import { formatNumber } from '@/lib/format'
import { getBaseUrl } from '@/lib/server-url'

type QuarterlyLine = { name: string; values: number[] }

async function fetchData(params?: { period?: string; start?: string; end?: string }) {
  const base = getBaseUrl()
  const u = new URL('/api/reports/profit-loss-by-quarter', base)
  if (params?.period) u.searchParams.set('period', params.period)
  if (params?.start) u.searchParams.set('start', params.start)
  if (params?.end) u.searchParams.set('end', params.end)
  const res = await fetch(u, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load')
  return res.json() as Promise<{ period: string; start: string; end: string; quarters: string[]; lines: QuarterlyLine[] }>
}

function quarterLabel(qk: string): string { return qk.replace('-', ' ') }

export default async function ProfitLossByQuarterPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const data = await fetchData({ period: searchParams?.period, start: searchParams?.start, end: searchParams?.end })
  const asOfIso = (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString().slice(0,10)
  const caption = searchParams?.start && searchParams?.end ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(asOfIso)

  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <ReportPeriodSelect value={data.period as any} />
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/profit-loss-by-quarter/export" />
            <PrintButton />
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top bg-white border border-slate-200" aria-label="Quarterly Profit and Loss Summary">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Quarterly Profit &amp; Loss Summary</div>
            <div className="text-xs text-slate-600">{caption}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left font-semibold border-b border-slate-200">Account</th>
              {data.quarters.map((qk) => (
                <th key={qk} className="px-3 py-2 text-right font-semibold border-b border-slate-200">{quarterLabel(qk)}</th>
              ))}
              <th className="px-3 py-2 text-right font-semibold border-b border-slate-200">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.lines.map((l) => {
              const total = l.values.reduce((a,b) => a+b, 0)
              return (
                <tr key={l.name}>
                  <td className="px-3 py-2 text-slate-900">{l.name}</td>
                  {l.values.map((v, i) => (
                    <td key={i} className="px-3 py-2 text-right tabular-nums">{formatNumber(v)}</td>
                  ))}
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatNumber(total)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
