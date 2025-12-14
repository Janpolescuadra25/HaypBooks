"use client"

import React, { useMemo, useState } from 'react'
import Amount from '@/components/Amount'
import { formatMMDDYYYY } from '@/lib/date'

type Row = {
  txnId: string
  date: string
  type: string
  number?: string
  payee?: string
  memo?: string
  splitAccount?: string
  debit?: number
  credit?: number
}

export default function TLSBody({ rows }: { rows: Row[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, Row[]>()
    for (const r of rows as Row[]) {
      const key = String(r.txnId ?? '')
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    }
    return Array.from(map.entries()).map(([txnId, items]) => ({ txnId, items }))
  }, [rows])

  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  return (
    <tbody className="text-slate-800">
      {groups.map(({ txnId, items }, gIdx) => {
        const first = items[0]
        const panelId = `tls-splits-${gIdx}`
        const hasSplits = items.length > 1
        const isExpanded = !!expanded[gIdx]
        return (
          <React.Fragment key={gIdx}>
            <tr className="border-t border-slate-200">
              <td className="px-3 py-2 text-left tnum">
                {hasSplits ? (
                  <button
                    type="button"
                    aria-controls={panelId}
                    onClick={() => setExpanded((s) => ({ ...s, [gIdx]: !s[gIdx] }))}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs border border-slate-300 hover:bg-slate-50"
                  >
                    <span className="tnum">{txnId}</span>
                    <span className="text-slate-600">{isExpanded ? 'Hide splits' : 'Show splits'}</span>
                  </button>
                ) : (
                  <span className="tnum">{txnId}</span>
                )}
              </td>
              <td className="px-3 py-2 text-left">{formatMMDDYYYY(first.date)}</td>
              <td className="px-3 py-2 text-left">{first.type}</td>
              <td className="px-3 py-2 text-left">{first.number}</td>
              <td className="px-3 py-2 text-left">{first.payee}</td>
              <td className="px-3 py-2 text-left">{first.memo}</td>
              <td className="px-3 py-2 text-left">{first.splitAccount}</td>
              <td className="px-3 py-2 tabular-nums"><Amount value={Number(first.debit || 0)} /></td>
              <td className="px-3 py-2 tabular-nums"><Amount value={Number(first.credit || 0)} /></td>
            </tr>
            {items.slice(1).map((r, i) => (
              <tr key={i} id={i === 0 ? panelId : undefined} data-split-row className={isExpanded ? '' : 'hidden'}>
                <td className="px-3 py-2 text-left tnum"></td>
                <td className="px-3 py-2 text-left">{formatMMDDYYYY(r.date)}</td>
                <td className="px-3 py-2 text-left">{r.type}</td>
                <td className="px-3 py-2 text-left">{r.number}</td>
                <td className="px-3 py-2 text-left">{r.payee}</td>
                <td className="px-3 py-2 text-left">{r.memo}</td>
                <td className="px-3 py-2 text-left">{r.splitAccount}</td>
                <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.debit || 0)} /></td>
                <td className="px-3 py-2 tabular-nums"><Amount value={Number(r.credit || 0)} /></td>
              </tr>
            ))}
          </React.Fragment>
        )
      })}
    </tbody>
  )
}
