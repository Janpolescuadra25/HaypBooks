import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'
import ReportLive from '@/components/ReportLive'

export default async function JournalReportPage({ searchParams }: { searchParams: { start?: string; end?: string; period?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  if (searchParams?.period) sp.set('period', searchParams.period)

  const res = await fetch(`${getBaseUrl()}/api/reports/journal${sp.size ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
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

  return (
    <div className="space-y-4">
      <ReportHeader exportPath="/api/reports/journal/export" periodValue={searchParams?.period as any} />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Journal Report">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Journal</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.asOf)}</div>
            <ReportLive>
              <>Journal updated. {Array.isArray(data.rows) ? `${data.rows.length} rows.` : ''} Totals: Debits <Amount value={Number(data?.totals?.debits || 0)} />; Credits <Amount value={Number(data?.totals?.credits || 0)} />.</>
            </ReportLive>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Journal No</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Memo</th>
              <th className="px-3 py-2 text-right">Debits</th>
              <th className="px-3 py-2 text-right">Credits</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-top border-slate-200">
                <td className="px-3 py-2 text-left">{r.id}</td>
                <td className="px-3 py-2 text-left">{formatMMDDYYYY(r.date)}</td>
                <td className="px-3 py-2 text-left text-slate-800">{r.memo}</td>
                <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.debits || 0)} /></td>
                <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.credits || 0)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="px-3 py-2 text-left">Total</td>
              <td />
              <td />
              <td className="px-3 py-2 tabular-nums"><Amount value={Number(data.totals.debits || 0)} /></td>
              <td className="px-3 py-2 tabular-nums"><Amount value={Number(data.totals.credits || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
