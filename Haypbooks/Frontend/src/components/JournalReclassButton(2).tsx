"use client"
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'

type Account = { id: string; number: string; name: string; type: string; active?: boolean }

export default function JournalReclassButton() {
  const { loading, has } = usePermissions()
  const can = !loading && has('journal:write' as any)
  const [open, setOpen] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [fromAcc, setFromAcc] = useState('')
  const [toAcc, setToAcc] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [memo, setMemo] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [announce, setAnnounce] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    let alive = true
    async function load() {
      try {
        const r = await fetch('/api/accounts', { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json()
        if (alive) setAccounts((j.accounts || []) as Account[])
      } catch {}
    }
    load()
    return () => { alive = false }
  }, [open])

  const sorted = useMemo(() => {
    return [...accounts].sort((a, b) => a.number.localeCompare(b.number))
  }, [accounts])

  async function submit() {
    if (!can || busy) return
    const amt = Number(amount)
    if (!fromAcc || !toAcc || fromAcc === toAcc) { setError('Choose different From and To accounts'); return }
    if (!(amt > 0)) { setError('Enter a positive amount'); return }
    setBusy(true)
    setError(null)
    setAnnounce('Creating reclass entry…')
    try {
      const res = await fetch('/api/journal/reclass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAccountNumber: fromAcc, toAccountNumber: toAcc, amount: amt, date: date || undefined, memo: memo || undefined })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json?.error || `Failed (${res.status})`); return }
      const id = json?.journalEntryId
      setOpen(false)
      setAnnounce('Reclass entry created')
      if (id) router.push(`/journal/${encodeURIComponent(String(id))}`)
      else router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-lg border border-slate-200 bg-white/80 p-1.5 hover:bg-white disabled:opacity-50"
        aria-label="Create reclassification entry"
        title="Create reclassification entry"
        disabled={!can}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-slate-700"><path fill="currentColor" d="M7 7h10v2H7V7Zm0 4h6v2H7v-2Zm0 4h10v2H7v-2Z"/></svg>
        <span className="sr-only">Create reclassification entry</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="reclass-title" onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}>
          <form className="w-full max-w-xl rounded-md shadow-lg bg-white p-5 space-y-4" onSubmit={(e) => { e.preventDefault(); void submit() }}>
            <h2 id="reclass-title" className="text-lg font-semibold">Reclassify amount</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col text-sm gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="rc-from">From account</label>
                <select id="rc-from" className="border rounded p-1" value={fromAcc} onChange={e=>setFromAcc(e.target.value)}>
                  <option value="">Select…</option>
                  {sorted.map(a => (<option key={a.id} value={a.number}>{a.number} · {a.name}</option>))}
                </select>
              </div>
              <div className="flex flex-col text-sm gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="rc-to">To account</label>
                <select id="rc-to" className="border rounded p-1" value={toAcc} onChange={e=>setToAcc(e.target.value)}>
                  <option value="">Select…</option>
                  {sorted.map(a => (<option key={a.id} value={a.number}>{a.number} · {a.name}</option>))}
                </select>
              </div>
              <div className="flex flex-col text-sm gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="rc-amt">Amount</label>
                <input id="rc-amt" type="number" min="0.01" step="0.01" className="border rounded p-1 text-right" value={amount} onChange={e=>setAmount(e.target.value)} />
              </div>
              <div className="flex flex-col text-sm gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="rc-date">Date (optional)</label>
                <input id="rc-date" type="date" className="border rounded p-1" value={date} onChange={e=>setDate(e.target.value)} />
                <span className="text-xs text-slate-500">Must be in an open period.</span>
              </div>
              <div className="md:col-span-2 flex flex-col text-sm gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="rc-memo">Memo (optional)</label>
                <input id="rc-memo" type="text" className="border rounded p-1" value={memo} onChange={e=>setMemo(e.target.value)} placeholder="Reclass entry" />
              </div>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="sr-only" aria-live="polite">{announce}</div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
