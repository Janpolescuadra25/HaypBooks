import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import Amount from '@/components/Amount'
import Link from 'next/link'

export default async function TrialBalancePage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string; adjusted?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  const adjusted = searchParams?.adjusted === '1' || searchParams?.adjusted === 'true'
  const apiPath = adjusted ? '/api/reports/trial-balance/adjusted' : '/api/reports/trial-balance'
  const res = await fetch(`${getBaseUrl()}${apiPath}${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
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

  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <ReportPeriodSelect value={data.period} />
            {/* Adjusted toggle (query param) */}
            <div className="inline-flex rounded-md border border-slate-300 overflow-hidden" role="group" aria-label="Trial Balance mode">
              {(() => {
                const q1 = new URLSearchParams(sp.toString()); q1.delete('adjusted')
                const q2 = new URLSearchParams(sp.toString()); q2.set('adjusted','1')
                const toObj = (q: URLSearchParams) => {
                  const o: Record<string, string> = {}
                  q.forEach((v,k)=>{ o[k]=v })
                  return o
                }
                return (
                  <>
                    <Link href={{ pathname: '/reports/trial-balance', query: toObj(q1) }} className={`px-2 py-1 text-sm ${!adjusted ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-700'} hover:bg-slate-100`} aria-pressed={!adjusted}>Unadjusted</Link>
                    <Link href={{ pathname: '/reports/trial-balance', query: toObj(q2) }} className={`px-2 py-1 text-sm ${adjusted ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-700'} hover:bg-slate-100`} aria-pressed={adjusted}>Adjusted</Link>
                  </>
                )
              })()}
            </div>
            <RefreshButton />
            <ExportCsvButton exportPath={adjusted ? "/api/reports/trial-balance/adjusted/export" : "/api/reports/trial-balance/export"} />
            <PrintButton />
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label={adjusted ? 'Adjusted Trial Balance' : 'Trial Balance'}>
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">{adjusted ? 'Adjusted Trial Balance' : 'Trial Balance'}</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.asOf)}</div>
            {!adjusted ? (
              <div className="sr-only" aria-live="polite">Totals updated. Debit {formatCurrency(Number(data.totals.debit || 0))}; Credit {formatCurrency(Number(data.totals.credit || 0))}.</div>
            ) : (
              <div className="sr-only" aria-live="polite">Totals updated. Final Debit {formatCurrency(Number(data.totals.finalDebit || 0))}; Final Credit {formatCurrency(Number(data.totals.finalCredit || 0))}.</div>
            )}
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            {!adjusted ? (
              <tr>
                <th className="px-3 py-2 text-left">Account</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 tabular-nums">Debit</th>
                <th className="px-3 py-2 tabular-nums">Credit</th>
              </tr>
            ) : (
              <tr>
                <th className="px-3 py-2 text-left">Account</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 tabular-nums">Unadj Debit</th>
                <th className="px-3 py-2 tabular-nums">Unadj Credit</th>
                <th className="px-3 py-2 tabular-nums">Adj Debit</th>
                <th className="px-3 py-2 tabular-nums">Adj Credit</th>
                <th className="px-3 py-2 tabular-nums">Final Debit</th>
                <th className="px-3 py-2 tabular-nums">Final Credit</th>
              </tr>
            )}
          </thead>
          <tbody className="text-slate-800">
            {!adjusted ? (
              data.rows.map((r: any, idx: number) => (
                <tr key={idx} className="border-t border-slate-200">
                  <td className="px-3 py-2 text-slate-800 text-left tnum">
                    <Link href={{ pathname: '/reports/general-ledger', query: { ...Object.fromEntries(sp.entries()), account: r.number } }} className="text-blue-700 underline decoration-dotted">{r.number}</Link>
                  </td>
                  <td className="px-3 py-2 text-slate-800 text-left">{r.name}</td>
                  <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.debit || 0)} /></td>
                  <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.credit || 0)} /></td>
                </tr>
              ))
            ) : (
              data.rows.map((r: any, idx: number) => (
                <tr key={idx} className="border-t border-slate-200">
                  <td className="px-3 py-2 text-slate-800 text-left tnum">
                    <Link href={{ pathname: '/reports/general-ledger', query: { ...Object.fromEntries(sp.entries()), account: r.number } }} className="text-blue-700 underline decoration-dotted">{r.number}</Link>
                  </td>
                  <td className="px-3 py-2 text-slate-800 text-left">{r.name}</td>
                  <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.unadjDebit || 0)} /></td>
                  <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.unadjCredit || 0)} /></td>
                  <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.adjDebit || 0)} /></td>
                  <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.adjCredit || 0)} /></td>
                  <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.finalDebit || 0)} /></td>
                  <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.finalCredit || 0)} /></td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            {!adjusted ? (
              <tr className="border-t border-slate-300 bg-white/60">
                <td className="px-3 py-2 font-medium text-slate-900 text-left" colSpan={2}>Totals</td>
                <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.debit || 0)} /></td>
                <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.credit || 0)} /></td>
              </tr>
            ) : (
              <tr className="border-t border-slate-300 bg-white/60">
                <td className="px-3 py-2 font-medium text-slate-900 text-left" colSpan={2}>Totals</td>
                <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.unadjDebit || 0)} /></td>
                <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.unadjCredit || 0)} /></td>
                <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.adjDebit || 0)} /></td>
                <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.adjCredit || 0)} /></td>
                <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.finalDebit || 0)} /></td>
                <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.finalCredit || 0)} /></td>
              </tr>
            )}
          </tfoot>
        </table>
        {!data.balanced && (
          <div className="text-red-700 text-sm mt-3">Warning: {adjusted ? 'Adjusted' : 'Unadjusted'} trial balance does not balance</div>
        )}
      </div>
    </div>
  )
}
