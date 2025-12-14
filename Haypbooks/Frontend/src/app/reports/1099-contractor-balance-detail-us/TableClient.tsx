"use client"

import { usePersistedColumns } from '@/hooks/usePersistedColumns'
import { ColumnSettingsButton } from '@/components/ColumnSettingsButton'
import Amount from '@/components/Amount'
import { formatInteger } from '@/lib/format'
import React from 'react'

const ALL_COLUMNS = [
  { key: 'vendor', label: 'Vendor', align: 'left' },
  { key: 'tin', label: 'TIN (masked)', align: 'left' },
  { key: 'ytd', label: 'YTD Nonemployee Comp', align: 'right' },
  { key: 'eligible', label: 'Eligible (>= $600)', align: 'center' },
]

export default function TableClient({ data }: { data: any }) {
  const defaultVisible = ALL_COLUMNS.map(c => c.key)
  const [visible, setVisible] = usePersistedColumns('report:1099-contractor-balance-detail:columns', defaultVisible)

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm caption-top" aria-label="1099 Contractor Balance Detail">
        <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
          <tr>
            {ALL_COLUMNS.map(col => visible.includes(col.key) && (
              <th key={col.key} className={`px-3 py-2 text-${col.align}`}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-slate-800">
          {data.rows.map((r: any, idx: number) => (
            <tr key={idx} className="border-t border-slate-200">
              {visible.includes('vendor') && <td className="px-3 py-2">{r.vendor}</td>}
              {visible.includes('tin') && <td className="px-3 py-2">{r.tin}</td>}
              {visible.includes('ytd') && <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.ytd || 0)} /></td>}
              {visible.includes('eligible') && <td className="px-3 py-2 text-center">{r.eligible ? 'Yes' : 'No'}</td>}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-300 bg-white/60">
            {visible.includes('vendor') && <td className="px-3 py-2 font-medium text-slate-900" colSpan={visible.includes('tin') ? 2 : 1}>Eligible Contractors</td>}
            {visible.includes('tin') && !visible.includes('vendor') && <td className="px-3 py-2 font-medium text-slate-900">Eligible Contractors</td>}
            {visible.includes('ytd') && <td className="px-3 py-2 text-right tabular-nums font-medium"><Amount value={Number(data.totals.totalYtd || 0)} /></td>}
            {visible.includes('eligible') && <td className="px-3 py-2 text-center font-medium">{formatInteger(Number(data.totals.eligibleCount || 0))}</td>}
          </tr>
        </tfoot>
      </table>
      <div className="mt-2 flex justify-end">
        <ColumnSettingsButton options={ALL_COLUMNS} value={visible} onChange={setVisible} />
      </div>
    </div>
  )
}
