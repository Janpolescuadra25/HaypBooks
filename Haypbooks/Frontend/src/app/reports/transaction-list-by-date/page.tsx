import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'
import { ColumnSettingsButton } from '@/components/ColumnSettingsButton'
import { usePersistedColumns } from '@/hooks/usePersistedColumns'
import { formatCurrency } from '@/lib/format'

const ALL_COLUMNS = [
  { key: 'date', label: 'Date', required: true },
  { key: 'type', label: 'Type', required: true },
  { key: 'number', label: 'Number' },
  { key: 'name', label: 'Name' },
  { key: 'memo', label: 'Memo' },
  { key: 'debit', label: 'Debit', required: true },
  { key: 'credit', label: 'Credit', required: true },
]

async function fetchTLBD(params?: { period?: string; start?: string; end?: string }) {
  const sp = new URLSearchParams()
  if (params?.period) sp.set('period', params.period)
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res = await fetch(`${getBaseUrl()}/api/reports/transaction-list-by-date${qs}`, { cache: 'no-store' })
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

export default async function TransactionListByDatePage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const data = await fetchTLBD({ period: searchParams?.period, start: searchParams?.start, end: searchParams?.end }) as any
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data as any
  const asOfIso = (data?.asOf || (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString()).slice(0,10)
  const defaultVisible = ALL_COLUMNS.filter(c => c.required || ['number','name','memo'].includes(c.key as string)).map(c => c.key as string)
  // Note: This is a server component. For simplicity and to avoid converting the whole page to a client component,
  // we render all columns by default and only use the ColumnSettingsButton for UI affordance via a tiny client wrapper below.
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <ReportPeriodSelect value={data.period} />
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/transaction-list-by-date/export" />
            <PrintButton />
            {/* Client-only column settings trigger */}
            <ClientColumnSettings storageKey="report:tlbd:columns" options={ALL_COLUMNS} defaultVisible={defaultVisible} />
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Transaction List by Date">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Transaction List by Date</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(asOfIso)}</div>
            <div className="sr-only" aria-live="polite">Totals updated. Debit {formatCurrency(Number(data.totals.debit || 0))}; Credit {formatCurrency(Number(data.totals.credit || 0))}.</div>
          </caption>
          <TLBDThead />
          <tbody className="text-slate-800">
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <TLBDRow r={r} />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <TLBDFoot totals={data.totals} />
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// --- Client-only rendering parts for column visibility ---
function TLBDThead() {
  return (
    <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
      <tr>
        <th className="px-3 py-2 text-left">Date</th>
        <th className="px-3 py-2 text-left">Type</th>
        <th className="px-3 py-2 text-left">Number</th>
        <th className="px-3 py-2 text-left">Name</th>
        <th className="px-3 py-2 text-left">Memo</th>
        <th className="px-3 py-2 text-right">Debit</th>
        <th className="px-3 py-2 text-right">Credit</th>
      </tr>
    </thead>
  )
}

function TLBDRow({ r }: { r: any }) {
  return (
    <>
      <td className="px-3 py-2 text-left">{formatMMDDYYYY(r.date)}</td>
      <td className="px-3 py-2 text-left">{r.type}</td>
      <td className="px-3 py-2 text-left">{r.number}</td>
      <td className="px-3 py-2 text-left">{r.name}</td>
      <td className="px-3 py-2 text-left">{r.memo}</td>
      <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.debit || 0)} /></td>
      <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.credit || 0)} /></td>
    </>
  )
}

function TLBDFoot({ totals }: { totals: any }) {
  return (
    <tr className="border-t border-slate-300 bg-white/60">
      <td className="px-3 py-2 font-medium text-slate-900 text-left" colSpan={5}>Totals</td>
      <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(totals.debit || 0)} /></td>
      <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(totals.credit || 0)} /></td>
    </tr>
  )
}

function ClientColumnSettings({ storageKey, options, defaultVisible }: { storageKey: string; options: { key: string; label: string; required?: boolean }[]; defaultVisible: string[] }) {
  'use client'
  const [visible, setVisible] = usePersistedColumns(storageKey, defaultVisible)
  // For now we only show the control and persist the intent; a future iteration can conditionally render columns using a client-driven table.
  return <ColumnSettingsButton options={options} value={visible} onChange={setVisible} />
}
