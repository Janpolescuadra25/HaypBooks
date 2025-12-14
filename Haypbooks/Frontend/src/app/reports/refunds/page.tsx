import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import Amount from '@/components/Amount'

export default async function RefundsReportPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string; customerId?: string; vendorId?: string; type?: 'ar'|'ap' } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  if (searchParams?.customerId) sp.set('customerId', searchParams.customerId)
  if (searchParams?.vendorId) sp.set('vendorId', searchParams.vendorId)
  if (searchParams?.type) sp.set('type', searchParams.type)

  const res = await fetch(`${getBaseUrl()}/api/reports/refunds${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <ReportHeader />
        <div className="glass-card p-4 text-sm text-rose-700">Access denied or failed to load.</div>
      </div>
    )
  }
  const data = await res.json()

  return (
    <div className="space-y-4">
      <ReportHeader exportPath={`/api/reports/refunds/export${sp.toString() ? `?${sp.toString()}` : ''}`} />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Refunds">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Refunds</div>
            <div className="text-xs text-slate-600">As of {String(data.asOf || '').slice(0,10)}</div>
            <div className="sr-only" aria-live="polite">Total amount <Amount value={Number(data.totals?.amount || 0)} /></div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Side</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-left">Method</th>
              <th className="px-3 py-2 text-left">Reference</th>
              <th className="px-3 py-2 text-left">Linked</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data.rows) && data.rows.length > 0 ? data.rows.map((r: any) => (
              <tr key={r.id} className="border-t border-slate-200">
                <td className="px-3 py-2">{String(r.date || '').slice(0,10)}</td>
                <td className="px-3 py-2">{r.type === 'ar' ? 'AR' : 'AP'}</td>
                <td className="px-3 py-2 tabular-nums text-right"><Amount value={Number(r.amount || 0)} /></td>
                <td className="px-3 py-2">{r.method || '\u2014'}</td>
                <td className="px-3 py-2">{r.reference || '\u2014'}</td>
                <td className="px-3 py-2">{r.linkId ? 'Credit' : '\u2014'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-500">No results</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-left" colSpan={2}>Totals</td>
              <td className="px-3 py-2 tabular-nums font-medium text-right"><Amount value={Number(data.totals?.amount || 0)} /></td>
              <td className="px-3 py-2" colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
