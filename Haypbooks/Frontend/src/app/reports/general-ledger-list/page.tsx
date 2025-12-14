import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { formatAsOf, formatDateRange } from '@/lib/date'
import Amount from '@/components/Amount'
import { ColumnSettingsButton } from '@/components/ColumnSettingsButton'
import { usePersistedColumns } from '@/hooks/usePersistedColumns'

const GL_COLUMNS = [
  { key: 'account', label: 'Account', required: true },
  { key: 'beginning', label: 'Beginning', required: true },
  { key: 'debits', label: 'Debits', required: true },
  { key: 'credits', label: 'Credits', required: true },
  { key: 'netChange', label: 'Net Change' },
  { key: 'ending', label: 'Ending', required: true },
]

export default async function GeneralLedgerListPage({ searchParams }: { searchParams: { start?: string; end?: string; period?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  if (searchParams?.period) sp.set('period', searchParams.period)

  const res = await fetch(`${getBaseUrl()}/api/reports/general-ledger-list${sp.size ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
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
  const Amt = ({ n }: { n: number }) => <Amount value={Number(n || 0)} />

  return (
    <div className="space-y-4">
      <ReportHeader
        exportPath="/api/reports/general-ledger-list/export"
        periodValue={searchParams?.period as any}
        rightExtras={<ClientColumnSettings storageKey="report:general-ledger-list:columns" options={GL_COLUMNS} defaultVisible={GL_COLUMNS.map(c => c.key as string)} />}
      />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="General Ledger List">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">General Ledger List</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.asOf)}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Account</th>
              <th className="px-3 py-2 text-right">Beginning</th>
              <th className="px-3 py-2 text-right">Debits</th>
              <th className="px-3 py-2 text-right">Credits</th>
              <th className="px-3 py-2 text-right">Net Change</th>
              <th className="px-3 py-2 text-right">Ending</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-top border-slate-200">
                <td className="px-3 py-2 text-slate-800 text-left">{r.account.number} · {r.account.name}</td>
                <td className="px-3 py-2 tabular-nums"><Amt n={r.beginning} /></td>
                <td className="px-3 py-2 tabular-nums"><Amt n={r.debits} /></td>
                <td className="px-3 py-2 tabular-nums"><Amt n={r.credits} /></td>
                <td className="px-3 py-2 tabular-nums"><Amt n={r.netChange} /></td>
                <td className="px-3 py-2 tabular-nums"><Amt n={r.ending} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="px-3 py-2 text-left">Total</td>
              <td className="px-3 py-2 tabular-nums"><Amt n={data.totals.beginning} /></td>
              <td className="px-3 py-2 tabular-nums"><Amt n={data.totals.debits} /></td>
              <td className="px-3 py-2 tabular-nums"><Amt n={data.totals.credits} /></td>
              <td className="px-3 py-2 tabular-nums"><Amt n={data.totals.netChange} /></td>
              <td className="px-3 py-2 tabular-nums"><Amt n={data.totals.ending} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function ClientColumnSettings({ storageKey, options, defaultVisible }: { storageKey: string; options: { key: string; label: string; required?: boolean }[]; defaultVisible: string[] }) {
  'use client'
  const [visible, setVisible] = usePersistedColumns(storageKey, defaultVisible)
  return <ColumnSettingsButton options={options} value={visible} onChange={setVisible} />
}
