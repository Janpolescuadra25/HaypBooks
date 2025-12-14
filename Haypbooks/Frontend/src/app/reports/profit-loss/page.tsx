import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange } from '@/lib/date'
import Amount from '@/components/Amount'
import ReportLive from '@/components/ReportLive'
import { CompareHeader } from '@/components/CompareHeader'
import PLClientSubcolSettings from './ClientSubcolSettings'

export default async function ProfitLossPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string; compare?: string; subcols?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.compare === '1') sp.set('compare', '1')
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  const res = await fetch(`${getBaseUrl()}/api/reports/profit-loss${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
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
  const data = await res.json()
  const compared = searchParams?.compare === '1'
  const defaultSubcols: Array<'curr'|'prev'|'delta'|'pct'> = ['curr','prev','delta','pct']
  const validSub = new Set(['curr','prev','delta','pct'])
  const selectedSubcols = (searchParams?.subcols && searchParams.subcols.split(',').map(s => s.trim()).filter(s => validSub.has(s))) as Array<'curr'|'prev'|'delta'|'pct'> | undefined
  const subcols: Array<'curr'|'prev'|'delta'|'pct'> = compared
    ? (selectedSubcols && selectedSubcols.length > 0 ? (selectedSubcols.includes('curr') ? selectedSubcols : (['curr', ...selectedSubcols.filter(s => s !== 'curr')] as any)) : defaultSubcols)
    : ['curr']
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <ReportPeriodSelect value={data.period} showCompare />
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/profit-loss/export" />
            <PrintButton />
            {compared && (
              <PLClientSubcolSettings current={subcols as any} />
            )}
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Profit and Loss">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Profit and Loss</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.end)}</div>
            <ReportLive>
              <>Profit and Loss updated{compared ? ' with comparison' : ''}. {Array.isArray(data.lines) ? `${data.lines.length} lines.` : ''}</>
            </ReportLive>
          </caption>
          <CompareHeader
            className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600"
            fixed={{ label: 'Account', align: 'left' }}
            {...(!compared
              ? { columns: [{ label: 'Amount', align: 'center' }] }
              : { groups: [{ label: 'Amount', subLabels: subcols.map(s => s === 'curr' ? 'Current' : s === 'prev' ? 'Previous' : s === 'delta' ? 'Δ' : '%'), align: 'center' }] })}
          />
          <tbody className="text-slate-800">
            {data.lines.map((l: any, idx: number) => {
              const prev = compared ? Number(data.prevLines?.[idx]?.amount ?? 0) : undefined
              const cur = Number(l.amount || 0)
              const delta = prev !== undefined ? cur - prev : 0
              const pct = prev !== undefined && prev !== 0 ? (delta / Math.abs(prev)) * 100 : 0
              return (
                <tr key={idx} className={`border-t border-slate-200 ${l.isSubtotal ? 'bg-white/60' : ''}`}>
                  <td className={`px-3 py-2 ${l.isSubtotal ? 'font-medium' : ''}`}>
                    {!l.isSubtotal && l.accountNumber ? (
                      <a href={`/reports/general-ledger?${(() => { const q = new URLSearchParams(); if (data.period) q.set('period', data.period); if (data.start) q.set('start', data.start); if (data.end) q.set('end', data.end); q.set('account', l.accountNumber); return q.toString() })()}`}
                         className="text-sky-700 hover:underline">
                        {l.name}
                      </a>
                    ) : l.name}
                  </td>
                  {/* Current amount */}
                  <td className={`px-3 py-2 text-center tabular-nums ${l.isSubtotal ? 'font-medium' : ''}`}>
                    <Amount value={cur} />
                  </td>
                  {/* Other selected subcolumns in order */}
                  {compared && subcols.filter(s => s !== 'curr').map((key) => {
                    if (key === 'prev') return (
                      <td key="prev" className={`px-3 py-2 text-center tabular-nums ${l.isSubtotal ? 'font-medium' : ''}`}>
                        <Amount value={prev || 0} />
                      </td>
                    )
                    if (key === 'delta') return (
                      <td key="delta" className={`px-3 py-2 text-center tabular-nums ${l.isSubtotal ? 'font-medium' : ''}`}>
                        <Amount value={delta} />
                      </td>
                    )
                    if (key === 'pct') return (
                      <td key="pct" className={`px-3 py-2 text-center tabular-nums ${l.isSubtotal ? 'font-medium' : ''}`}>
                        {prev && prev !== 0 ? `${((delta / Math.abs(prev)) * 100).toFixed(2)}%` : '0.00%'}
                      </td>
                    )
                    return null
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
// end
