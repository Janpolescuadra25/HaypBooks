import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange } from '@/lib/date'
import dynamic from 'next/dynamic'

async function fetchRE(params?: { period?: string; start?: string; end?: string }) {
  const sp = new URLSearchParams()
  if (params?.period) sp.set('period', params.period)
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/retained-earnings${qs}`, { cache: 'no-store' })
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

export default async function RetainedEarningsPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const data = await fetchRE({ period: searchParams?.period, start: searchParams?.start, end: searchParams?.end }) as any
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data as any
  const asOfIso = (data?.asOf || (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString()).slice(0,10)
  const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <ReportPeriodSelect value={data.period} />
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/retained-earnings/export" />
            <PrintButton />
          </div>
        </div>
      </div>
  <div className="glass-card overflow-x-auto">
        <div className="text-center py-2">
          <div className="text-base font-semibold text-slate-900">Retained Earnings</div>
          <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(asOfIso)}</div>
        </div>
        <table className="mt-2 min-w-full text-sm bg-white rounded-xl border border-slate-200" aria-label="Retained Earnings">
            <thead className="sr-only">
              <tr>
                <th>Label</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              <tr className="border-b border-slate-200">
                <td className="px-3 py-2">Beginning Retained Earnings</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(data.beginning || 0)} /></td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="px-3 py-2">Net Income</td>
                <td className="px-3 py-2 text-right tabular-nums text-emerald-700"><Amount value={Number(data.netIncome || 0)} /></td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="px-3 py-2">Dividends/Draws</td>
                <td className="px-3 py-2 text-right tabular-nums text-rose-600"><Amount value={Number(data.dividends || 0)} /></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Ending Retained Earnings</td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold"><Amount value={Number(data.ending || 0)} /></td>
              </tr>
            </tbody>
          </table>
      </div>
    </div>
  )
}
