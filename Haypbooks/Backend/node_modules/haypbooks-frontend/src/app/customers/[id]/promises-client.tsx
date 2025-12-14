"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react'

type PromiseToPay = {
  id: string
  customerId: string
  amount: number
  promisedDate: string
  status: 'open' | 'kept' | 'broken'
  createdAt?: string
  note?: string
}

function isoToday() {
  return new Date().toISOString().slice(0,10)
}

export default function CustomerPromisesPanel({ customerId, canManage = true }: { customerId: string; canManage?: boolean }) {
  const [promises, setPromises] = useState<PromiseToPay[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(isoToday())
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const idPrefix = useMemo(() => `promise-${customerId || 'x'}`.replace(/[^a-zA-Z0-9_-]/g, '-'), [customerId])

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch(`/api/collections/promises?customerId=${encodeURIComponent(customerId)}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setPromises(Array.isArray(data.promises) ? data.promises : [])
    } catch (e: any) {
      setErr('Failed to load promises')
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => { load() }, [load])

  const summary = useMemo(() => {
    const open = promises.filter(p => p.status === 'open')
    const broken = promises.filter(p => p.status === 'broken')
    let nextDate: string | null = null
    for (const p of open) {
      if (!nextDate || p.promisedDate < nextDate) nextDate = p.promisedDate
    }
    let aging: number | null = null
    const today = new Date()
    for (const p of broken) {
      const days = Math.max(0, Math.floor((today.getTime() - new Date(p.promisedDate).getTime())/86400000))
      if (aging == null || days > aging) aging = days
    }
    return { openCount: open.length, nextDate, aging }
  }, [promises])

  async function createPromise(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErr(null)
    try {
      const payload: any = { customerId, amount: Number(amount), promisedDate: date }
      if (note) payload.note = note
      const res = await fetch('/api/collections/promises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`${res.status}`)
      setAmount('')
      setDate(isoToday())
      setNote('')
      await load()
    } catch (e: any) {
      setErr(e?.message === '403' ? 'You do not have permission to create promises' : 'Failed to create promise')
    } finally {
      setSubmitting(false)
    }
  }

  async function updateStatus(id: string, action: 'keep' | 'broken') {
    setErr(null)
    try {
      const res = await fetch(`/api/collections/promises/${encodeURIComponent(id)}/${action}`, { method: 'POST' })
      if (!res.ok) throw new Error(`${res.status}`)
      await load()
    } catch (e: any) {
      setErr(e?.message === '403' ? 'You do not have permission to update promises' : 'Failed to update promise')
    }
  }

  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Promises to pay</h2>
      </div>
      <div aria-live="polite" className="sr-only">
        Open promises {summary.openCount}. {summary.nextDate ? `Next promise ${summary.nextDate}. ` : ''}{summary.aging != null ? `Broken promise aging ${summary.aging} days.` : ''}
      </div>
      {err && <p role="alert" className="text-sm text-red-700 mb-2">{err}</p>}
  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Promised date</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Note</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {loading ? (
              <tr><td className="px-3 py-2" colSpan={5}>Loading…</td></tr>
            ) : promises.length === 0 ? (
              <tr><td className="px-3 py-2" colSpan={5}>No promises on file.</td></tr>
            ) : (
              promises.map(p => (
                <tr key={p.id} className="border-t border-slate-200">
                  <td className="px-3 py-2">{p.promisedDate}</td>
                  <td className="px-3 py-2 text-right tabular-nums">${Number(p.amount).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    {p.status === 'broken' ? (
                      <span className="text-red-700">Broken</span>
                    ) : p.status === 'kept' ? (
                      <span className="text-emerald-700">Kept</span>
                    ) : (
                      <span className="text-slate-700">Open</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{p.note || '\u2014'}</td>
                  <td className="px-3 py-2">
                    {p.status === 'open' ? (
                      <div className="flex gap-2">
                        <button className="btn-secondary text-xs" onClick={() => updateStatus(p.id, 'keep')} disabled={!canManage}>Mark kept</button>
                        <button className="btn-secondary text-xs" onClick={() => updateStatus(p.id, 'broken')} disabled={!canManage}>Mark broken</button>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <form onSubmit={createPromise} className="mt-3 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor={`${idPrefix}-amount`} className="block text-xs text-slate-600">Amount</label>
          <input id={`${idPrefix}-amount`} name="amount" required type="number" step="0.01" min="0" value={amount} onChange={e=>setAmount(e.target.value)} className="input" disabled={!canManage} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-date`} className="block text-xs text-slate-600">Promised date</label>
          <input id={`${idPrefix}-date`} name="promisedDate" required type="date" value={date} onChange={e=>setDate(e.target.value)} className="input" disabled={!canManage} />
        </div>
        <div className="grow min-w-[200px]">
          <label htmlFor={`${idPrefix}-note`} className="block text-xs text-slate-600">Note</label>
          <input id={`${idPrefix}-note`} name="note" type="text" value={note} onChange={e=>setNote(e.target.value)} className="input w-full" placeholder="Optional" disabled={!canManage} />
        </div>
        <button type="submit" className="btn-secondary" disabled={submitting || !canManage}>Create promise</button>
      </form>
      {!canManage && (
        <p className="mt-1 text-xs text-slate-600">Your role can’t create or update promises.</p>
      )}
    </div>
  )
}
