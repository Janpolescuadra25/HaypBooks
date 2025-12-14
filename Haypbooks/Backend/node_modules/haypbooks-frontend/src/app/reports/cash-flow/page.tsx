import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange } from '@/lib/date'
import { formatPercentFromPct } from '@/lib/format'
import dynamic from 'next/dynamic'
import { CompareHeader } from '@/components/CompareHeader'
import CFClientSubcolSettings from './ClientSubcolSettings'

async function fetchCF(params?: { period?: string; compare?: string; start?: string; end?: string }) {
  const sp = new URLSearchParams()
  if (params?.period) sp.set('period', params.period)
  if (params?.compare === '1') sp.set('compare', '1')
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/cash-flow${qs}`, { cache: 'no-store' })
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

export default async function CashFlowPage({ searchParams }: { searchParams: { period?: string; compare?: string; start?: string; end?: string; subcols?: string } }) {
  const data = await fetchCF({ period: searchParams?.period, compare: searchParams?.compare, start: searchParams?.start, end: searchParams?.end })
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.compare === '1') sp.set('compare', '1')
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  const asOfIso = (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString().slice(0,10)
  const rangeLabel = searchParams?.start && searchParams?.end
  ? formatDateRange(searchParams.start, searchParams.end)
  : formatAsOf(asOfIso)
  const { operations, investing, financing } = data.sections
  const rows = [
    { name: 'Cash from Operations', amount: operations },
    { name: 'Cash from Investing', amount: investing },
    { name: 'Cash from Financing', amount: financing },
    { name: 'Net Change in Cash', amount: data.netChange },
  ]
  // Determine selected subcolumns for compare
  const defaultSubcols: Array<'curr'|'prev'|'delta'|'pct'> = ['curr','prev','delta','pct']
  const validSub = new Set(['curr','prev','delta','pct'])
  const selectedSubcols = (searchParams?.subcols && searchParams.subcols.split(',').map(s => s.trim()).filter(s => validSub.has(s))) as Array<'curr'|'prev'|'delta'|'pct'> | undefined
  const subcols: Array<'curr'|'prev'|'delta'|'pct'> = (searchParams?.compare === '1')
    ? (selectedSubcols && selectedSubcols.length > 0 ? (selectedSubcols.includes('curr') ? selectedSubcols : (['curr', ...selectedSubcols.filter(s => s !== 'curr')] as any)) : defaultSubcols)
    : ['curr']
  // Client-only currency renderer
  const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })
  return (
    <div className="space-y-4">
  <div className="glass-card print:hidden relative z-40">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0" role="toolbar" aria-label="Report actions">
            <ReportPeriodSelect value={data.period} showCompare />
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/cash-flow/export" />
            <PrintButton />
            {searchParams?.compare === '1' && (
              <CFClientSubcolSettings current={subcols as any} />
            )}
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        {data.prev ? (
            <table className="min-w-full text-sm caption-top" aria-label="Cash Flow">
              <caption className="text-center py-3">
                <div className="text-base font-semibold text-slate-900">Cash Flow</div>
                <div className="text-xs text-slate-600">{rangeLabel}</div>
              </caption>
              <CompareHeader
                className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600"
                fixed={{ label: 'Section', align: 'center' }}
                groups={[{ label: 'Amount', subLabels: subcols.map(s => s === 'curr' ? 'Current' : s === 'prev' ? 'Previous' : s === 'delta' ? 'Δ' : '%'), align: 'center' }]}
              />
              <tbody className="text-slate-800">
                {rows.map((r, i) => (
                  <tr key={r.name} className="border-t border-slate-200">
                    <td className="px-3 py-2 text-center">{r.name}</td>
                    {/* Render selected subcolumns in order */}
                    <td className={`px-3 py-2 text-center tabular-nums ${r.amount < 0 ? 'text-rose-800' : 'text-emerald-700'}`}><Amount value={r.amount} /></td>
                    {subcols.filter(s => s !== 'curr').map(key => {
                      const prevVal = Number(i===0?data.prev.sections.operations:i===1?data.prev.sections.investing:i===2?data.prev.sections.financing:data.prev.netChange)
                      const curVal = Number(r.amount ?? 0)
                      const delta = curVal - prevVal
                      const pct = prevVal !== 0 ? (delta / Math.abs(prevVal)) * 100 : 0
                        if (key === 'prev') return (
                        <td key="prev" className={`px-3 py-2 text-center tabular-nums ${prevVal < 0 ? 'text-rose-800' : 'text-emerald-700'}`}><Amount value={prevVal} /></td>
                      )
                      if (key === 'delta') return (
                        <td key="delta" className={`px-3 py-2 text-center tabular-nums ${delta < 0 ? 'text-rose-800' : 'text-emerald-700'}`}><Amount value={delta} /></td>
                      )
                      if (key === 'pct') return (
                        <td key="pct" className={`px-3 py-2 text-center tabular-nums ${pct < 0 ? 'text-rose-800' : 'text-emerald-700'}`}>{formatPercentFromPct(pct)}</td>
                      )
                      return null
                    })}
                  </tr>)
                )}
              </tbody>
            </table>
        ) : (
          <div>
            <div className="text-center py-2">
              <div className="text-base font-semibold text-slate-900">Cash Flow</div>
              <div className="text-xs text-slate-600">{rangeLabel}</div>
            </div>
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500 px-1 pb-2">
              <span>Account</span>
              <span>Amount</span>
            </div>
            <div className="divide-y divide-slate-200">
            {rows.map((r) => (
              <div key={r.name} className="flex items-center justify-between py-2 text-slate-800">
                <span>{r.name}</span>
                <span className={`tabular-nums font-mono ${r.amount < 0 ? 'text-rose-800' : 'text-emerald-700'}`}>
                  <Amount value={r.amount} />
                </span>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
