"use client"
import React from 'react'
import ClosedThroughBanner from '@/components/ClosedThroughBanner'

function todayIso() { return new Date().toISOString().slice(0,10) }

type Account = { id: string; number: string; name?: string; type: string }

export default function ReclassifyTransactionsPage() {
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [fromNumber, setFromNumber] = React.useState<string>('')
  const [toNumber, setToNumber] = React.useState<string>('')
  const [amount, setAmount] = React.useState<string>('')
  const [date, setDate] = React.useState<string>(todayIso())
  const [memo, setMemo] = React.useState<string>('')
  const [reversing, setReversing] = React.useState<boolean>(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string|undefined>()
  const [preview, setPreview] = React.useState<any|null>(null)
  const [result, setResult] = React.useState<any|null>(null)

  React.useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const r = await fetch('/api/accounts?includeInactive=1', { cache: 'no-store' })
        const j = await r.json().catch(()=>({ accounts: [] }))
        if (!ignore) setAccounts(Array.isArray(j?.accounts) ? j.accounts : [])
      } catch {}
    }
    load()
    return () => { ignore = true }
  }, [])

  async function doPreview() {
    setBusy(true); setError(undefined); setPreview(null); setResult(null)
    try {
  const payload = { fromAccountNumber: fromNumber, toAccountNumber: toNumber, amount: Number(amount||0), date: date || undefined, memo: memo || undefined, reversing }
      const res = await fetch('/api/accountant/reclassify/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await res.json().catch(()=>null)
      if (!res.ok) throw new Error(j?.error || 'Preview failed')
      setPreview(j)
    } catch (e: any) {
      setError(String(e?.message || 'Failed to preview'))
    } finally { setBusy(false) }
  }

  async function apply() {
    setBusy(true); setError(undefined); setResult(null)
    try {
  const payload = { fromAccountNumber: fromNumber, toAccountNumber: toNumber, amount: Number(amount||0), date: date || undefined, memo: memo || undefined, reversing }
      const res = await fetch('/api/accountant/reclassify/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await res.json().catch(()=>null)
      if (!res.ok) throw new Error(j?.error || 'Apply failed')
      setResult(j)
      setPreview(null)
    } catch (e: any) {
      setError(String(e?.message || 'Failed to apply'))
    } finally { setBusy(false) }
  }

  const canSubmit = fromNumber && toNumber && fromNumber !== toNumber && Number(amount) > 0

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reclassify transactions</h1>
      <div className="glass-card p-4 space-y-3">
        <ClosedThroughBanner date={date} onSuggestNextOpenDate={setDate} />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">From account</span>
            <select className="border rounded p-2" aria-label="From account" value={fromNumber} onChange={e=>setFromNumber(e.target.value)}>
              <option value="">Select account…</option>
              {accounts.sort((a,b)=>a.number.localeCompare(b.number)).map(a=> (
                <option key={a.id} value={a.number}>{a.number} · {a.name || ''}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">To account</span>
            <select className="border rounded p-2" aria-label="To account" value={toNumber} onChange={e=>setToNumber(e.target.value)}>
              <option value="">Select account…</option>
              {accounts.sort((a,b)=>a.number.localeCompare(b.number)).map(a=> (
                <option key={a.id} value={a.number}>{a.number} · {a.name || ''}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Amount</span>
            <input type="number" min={0.01} step="0.01" className="border rounded p-2" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Date</span>
            <input type="date" className="border rounded p-2" value={date} onChange={e=>setDate(e.target.value)} />
          </label>
          <label className="flex flex-col md:col-span-2">
            <span className="text-sm text-slate-600">Memo (optional)</span>
            <input type="text" className="border rounded p-2" value={memo} onChange={e=>setMemo(e.target.value)} placeholder="Reclassification note" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={reversing} onChange={e=>setReversing(e.target.checked)} />
            <span className="text-sm text-slate-700">Create reversing entry on the first day of next month</span>
          </label>
          <div className="flex items-end gap-2">
            <button className="btn btn-secondary" onClick={doPreview} disabled={busy || !canSubmit}>{busy ? 'Working…' : 'Preview'}</button>
            <button className="btn btn-primary" onClick={apply} disabled={busy || !canSubmit}>{busy ? 'Posting…' : 'Post entry'}</button>
          </div>
        </div>
        {error && <div role="alert" className="text-red-700">{error}</div>}
        {preview && (
          <div className="mt-2">
            <div className="text-sm text-slate-700">Preview journal entry</div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm mt-2">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Account</th>
                    <th className="p-2">Debit</th>
                    <th className="p-2">Credit</th>
                    <th className="p-2">Memo</th>
                  </tr>
                </thead>
                <tbody>
                  {(preview?.lines || []).map((l: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{l.accountNumber}</td>
                      <td className="p-2">{l.debit ? Number(l.debit).toFixed(2) : ''}</td>
                      <td className="p-2">{l.credit ? Number(l.credit).toFixed(2) : ''}</td>
                      <td className="p-2">{l.memo || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview?.reversing ? (
              <div className="mt-2 text-xs text-slate-600">A reversing entry will be created on {preview.reversalDate || 'the first day of next month'}.</div>
            ) : null}
          </div>
        )}
        {result && (
          <div className="text-slate-700 space-y-1">
            <div>
              Posted journal entry: <a className="link" href={`/journal/${result?.journalEntryId}`}>
                <span className="font-mono">{result?.journalEntryId}</span>
              </a>
            </div>
            {result?.reversingId && (
              <div>
                Reversing entry: <a className="link" href={`/journal/${result?.reversingId}`}>
                  <span className="font-mono">{result.reversingId}</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="text-sm text-slate-600">
        Notes:
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>Reclassification posts an adjusting journal entry and respects closed-period controls.</li>
          <li>No silent date shifting: choose an open date. The banner suggests the next open date when needed.</li>
          <li>Optionally create an automatic reversing entry on the first day of the next month when using temporary accruals/deferrals.</li>
          <li>Use this tool for classification corrections; it doesn’t modify original source documents.</li>
        </ul>
      </div>
    </div>
  )
}
