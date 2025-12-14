import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { formatMMDDYYYY } from '@/lib/date'
import dynamic from 'next/dynamic'
const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })

async function loadData(searchParams?: { q?: string }) {
  const sp = new URLSearchParams()
  if (searchParams?.q) sp.set('q', searchParams.q)
  const res = await fetch(`${getBaseUrl()}/api/reports/statement-list${sp.size ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function StatementListPage({ searchParams }: { searchParams: { q?: string } }) {
  const data = await loadData(searchParams)
  if (!data) {
    return (
      <div className="space-y-4">
        <ReportHeader exportPath="/api/reports/statement-list/export" showPeriodControls={false} />
        <div className="glass-card"><p className="text-slate-800">Access denied. You don’t have permission to view this report.</p></div>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <ReportHeader exportPath="/api/reports/statement-list/export" showPeriodControls={false} />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Statement List">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Statement List</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 tabular-nums">Amount Due</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-left">{r.customer}</td>
                <td className="px-3 py-2 text-left">{formatMMDDYYYY(r.date)}</td>
                <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.amountDue)} /></td>
                <td className="px-3 py-2 text-left">{r.status}</td>
              </tr>
            ))}
            {data.rows.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-slate-500">No statements.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
