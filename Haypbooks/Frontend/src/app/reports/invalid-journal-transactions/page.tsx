import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'

export default async function InvalidJournalTransactionsPage({ searchParams }: { searchParams: { start?: string; end?: string; period?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  if (searchParams?.period) sp.set('period', searchParams.period)

  const res = await fetch(`${getBaseUrl()}/api/reports/invalid-journal-transactions${sp.size ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <ReportHeader />
        <div className="glass-card">
          <p className="text-slate-800">Access denied. You don’t have permission to view this report.</p>
        </div>
      </div>
    )
  }
  const data = await res.json()

  const tDebit = data.rows.reduce((s: number, r: any) => s + r.debit, 0)
  const tCredit = data.rows.reduce((s: number, r: any) => s + r.credit, 0)

  return (
    <div className="space-y-4">
      <ReportHeader exportPath="/api/reports/invalid-journal-transactions/export" periodValue={searchParams?.period as any} />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Invalid Journal Transactions">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Invalid Journal Transactions</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.asOf)}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-center">Journal ID</th>
              <th className="px-3 py-2 text-center">Number</th>
              <th className="px-3 py-2 text-center">Date</th>
              <th className="px-3 py-2 text-center">Issue</th>
              <th className="px-3 py-2 text-center">Line</th>
              <th className="px-3 py-2 text-center">Account</th>
              <th className="px-3 py-2 text-center">Debit</th>
              <th className="px-3 py-2 text-center">Credit</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-top border-slate-200">
                <td className="px-3 py-2 text-center text-slate-800">{r.id}</td>
                <td className="px-3 py-2 text-center text-slate-800">{r.number}</td>
                <td className="px-3 py-2 text-center text-slate-800">{formatMMDDYYYY(r.date)}</td>
                <td className="px-3 py-2 text-center text-slate-800">{r.issue}</td>
                <td className="px-3 py-2 text-center text-slate-800">{r.line ?? ''}</td>
                <td className="px-3 py-2 text-center text-slate-800">{r.account}</td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.debit || 0)} /></td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.credit || 0)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="px-3 py-2 text-center" colSpan={6}>Total</td>
              <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(tDebit || 0)} /></td>
              <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(tCredit || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
