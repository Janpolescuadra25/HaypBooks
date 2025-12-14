"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCurrency } from '@/components/CurrencyProvider'
import ClosedThroughBanner from '@/components/ClosedThroughBanner'

function todayIso() { return new Date().toISOString().slice(0,10) }

export default function WriteOffInvoicesPage() {
  // Initialize from URL params if present
  const initial = (()=>{
    if (typeof window === 'undefined') return {} as any
    const p = new URLSearchParams(window.location.search)
    return {
      asOf: p.get('asOf') || undefined,
      maxAmount: p.get('maxAmount') ? Number(p.get('maxAmount')) : undefined,
      minDays: p.get('minDaysPastDue') ? Number(p.get('minDaysPastDue')) : undefined,
      customerId: p.get('customerId') || undefined,
      expenseAccountNumber: p.get('expenseAccountNumber') || undefined,
      memoPrefix: p.get('memoPrefix') || undefined,
    }
  })()
  const [asOf, setAsOf] = useState(initial.asOf || todayIso())
  const [maxAmount, setMaxAmount] = useState(initial.maxAmount ?? 50)
  const [minDays, setMinDays] = useState(initial.minDays ?? 60)
  const [customerId, setCustomerId] = useState(initial.customerId || '')
  const [expenseAccountNumber, setExpenseAccountNumber] = useState('')
  const [memoPrefix, setMemoPrefix] = useState(initial.memoPrefix || 'Small balance')
  const [busy, setBusy] = useState(false)
  const [rows, setRows] = useState<any[]>([])
  const [error, setError] = useState<string|undefined>()
  const [applied, setApplied] = useState<any|null>(null)
  const { formatCurrency } = useCurrency()

  // Load expense accounts for a dropdown (align with accounting/process pattern)
  const [accounts, setAccounts] = useState<any[]>([])
  useEffect(() => {
    let ignore = false
    async function fetchAccounts() {
      try {
        const r = await fetch('/api/accounts?includeInactive=1', { cache: 'no-store' })
        if (!r.ok) return
        const data = await r.json()
        if (!ignore) setAccounts(Array.isArray(data?.rows) ? data.rows : [])
      } catch {}
    }
    fetchAccounts()
    return () => { ignore = true }
  }, [])

  const q = useMemo(() => {
    const params = new URLSearchParams()
    params.set('asOf', asOf)
    params.set('maxAmount', String(maxAmount))
    params.set('minDaysPastDue', String(minDays))
    if (customerId) params.set('customerId', customerId)
    if (expenseAccountNumber) params.set('expenseAccountNumber', expenseAccountNumber)
    if (memoPrefix) params.set('memoPrefix', memoPrefix)
    return params.toString()
  }, [asOf, maxAmount, minDays, customerId, expenseAccountNumber, memoPrefix])

  const load = useCallback(async () => {
    setBusy(true); setError(undefined)
    try {
      // Push params to URL for shareability
      if (typeof window !== 'undefined') {
        const url = `${window.location.pathname}?${q}`
        window.history.replaceState({}, '', url)
      }
      const res = await fetch(`/api/accountant/write-offs/preview?${q}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setRows(data.rows || [])
    } catch (e: any) {
      setError(String(e?.message || 'Failed to load'))
    } finally { setBusy(false) }
  }, [q])

  useEffect(()=>{ load() }, [load])

  async function apply() {
    if (!rows.length) return
    setBusy(true); setError(undefined); setApplied(null)
    try {
      const payload = { items: rows.map(r => ({ id: r.id, amount: r.suggestedAmount })), date: asOf, expenseAccountNumber: expenseAccountNumber || undefined, memoPrefix: memoPrefix || undefined }
      const res = await fetch('/api/accountant/write-offs/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to apply')
      setApplied(data)
      // Reload after apply
      await load()
    } catch (e: any) {
      setError(String(e?.message || 'Failed to apply'))
    } finally { setBusy(false) }
  }

  function exportCsv() {
    window.open(`/api/accountant/write-offs/export?${q}`, '_blank')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Small-balance/Aged Write-offs</h1>
      <div className="glass-card p-4 space-y-3">
        <ClosedThroughBanner date={asOf} onSuggestNextOpenDate={setAsOf} />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">As of</span>
            <input type="date" value={asOf} onChange={e=>setAsOf(e.target.value)} className="border rounded p-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Max amount</span>
            <input type="number" min={1} value={maxAmount} onChange={e=>setMaxAmount(parseInt(e.target.value||'0',10)||0)} className="border rounded p-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Min days past due</span>
            <input type="number" min={0} value={minDays} onChange={e=>setMinDays(parseInt(e.target.value||'0',10)||0)} className="border rounded p-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Customer ID (optional)</span>
            <input type="text" value={customerId} onChange={e=>setCustomerId(e.target.value)} placeholder="cust_..." className="border rounded p-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Expense account (optional)</span>
            <select value={expenseAccountNumber} onChange={e=>setExpenseAccountNumber(e.target.value)} className="border rounded p-2">
              <option value="">Default (Operating Expenses 6000)</option>
              {accounts
                .filter((a:any)=>a.type==='Expense')
                .sort((a:any,b:any)=>a.number.localeCompare(b.number))
                .map((a:any)=>(
                  <option key={a.id} value={a.number}>{a.number} · {a.name}</option>
                ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button className="btn btn-secondary" onClick={exportCsv} disabled={busy}>Export</button>
            <button className="btn btn-primary" onClick={apply} disabled={busy || rows.length===0}>{busy ? 'Working…' : 'Apply'}</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-start-5 md:col-span-2">
            <label className="flex flex-col">
              <span className="text-sm text-slate-600">Memo prefix (optional)</span>
              <input type="text" value={memoPrefix} onChange={e=>setMemoPrefix(e.target.value)} placeholder="Small balance" className="border rounded p-2" />
            </label>
          </div>
        </div>
        {/* Summary of candidates */}
        <div className="text-sm text-slate-600">
          {rows.length > 0 && (
            <span>{rows.length} invoices selected · Total suggested: {formatCurrency(rows.reduce((s,r)=>s+Number(r.suggestedAmount||0),0))}</span>
          )}
        </div>
        {error && <div role="alert" className="text-red-700">{error}</div>}
        <div className="overflow-auto max-h-[50vh]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Customer</th>
                <th className="p-2">Invoice</th>
                <th className="p-2">Due Date</th>
                <th className="p-2">Days Past Due</th>
                <th className="p-2">Balance</th>
                <th className="p-2">Suggested</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.customer}</td>
                  <td className="p-2">{r.number || r.id}</td>
                  <td className="p-2">{r.dueDate}</td>
                  <td className="p-2">{r.daysPastDue}</td>
                  <td className="p-2 text-right tabular-nums font-mono">{formatCurrency(Number(r.balance || 0))}</td>
                  <td className="p-2 text-right tabular-nums font-mono">{formatCurrency(Number(r.suggestedAmount || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && !busy && <div className="p-3 text-slate-600">No candidates based on current filters.</div>}
        </div>
        {applied && (
          <div className="text-slate-700">Applied: {applied.ok} &middot; Failed: {applied.failed}</div>
        )}
      </div>
    </div>
  )
}
