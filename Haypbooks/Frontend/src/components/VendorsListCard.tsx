"use client"

import Link from 'next/link'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { useMemo, useState } from 'react'

export type Vendor = { id: string; name: string; terms?: string }

export default function VendorsListCard({ vendors, canCreate }: { vendors: Vendor[]; canCreate: boolean }) {
  const [q, setQ] = useState('')
  const [draftQ, setDraftQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return vendors
    return vendors.filter(v =>
      v.name.toLowerCase().includes(s) ||
      (v.terms || '').toLowerCase().includes(s)
    )
  }, [q, vendors])
  return (
    <div className="glass-card">
      <div className="mb-3 flex items-end justify-between gap-2">
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => { e.preventDefault(); setQ(draftQ) }}
        >
          <div className="flex flex-col">
            <label htmlFor="vendor-search" className="text-xs text-slate-600">Search</label>
            <input
              id="vendor-search"
              type="search"
              value={draftQ}
              onChange={(e) => setDraftQ(e.target.value)}
              placeholder="Name or terms"
              className="w-[28ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm"
            />
          </div>
          <button type="submit" className="rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-sm">Apply</button>
        	<button
            type="button"
            className="rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-sm"
            onClick={() => { setDraftQ(''); setQ('') }}
          >Clear</button>
        </form>
        <div className="flex items-center gap-2">
          <ExportCsvButton exportPath="/api/vendors/export" />
          <PrintButton />
          {canCreate && (<Link href={'/vendors/new' as any} className="btn-primary">New</Link>)}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left hidden sm:table-cell">Terms</th></tr></thead>
          <tbody className="text-slate-800">
            {filtered.map(v => (
              <tr key={v.id} className="border-t border-slate-200">
                <td className="px-3 py-2"><Link className="text-sky-700 hover:underline" href={`/vendors/${v.id}?from=/vendors` as any}>{v.name}</Link></td>
                <td className="px-3 py-2 hidden sm:table-cell">{v.terms || ''}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="px-3 py-6 text-slate-500" colSpan={2}>No vendors match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
