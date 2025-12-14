import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'
import AccountLedgerFilters from '@/components/AccountLedgerFilters'

export default async function AccountLedgerPage({ searchParams }: { searchParams: { account?: string; start?: string; end?: string; period?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.account) sp.set('account', searchParams.account)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  if (searchParams?.period) sp.set('period', searchParams.period)
  const res = await fetch(`${getBaseUrl()}/api/reports/account-ledger${sp.size ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
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
  <ReportHeader exportPath="/api/reports/account-ledger/export" periodValue={searchParams?.period as any} rightExtras={<AccountLedgerFilters />} />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Account Ledger">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Account Ledger</div>
            <div className="text-xs text-slate-600">{data.account ? `${data.account.number} · ${data.account.name}` : 'All Accounts'}</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.asOf)}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-center">Date</th>
              <th className="px-3 py-2 text-center">Memo</th>
              <th className="px-3 py-2 text-center">Debit</th>
              <th className="px-3 py-2 text-center">Credit</th>
              <th className="px-3 py-2 text-center">Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-top border-slate-200">
                <td className="px-3 py-2 text-slate-800 text-center">{formatMMDDYYYY(r.date)}</td>
                <td className="px-3 py-2 text-slate-800 text-center">{r.memo}</td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.debit || 0)} /></td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.credit || 0)} /></td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(r.balance || 0)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
