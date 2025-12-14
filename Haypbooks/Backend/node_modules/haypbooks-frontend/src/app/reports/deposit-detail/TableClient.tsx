"use client"

import { useMemo } from 'react'
import { usePersistedColumns } from '@/hooks/usePersistedColumns'
import { ColumnSettingsButton } from '@/components/ColumnSettingsButton'
import { useCurrency } from '@/components/CurrencyProvider'
import { formatInteger } from '@/lib/format'

type Row = { date: string; id: string; depositTo: string; memo: string; payments: number; total: number }

const ALL_COLUMNS = [
  { key: 'date', label: 'Date', required: true, align: 'left' as const },
  { key: 'id', label: 'Deposit ID', required: true, align: 'left' as const },
  { key: 'depositTo', label: 'Deposit To', align: 'left' as const },
  { key: 'memo', label: 'Memo', align: 'left' as const },
  { key: 'payments', label: 'Payments', align: 'right' as const },
  { key: 'total', label: 'Total', required: true, align: 'right' as const },
]

export default function DepositDetailClient({ rows }: { rows: Row[] }) {
  const { formatCurrency } = useCurrency()
  const defaultVisible = useMemo(() => ALL_COLUMNS.filter(c => c.required || ['depositTo','payments','total','date','id'].includes(c.key)).map(c => c.key), [])
  const [visible, setVisible] = usePersistedColumns('report:deposit-detail:columns', defaultVisible)

  // Totals
  const totals = useMemo(() => {
    let payments = 0
    let total = 0
    for (const r of rows) { payments += Number(r.payments || 0); total += Number(r.total || 0) }
    return { payments, total }
  }, [rows])

  return (
    <div className="glass-card overflow-x-auto">
      <div className="flex items-center justify-end pb-2">
        <ColumnSettingsButton options={ALL_COLUMNS} value={visible} onChange={setVisible} />
      </div>
      <table className="min-w-full text-sm caption-top" aria-label="Deposit Detail">
        <caption className="text-center py-3">
          <div className="text-base font-semibold text-slate-900">Deposit Detail</div>
        </caption>
        <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
          <tr>
            {ALL_COLUMNS.filter(c => c.required || visible.includes(c.key)).map(col => (
              <th key={col.key} className={`px-3 py-2 ${col.align === 'right' ? 'text-right' : 'text-left'}`}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-slate-800">
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t border-slate-200">
              {ALL_COLUMNS.filter(c => c.required || visible.includes(c.key)).map(col => {
                const isNumeric = col.align === 'right'
                const baseCls = `px-3 py-2 ${isNumeric ? 'text-right tabular-nums font-mono' : 'text-left'}`
                let content: React.ReactNode = (r as any)[col.key]
                if (col.key === 'total') content = formatCurrency(Number(r.total || 0))
                if (col.key === 'payments') content = formatInteger(Number(r.payments || 0))
                return (
                  <td key={col.key} className={baseCls}>{content}</td>
                )
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td className="px-3 py-6 text-slate-500 text-center" colSpan={ALL_COLUMNS.length}>No deposits.</td></tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-300 bg-slate-50">
            {ALL_COLUMNS.filter(c => c.required || visible.includes(c.key)).map((col, i, arr) => {
              if (col.key === 'payments') return <td key={col.key} className="px-3 py-2 text-right tabular-nums font-mono font-medium">{formatInteger(Number(totals.payments || 0))}</td>
              if (col.key === 'total') return <td key={col.key} className="px-3 py-2 text-right tabular-nums font-mono font-medium">{formatCurrency(Number(totals.total || 0))}</td>
              const isLast = i === arr.length - 1
              if (col.key === 'memo') return <td key={col.key} className="px-3 py-2 text-left font-medium">Totals</td>
              return <td key={col.key} className={`${col.align === 'right' ? 'px-3 py-2' : 'px-3 py-2 text-left'}`}>{isLast ? 'Totals' : ''}</td>
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

