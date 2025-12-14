import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { AccessDeniedCard } from '@/components/AccessDeniedCard'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import dynamic from 'next/dynamic'
const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })

async function fetchInvoices(params?: { period?: string; start?: string; end?: string }) {
  const sp = new URLSearchParams()
  if (params?.period) sp.set('period', params.period)
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/invoice-list-by-date${qs}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <ReportHeader />
        <AccessDeniedCard message="You don’t have permission to view this report." />
      </div>
    )
  }
  return res.json()
}

export default async function InvoiceListByDatePage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const data = await fetchInvoices({ period: searchParams?.period, start: searchParams?.start, end: searchParams?.end }) as any
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data as any
  const asOfIso = (data?.asOf || (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString()).slice(0,10)
  return (
    <div className="space-y-4">
      <ReportHeader 
        exportPath="/api/reports/invoice-list-by-date/export"
        periodValue={data.period}
      />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Invoice List by Date">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Invoice List by Date</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(asOfIso)}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-center">Date</th>
              <th className="px-3 py-2 text-center">Invoice #</th>
              <th className="px-3 py-2 text-center">Customer</th>
              <th className="px-3 py-2 text-center">Memo</th>
              <th className="px-3 py-2 text-center">Amount</th>
              <th className="px-3 py-2 text-center">Open Balance</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-center">{formatMMDDYYYY(r.date)}</td>
                <td className="px-3 py-2 text-center">{r.number}</td>
                <td className="px-3 py-2 text-center">{r.customer}</td>
                <td className="px-3 py-2 text-center">{r.memo}</td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.amount)} /></td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.openBalance)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-center" colSpan={4}>Totals</td>
              <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.amount || 0)} /></td>
              <td className="px-3 py-2 text-center tabular-nums font-medium"><Amount value={Number(data.totals.openBalance || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
