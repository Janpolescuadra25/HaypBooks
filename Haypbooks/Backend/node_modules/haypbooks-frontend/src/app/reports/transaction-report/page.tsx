import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'
import { ColumnSettingsButton } from '@/components/ColumnSettingsButton'
import { usePersistedColumns } from '@/hooks/usePersistedColumns'

const TR_COLUMNS = [
  { key: 'id', label: 'ID', required: true },
  { key: 'date', label: 'Date', required: true },
  { key: 'type', label: 'Type', required: true },
  { key: 'number', label: 'Number' },
  { key: 'name', label: 'Name' },
  { key: 'memo', label: 'Memo' },
  { key: 'amount', label: 'Amount', required: true },
]

async function fetchTR(params?: { period?: string; start?: string; end?: string }) {
  const sp = new URLSearchParams()
  if (params?.period) sp.set('period', params.period)
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/transaction-report${qs}`, { cache: 'no-store' })
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
  return res.json()
}

export default async function TransactionReportPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const data = await fetchTR({ period: searchParams?.period, start: searchParams?.start, end: searchParams?.end }) as any
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data as any
  const asOfIso = (data?.asOf || (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString()).slice(0,10)
  const defaultVisible = TR_COLUMNS.filter(c => c.required || ['number','name','memo'].includes(c.key as string)).map(c => c.key as string)
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <ReportPeriodSelect value={data.period} />
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/transaction-report/export" />
            <PrintButton />
            <ClientColumnSettings storageKey="report:transaction-report:columns" options={TR_COLUMNS} defaultVisible={defaultVisible} />
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Transaction Report">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Transaction Report</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(asOfIso)}</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Number</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Memo</th>
              <th className="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-left tabular-nums">{r.id}</td>
                <td className="px-3 py-2 text-left">{formatMMDDYYYY(r.date)}</td>
                <td className="px-3 py-2 text-left">{r.type}</td>
                <td className="px-3 py-2 text-left">{r.number}</td>
                <td className="px-3 py-2 text-left">{r.name}</td>
                <td className="px-3 py-2 text-left">{r.memo}</td>
                <td className={`px-3 py-2 tabular-nums ${Number(r.amount) < 0 ? 'text-rose-600' : 'text-emerald-700'}`}><Amount value={Number(r.amount || 0)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-left" colSpan={6}>Net Total</td>
              <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.net || 0)} /></td>
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
