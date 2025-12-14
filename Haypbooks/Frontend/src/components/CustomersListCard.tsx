"use client"

import Link from 'next/link'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { useMemo, useState } from 'react'

export type Customer = { id: string; name: string; terms?: string; email?: string; phone?: string }

export default function CustomersListCard({ customers, canCreate }: { customers: Customer[]; canCreate: boolean }) {
  const [q, setQ] = useState('')
  const [draftQ, setDraftQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return customers
    return customers.filter(c =>
      c.name.toLowerCase().includes(s) ||
      (c.terms || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s) ||
      (c.phone || '').toLowerCase().includes(s)
    )
  }, [q, customers])
  return (
    <div className="glass-card">
      <div className="mb-3 flex items-end justify-between gap-2">
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => { e.preventDefault(); setQ(draftQ) }}
        >
          <div className="flex flex-col">
            <label htmlFor="customer-search" className="text-xs text-slate-600">Search</label>
            <input
              id="customer-search"
              type="search"
              value={draftQ}
              onChange={(e) => setDraftQ(e.target.value)}
              placeholder="Name, email, or phone"
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
          <ExportCsvButton exportPath="/api/customers/export" />
          <PrintButton />
          {canCreate && (<Link href={'/customers/new' as any} className="btn-primary">New</Link>)}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left hidden sm:table-cell">Terms</th><th className="px-3 py-2 text-left hidden md:table-cell">Email</th><th className="px-3 py-2 text-left hidden lg:table-cell">Phone</th></tr></thead>
          <tbody className="text-slate-800">
            {filtered.map(c => (
              <tr key={c.id} className="border-t border-slate-200">
                <td className="px-3 py-2"><Link className="text-sky-700 hover:underline" href={`/sales/customers/${c.id}` as any}>{c.name}</Link></td>
                <td className="px-3 py-2 hidden sm:table-cell">{c.terms || ''}</td>
                <td className="px-3 py-2 hidden md:table-cell">{c.email || ''}</td>
                <td className="px-3 py-2 hidden lg:table-cell">{c.phone || ''}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="px-3 py-6 text-slate-500" colSpan={4}>No customers match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
