import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange } from '@/lib/date'
import { formatPercentFromPct } from '@/lib/format'
import dynamic from 'next/dynamic'
import { CompareHeader } from '@/components/CompareHeader'

async function fetchData(params?: { period?: string; start?: string; end?: string; compare?: string }) {
  const sp = new URLSearchParams()
  if (params?.period) sp.set('period', params.period)
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  if (params?.compare === '1') sp.set('compare', '1')
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/budget-vs-actual${qs}`, { cache: 'no-store' })
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

export default async function BudgetVsActualPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string; compare?: string } }) {
  const data = await fetchData({ period: searchParams?.period, start: searchParams?.start, end: searchParams?.end, compare: searchParams?.compare }) as any
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data as any
  const asOfIso = (data?.asOf || (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString()).slice(0,10)
  const compared = searchParams?.compare === '1'
  const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <ReportPeriodSelect value={data.period} showCompare />
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/budget-vs-actual/export" />
            <PrintButton />
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Budget vs Actual">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Budget vs Actual</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(asOfIso)}</div>
          </caption>
          <CompareHeader
            className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600"
            fixed={{ label: 'Account', align: 'center' }}
            {...(!compared
              ? { columns: [
                    { label: 'Budgeted', align: 'center' },
                    { label: 'Actual', align: 'center' },
                    { label: 'Variance', align: 'center' },
                    { label: 'Variance %', align: 'center' },
                ] }
              : { groups: [
                    { label: 'Budgeted', subLabels: ['Cur','Prev','Δ','%'], align: 'center' },
                    { label: 'Actual', subLabels: ['Cur','Prev','Δ','%'], align: 'center' },
                ] })}
          />
          <tbody className="text-slate-800">
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-top border-slate-200">
                <td className="px-3 py-2 text-center">{r.account}</td>
                {!compared && (<>
                  <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.budgeted)} /></td>
                  <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.actual)} /></td>
                  <td className={`px-3 py-2 text-center tabular-nums ${r.variance >= 0 ? 'text-green-600' : 'text-red-600'}` }><Amount value={Number(r.variance)} /></td>
                  <td className={`px-3 py-2 text-center tabular-nums ${r.variancePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPercentFromPct(r.variancePct, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </>)}
                {compared && (
                  (() => {
                    const prev = r.prev || { budgeted: 0, actual: 0 }
                    const budDelta = Number((r.budgeted - prev.budgeted).toFixed(2))
                    const budPct = prev.budgeted !== 0 ? Number(((budDelta / Math.abs(prev.budgeted)) * 100).toFixed(2)) : 0
                    const actDelta = Number((r.actual - prev.actual).toFixed(2))
                    const actPct = prev.actual !== 0 ? Number(((actDelta / Math.abs(prev.actual)) * 100).toFixed(2)) : 0
                    return (
                      <>
                        <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.budgeted)} /></td>
                        <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(prev.budgeted)} /></td>
                        <td className={`px-3 py-2 text-center tabular-nums ${budDelta >= 0 ? 'text-green-600' : 'text-red-600'}` }><Amount value={budDelta} /></td>
                        <td className={`px-3 py-2 text-center tabular-nums ${budPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPercentFromPct(budPct, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.actual)} /></td>
                        <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(prev.actual)} /></td>
                        <td className={`px-3 py-2 text-center tabular-nums ${actDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}><Amount value={actDelta} /></td>
                        <td className={`px-3 py-2 text-center tabular-nums ${actPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPercentFromPct(actPct, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </>
                    )
                  })()
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-center">Totals</td>
              {!compared && (<>
                <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.budgeted || 0)} /></td>
                <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.actual || 0)} /></td>
                <td className={`px-3 py-2 text-center tabular-nums font-medium ${(data.totals.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}><Amount value={Number(data.totals.variance || 0)} /></td>
                <td className={`px-3 py-2 text-center tabular-nums font-medium ${(data.totals.variancePct || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPercentFromPct(data.totals.variancePct || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </>)}
              {compared && (
                (() => {
                  const prev = data.prevTotals || { budgeted: 0, actual: 0 }
                  const budDelta = Number(((data.totals.budgeted || 0) - (prev.budgeted || 0)).toFixed(2))
                  const budPct = (prev.budgeted || 0) !== 0 ? Number(((budDelta / Math.abs(prev.budgeted || 0)) * 100).toFixed(2)) : 0
                  const actDelta = Number(((data.totals.actual || 0) - (prev.actual || 0)).toFixed(2))
                  const actPct = (prev.actual || 0) !== 0 ? Number(((actDelta / Math.abs(prev.actual || 0)) * 100).toFixed(2)) : 0
                  return (
                    <>
                      <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.budgeted || 0)} /></td>
                      <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(prev.budgeted || 0)} /></td>
                      <td className={`px-3 py-2 text-center tabular-nums font-medium ${budDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}><Amount value={budDelta} /></td>
                      <td className={`px-3 py-2 text-center tabular-nums font-medium ${budPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPercentFromPct(budPct, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.actual || 0)} /></td>
                      <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(prev.actual || 0)} /></td>
                      <td className={`px-3 py-2 text-center tabular-nums font-medium ${actDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}><Amount value={actDelta} /></td>
                      <td className={`px-3 py-2 text-center tabular-nums font-medium ${actPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPercentFromPct(actPct, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </>
                  )
                })()
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}