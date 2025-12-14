import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange } from '@/lib/date'
import Amount from '@/components/Amount'
import ReportLive from '@/components/ReportLive'
import Link from 'next/link'

async function fetchAccounts() {
  const res = await fetch(`${getBaseUrl()}/api/accounts?includeInactive=1`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json().catch(() => ({ accounts: [] }))
  return Array.isArray(data.accounts) ? data.accounts : []
}

export default async function GeneralLedgerPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string; account?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  if (searchParams?.account) sp.set('account', searchParams.account)
  const [res, accounts] = await Promise.all([
    fetch(`${getBaseUrl()}/api/reports/general-ledger${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' }),
    fetchAccounts(),
  ])
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
  const baseExport = '/api/reports/general-ledger/export'
  const currentAccountNumber: string | undefined = searchParams?.account || data?.account?.number || undefined
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-slate-700">Account</span>
              <ClientAccountSelectGL accounts={accounts as any} currentNumber={currentAccountNumber} />
            </div>
            <ReportPeriodSelect value={data.period} />
            <RefreshButton />
            <ExportCsvButton exportPath={baseExport} />
            <PrintButton />
          </div>
        </div>
      </div>
      {data.account && (
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600">Account</div>
              <div className="text-base font-medium text-slate-900">{data.account.number} — {data.account.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Opening Balance</div>
              <div className="text-base font-medium text-slate-900"><Amount value={Number(data.opening || 0)} /></div>
            </div>
          </div>
        </div>
      )}
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="General Ledger">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">General Ledger</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.end || data.asOf)}</div>
            <ReportLive>
              <>General Ledger updated. {typeof data.opening !== 'undefined' ? (<span>Opening balance <Amount value={Number(data.opening || 0)} />. </span>) : null}{Array.isArray(data.rows) ? `${data.rows.length} rows.` : ''}</>
            </ReportLive>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Journal</th>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Memo</th>
              <th className="px-3 py-2 tabular-nums">Debit</th>
              <th className="px-3 py-2 tabular-nums">Credit</th>
              <th className="px-3 py-2 tabular-nums">Balance</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {data.rows.map((l: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2">{l.date}</td>
                <td className="px-3 py-2 text-blue-700">
                  <Link href={{ pathname: `/journal-entries/${l.journalId}` }} className="underline decoration-dotted">{l.journalId}</Link>
                </td>
                <td className="px-3 py-2">
                  <Link href={{ pathname: '/reports/general-ledger', query: { ...Object.fromEntries(sp.entries()), account: l.accountNumber } }} className="text-blue-700 underline decoration-dotted">{l.accountNumber}</Link>
                </td>
                <td className="px-3 py-2">{l.accountName}</td>
                <td className="px-3 py-2">{l.memo || ''}</td>
                <td className="px-3 py-2 tabular-nums"><Amount value={Number(l.debit || 0)} /></td>
                <td className="px-3 py-2 tabular-nums"><Amount value={Number(l.credit || 0)} /></td>
                <td className="px-3 py-2 tabular-nums"><Amount value={Number(l.balance || 0)} /></td>
              </tr>
            ))}
            {data.rows.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-4 text-slate-600">No ledger activity in this period.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ClientAccountSelectGL({ accounts, currentNumber }: { accounts: Array<{ id: string; number: string; name?: string }>; currentNumber?: string }) {
  'use client'
  const { usePathname, useRouter, useSearchParams } = require('next/navigation') as typeof import('next/navigation')
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const value = currentNumber || ''
  return (
    <select
      className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm min-w-[12rem]"
      value={value}
      onChange={(e) => {
        const qs = new URLSearchParams(sp?.toString() || '')
        const v = e.target.value
        if (v) qs.set('account', v); else qs.delete('account')
        router.push((`${pathname}?${qs.toString()}`) as any)
      }}
      aria-label="Select account"
    >
      <option value="">All accounts</option>
      {accounts.map((a) => (
        <option key={a.id} value={a.number}>{a.number}{a.name ? ` · ${a.name}` : ''}</option>
      ))}
    </select>
  )
}
