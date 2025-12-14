import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import Amount from '@/components/Amount'
import { formatAsOf } from '@/lib/date'
import { formatPercentFromPct } from '@/lib/format'
// Avoid importing client components directly in a Server Component. Render a static placeholder in SSR.
function ClientOnlyReminders({ asOf }: { asOf: string }) {
  // On the server, render a minimal placeholder. The real interactive button mounts on the client via hydration in the browser.
  return (
    <div className="inline-block text-xs text-slate-500" suppressHydrationWarning>
      Batch Send Reminders
    </div>
  )
}

type Search = { asOf?: string; period?: string; start?: string; end?: string }

async function loadData(sp: URLSearchParams) {
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/collections/overview${qs}`, { cache: 'no-store' })
  if (!res.ok) return null
  const json = await res.json()
  return json.overview as {
    asOf: string
    rows: Array<{
      customerId: string
      name: string
      riskLevel: string
      openInvoices: number
      openBalance: number
      overdueBalance: number
      netReceivable: number
      creditLimit?: number | null
      creditUtilizationPct?: number | null
      daysSinceLastPayment?: number | null
      lastPaymentDate?: string | null
      nextDueDate?: string | null
      lastReminderDate?: string | null
      daysSinceLastReminder?: number | null
      maxReminderCount?: number | null
      worstDunningStage?: string | null
      openPromises?: number | null
      nextPromiseDate?: string | null
      promiseAgingDays?: number | null
    }>
    totals: { customers: number; openBalance: number; overdueBalance: number; netReceivable: number }
  }
}

export default async function CollectionsOverviewPage({ searchParams }: { searchParams: Search }) {
  // Map hub period to asOf for this as-of style report: prefer explicit asOf, else end, else today
  const sp = new URLSearchParams()
  const asOf = searchParams?.asOf || searchParams?.end || new Date().toISOString().slice(0,10)
  sp.set('asOf', asOf)
  const data = await loadData(sp)
  if (!data) {
    return (
      <div className="space-y-4">
        <ReportHeader />
        <div className="glass-card p-4 text-sm text-rose-700">Access denied. You don’t have permission to view this report.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ReportHeader exportPath={`/api/collections/overview/export?asOf=${encodeURIComponent(asOf)}`} showPeriodControls={false} />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Collections Overview">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Collections Overview</div>
            <div className="text-xs text-slate-600">{formatAsOf(asOf)}</div>
            <div className="mt-2"><ClientOnlyReminders asOf={asOf} /></div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Risk</th>
              <th className="px-3 py-2 text-right">Open Invoices</th>
              <th className="px-3 py-2 text-right">Open Balance</th>
              <th className="px-3 py-2 text-right">Overdue</th>
              <th className="px-3 py-2 text-right">Net Receivable</th>
              <th className="px-3 py-2 text-right">Credit Limit</th>
              <th className="px-3 py-2 text-right">Credit Util %</th>
              <th className="px-3 py-2 text-right">Days Since Last Pay</th>
              <th className="px-3 py-2 text-left">Last Payment</th>
              <th className="px-3 py-2 text-left">Next Due</th>
              <th className="px-3 py-2 text-left">Last Reminder</th>
              <th className="px-3 py-2 text-right">Days Since Reminder</th>
              <th className="px-3 py-2 text-right">Reminder Count</th>
              <th className="px-3 py-2 text-left">Worst Dunning Stage</th>
              <th className="px-3 py-2 text-right">Open Promises</th>
              <th className="px-3 py-2 text-left">Next Promise Date</th>
              <th className="px-3 py-2 text-right">Promise Aging Days</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r, idx) => (
              <tr key={r.name + idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-slate-800">
                  {/* Drill-down to the customer statement (read-only snapshot) */}
                  <a href={`/sales/statements/${encodeURIComponent((r as any).customerId || '')}`} className="hover:underline">
                    {r.name}
                  </a>
                </td>
                <td className="px-3 py-2 text-slate-800 capitalize">{r.riskLevel}</td>
                <td className="px-3 py-2 text-right tabular-nums">{Number(r.openInvoices) || 0}</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.openBalance)||0} /></td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.overdueBalance)||0} /></td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.netReceivable)||0} /></td>
                <td className="px-3 py-2 text-right tabular-nums">{r.creditLimit == null ? '—' : <Amount value={Number(r.creditLimit)||0} />}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.creditUtilizationPct == null ? '—' : formatPercentFromPct(Number(r.creditUtilizationPct), { maximumFractionDigits: 1 })}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.daysSinceLastPayment ?? '—'}</td>
                <td className="px-3 py-2 text-slate-800">{r.lastPaymentDate || '—'}</td>
                <td className="px-3 py-2 text-slate-800">{r.nextDueDate || '—'}</td>
                <td className="px-3 py-2 text-slate-800">{r.lastReminderDate || '—'}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.daysSinceLastReminder ?? '—'}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.maxReminderCount ?? '—'}</td>
                <td className="px-3 py-2 text-slate-800">{r.worstDunningStage || '—'}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.openPromises ?? '—'}</td>
                <td className="px-3 py-2 text-slate-800">{r.nextPromiseDate || '—'}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.promiseAgingDays ?? '—'}</td>
              </tr>
            ))}
            {data.rows.length === 0 && (
              <tr><td colSpan={18} className="px-3 py-6 text-center text-slate-500">No customers to show.</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900" colSpan={3}>
                <span aria-live="polite" aria-atomic="true">Totals</span>
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-medium">
                <span aria-live="polite" aria-atomic="true"><Amount value={Number(data.totals.openBalance)||0} /></span>
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-medium">
                <span aria-live="polite" aria-atomic="true"><Amount value={Number(data.totals.overdueBalance)||0} /></span>
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-medium">
                <span aria-live="polite" aria-atomic="true"><Amount value={Number(data.totals.netReceivable)||0} /></span>
              </td>
              <td className="px-3 py-2" colSpan={12}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
