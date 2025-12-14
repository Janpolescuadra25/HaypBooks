"use client"

import Amount from '@/components/Amount'
import { formatAsOf, formatDateRange, formatMMDDYYYY } from '@/lib/date'
import { usePersistedColumns } from '@/hooks/usePersistedColumns'
import ReportLiveClient from '@/components/ReportLiveClient'
import { ColumnSettingsButton } from '@/components/ColumnSettingsButton'

type Row = {
  customer: string
  type: string
  number?: string
  invoiceDate: string
  dueDate: string
  aging: number
  openBalance: number
}

const COLUMNS = [
  { key: 'customer', label: 'Customer', required: true },
  { key: 'type', label: 'Type' },
  { key: 'number', label: 'Number' },
  { key: 'invoiceDate', label: 'Invoice Date' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'aging', label: 'Aging (days)' },
  { key: 'openBalance', label: 'Open Balance', required: true },
]

export default function ARAgingTableClient({
  rows,
  totals,
  captionStart,
  captionEnd,
  asOfIso,
}: {
  rows: Row[]
  totals: { openBalance: number }
  captionStart?: string
  captionEnd?: string
  asOfIso?: string
}) {
  const defaultVisible = COLUMNS.filter(c => c.required || ['type','number','invoiceDate','dueDate','aging','openBalance','customer'].includes(c.key))
    .map(c => c.key)
  const [visible, setVisible] = usePersistedColumns('report:ar-aging-detail:columns', defaultVisible)

  const shown = COLUMNS.filter(c => c.required || visible.includes(c.key))
  const caption = captionStart && captionEnd
    ? formatDateRange(captionStart, captionEnd)
    : formatAsOf(asOfIso || new Date().toISOString().slice(0,10))

  return (
    <div className="glass-card overflow-x-auto">
      <div className="flex items-center justify-end pb-2">
        <ColumnSettingsButton options={COLUMNS} value={visible} onChange={setVisible} />
      </div>
      <table className="min-w-full text-sm caption-top" aria-label="A/R Aging Detail">
        <caption className="text-center py-3">
          <div className="text-base font-semibold text-slate-900">A/R Aging Detail</div>
          <div className="text-xs text-slate-600">{caption}</div>
          <ReportLiveClient>
            <>A R Aging Detail updated for {caption}. Total open balance <Amount value={Number(totals?.openBalance || 0)} />.</>
          </ReportLiveClient>
        </caption>
        <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
          <tr>
            {shown.map(col => (
              <th key={col.key} className={
                col.key === 'customer' ? 'px-3 py-2 text-left' :
                col.key === 'openBalance' ? 'px-3 py-2 text-right' :
                'px-3 py-2 text-center'
              }>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t border-slate-200">
              {shown.map(col => {
                if (col.key === 'customer') return <td key={col.key} className="px-3 py-2 text-slate-800">{r.customer}</td>
                if (col.key === 'type') return <td key={col.key} className="px-3 py-2 text-center">{r.type}</td>
                if (col.key === 'number') return <td key={col.key} className="px-3 py-2 text-center">{r.number}</td>
                if (col.key === 'invoiceDate') return <td key={col.key} className="px-3 py-2 text-center">{formatMMDDYYYY(r.invoiceDate)}</td>
                if (col.key === 'dueDate') return <td key={col.key} className="px-3 py-2 text-center">{formatMMDDYYYY(r.dueDate)}</td>
                if (col.key === 'aging') return <td key={col.key} className="px-3 py-2 text-center tabular-nums">{r.aging}</td>
                if (col.key === 'openBalance') return <td key={col.key} className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.openBalance || 0)} /></td>
                return null
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td className="px-3 py-6 text-slate-500 text-center" colSpan={shown.length}>No rows.</td></tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-300 bg-white/60">
            {shown.map((col, i) => {
              if (col.key === 'openBalance') return (
                <td key={col.key} className="px-3 py-2 text-right tabular-nums font-medium">
                  <Amount value={Number(totals.openBalance || 0)} />
                </td>
              )
              if (i === 0) return <td key={col.key} className="px-3 py-2 font-medium text-slate-900">Totals</td>
              return <td key={col.key} className="px-3 py-2" />
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
