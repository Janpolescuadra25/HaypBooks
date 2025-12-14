import { ReportHeader } from '@/components/ReportHeader'
import StandardReportFilters from '@/components/StandardReportFilters'
import ActiveFilterBar from '@/components/ActiveFilterBar'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import { getBaseUrl } from '@/lib/server-url'
import nextDynamic from 'next/dynamic'
import { formatNumber } from '@/lib/format'

// Use the shared client Amount to format currency values (client-only span)
const Amount = nextDynamic(() => import('@/components/Amount'), { ssr: false })

// Explicitly mark this route as dynamic to avoid any static path warnings in dev
export const dynamic = 'force-dynamic'

async function fetchStandard(slug: string, params: { period?: string; start?: string; end?: string; compare?: string }) {
  const sp = new URLSearchParams()
  if (params.period) sp.set('period', params.period)
  if (params.start) sp.set('start', params.start)
  if (params.end) sp.set('end', params.end)
  if (params.compare === '1') sp.set('compare', '1')
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/standard/${slug}${qs}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function StandardReportStub({ params, searchParams }: { params: { slug: string }; searchParams: { period?: string; start?: string; end?: string; compare?: string } }) {
  const title = params.slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
  const data = await fetchStandard(params.slug, searchParams)
  const asOfIso = (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString().slice(0,10)
  const rangeLabel = searchParams?.start && searchParams?.end
  ? formatDateRange(searchParams.start, searchParams.end)
  : formatAsOf(asOfIso)
  return (
    <div className="space-y-4">
      <ReportHeader
        exportPath={`/api/reports/standard/${params.slug}/export`}
        periodValue={data?.period}
        showCompare
        rightExtras={<StandardReportFilters slug={params.slug} />}
      />
      {/* ActiveFilterBar renders only if any recognized filters are present; otherwise nothing is shown */}
      <ActiveFilterBar slug={params.slug} />
      <div className="glass-card overflow-x-auto">
        <div className="text-center py-2">
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-600">{rangeLabel}</div>
        </div>
        {data?.columns ? (
          <table className="min-w-full text-sm bg-white rounded-xl border border-slate-200">
            <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
              <tr>
                {(() => {
                  // Infer numeric columns from sample rows so header alignment matches cells
                  const numericCols = new Set<number>()
                  const rows = Array.isArray(data.rows) ? data.rows : []
                  const samples = rows.slice(0, Math.min(20, rows.length))
                  for (const r of samples) {
                    if (!Array.isArray(r)) continue
                    r.forEach((cell: any, idx: number) => {
                      if (typeof cell === 'number') numericCols.add(idx)
                    })
                  }
                  return data.columns.map((c: string, i: number) => (
                    <th key={c} className={`px-3 py-2 ${numericCols.has(i) ? 'text-right tabular-nums' : 'text-left'}`}>{c}</th>
                  ))
                })()}
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {(!data.rows || data.rows.length === 0) && (
                <tr>
                  <td colSpan={data.columns.length} className="px-3 py-8 text-center text-slate-500">
                    No data for the selected filters and period.
                  </td>
                </tr>
              )}
              {data.rows && data.rows.map((r: any, i: number) => {
                const isTotal = r && r[0] === 'Total'
                return (
                  <tr key={i} className={`border-t border-slate-200 ${isTotal ? 'bg-slate-50' : ''}`}>
                    {r.map((cell: any, j: number) => {
                      const colName = data.columns[j] as string
                      const isNumber = typeof cell === 'number'
                      const isCurrency = isNumber && /sales|revenue|gross|net|amount|mrr|expansion|contraction|value|cost|balance/i.test(colName)
                      const baseCls = 'px-3 py-2'
                      const align = isNumber ? 'text-right tabular-nums' : 'text-left'
                      const weight = isTotal ? 'font-semibold border-t border-slate-300' : ''
                      let content: any
                      if (isNumber) {
                        content = isCurrency ? <Amount value={Number(cell || 0)} /> : formatNumber(Number(cell))
                      } else if (colName.toLowerCase() === 'date') {
                        content = formatMMDDYYYY(String(cell))
                      } else {
                        content = String(cell)
                      }
                      return (
                        <td key={j} className={`${baseCls} ${align} ${weight}`}>{content}</td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-600">This standard report is not implemented yet. It’s linked from the Standard catalog as a placeholder.</p>
        )}
      </div>
    </div>
  )
}
