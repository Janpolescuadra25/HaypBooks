"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCurrency } from '@/components/CurrencyProvider'
import ClosedThroughBanner from '@/components/ClosedThroughBanner'

function todayIso() { return new Date().toISOString().slice(0,10) }

export default function FinanceChargesPage() {
  const initial = (()=>{
    if (typeof window === 'undefined') return {} as any
    const p = new URLSearchParams(window.location.search)
    return {
      asOf: p.get('asOf') || undefined,
      annualRatePct: p.get('annualRatePct') ? Number(p.get('annualRatePct')) : undefined,
      minCharge: p.get('minCharge') ? Number(p.get('minCharge')) : undefined,
      graceDays: p.get('graceDays') ? Number(p.get('graceDays')) : undefined,
      customerId: p.get('customerId') || undefined,
      incomeAccountNumber: p.get('incomeAccountNumber') || undefined,
      memoPrefix: p.get('memoPrefix') || undefined,
    }
  })()
  const [asOf, setAsOf] = useState(initial.asOf || todayIso())
  const [annualRatePct, setAnnualRatePct] = useState(initial.annualRatePct ?? 18)
  const [minCharge, setMinCharge] = useState(initial.minCharge ?? 2)
  const [graceDays, setGraceDays] = useState(initial.graceDays ?? 0)
  const [customerId, setCustomerId] = useState(initial.customerId || '')
  const [incomeAccountNumber, setIncomeAccountNumber] = useState(initial.incomeAccountNumber || '')
  const [memoPrefix, setMemoPrefix] = useState(initial.memoPrefix || 'Finance charge')
  const [busy, setBusy] = useState(false)
  const [rows, setRows] = useState<any[]>([])
  const [error, setError] = useState<string|undefined>()
  const [result, setResult] = useState<any|null>(null)
  const { formatCurrency } = useCurrency()
  const [incomeAccounts, setIncomeAccounts] = useState<Array<{ id: string; number: string; name: string }>>([])

  const q = useMemo(() => {
    const params = new URLSearchParams()
    params.set('asOf', asOf)
    params.set('annualRatePct', String(annualRatePct))
    params.set('minCharge', String(minCharge))
    params.set('graceDays', String(graceDays))
    if (customerId) params.set('customerId', customerId)
    if (incomeAccountNumber) params.set('incomeAccountNumber', incomeAccountNumber)
    if (memoPrefix) params.set('memoPrefix', memoPrefix)
    return params.toString()
  }, [asOf, annualRatePct, minCharge, graceDays, customerId, incomeAccountNumber, memoPrefix])

  const load = useCallback(async () => {
    setBusy(true); setError(undefined)
    try {
      if (typeof window !== 'undefined') {
        const url = `${window.location.pathname}?${q}`
        window.history.replaceState({}, '', url)
      }
      const res = await fetch(`/api/accountant/finance-charges/preview?${q}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setRows(data.rows || [])
    } catch (e: any) {
      setError(String(e?.message || 'Failed to load'))
    } finally { setBusy(false) }
  }, [q])

  useEffect(()=>{ load() }, [load])

  // Load Income accounts for the Income account selector (default to 4100 if present)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/accounts?includeInactive=1', { cache: 'no-store' })
        if (!res.ok) return
        const j = await res.json()
        const rows = Array.isArray(j?.rows) ? j.rows : (Array.isArray(j) ? j : [])
        const income = rows
          .filter((a: any) => (a?.type || '').toLowerCase() === 'income')
          .map((a: any) => ({ id: a.id, number: a.number, name: a.name }))
          .sort((a: any, b: any) => (a.number || '').localeCompare(b.number || ''))
        if (!alive) return
        setIncomeAccounts(income)
        if (!incomeAccountNumber) {
          const def = income.find((a: { id: string; number: string; name: string }) => a.number === '4100') || income[0]
          if (def) setIncomeAccountNumber(def.number)
        }
      } catch {}
    })()
    return () => { alive = false }
  }, [incomeAccountNumber])

  async function apply() {
    if (!rows.length) return
    // Confirm before applying mutative bulk action
    try {
      const total = rows.reduce((s, r) => s + Number(r.suggestedCharge || 0), 0)
      const count = rows.length
      const msg = `Apply ${count} finance charge${count===1?'':'s'} totaling ${formatCurrency(total)}?`
      if (typeof window !== 'undefined') {
        const ok = window.confirm(msg)
        if (!ok) return
      }
    } catch {}
    setBusy(true); setError(undefined); setResult(null)
    try {
  const payload = { items: rows.map(r => ({ invoiceId: r.id, amount: r.suggestedCharge })), date: asOf, memoPrefix: memoPrefix || undefined, incomeAccountNumber: incomeAccountNumber || undefined }
      const res = await fetch('/api/accountant/finance-charges/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to apply')
      setResult(data)
      await load()
    } catch (e: any) {
      setError(String(e?.message || 'Failed to apply'))
    } finally { setBusy(false) }
  }

  function exportCsv() {
    window.open(`/api/accountant/finance-charges/export?${q}`, '_blank')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Finance Charges (Late Fees)</h1>
      <div className="glass-card p-4 space-y-3">
        <ClosedThroughBanner date={asOf} onSuggestNextOpenDate={setAsOf} />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">As of</span>
            <input type="date" value={asOf} onChange={e=>setAsOf(e.target.value)} className="border rounded p-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Annual rate %</span>
            <input type="number" min={0} value={annualRatePct} onChange={e=>setAnnualRatePct(parseFloat(e.target.value||'0')||0)} className="border rounded p-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Minimum charge</span>
            <input type="number" min={0} step="0.01" value={minCharge} onChange={e=>setMinCharge(parseFloat(e.target.value||'0')||0)} className="border rounded p-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Grace days</span>
            <input type="number" min={0} value={graceDays} onChange={e=>setGraceDays(parseInt(e.target.value||'0',10)||0)} className="border rounded p-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Customer ID (optional)</span>
            <input type="text" value={customerId} onChange={e=>setCustomerId(e.target.value)} placeholder="cust_..." className="border rounded p-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Income account</span>
            <select className="border rounded p-2" value={incomeAccountNumber} onChange={e=>setIncomeAccountNumber(e.target.value)}>
              <option value="">Select Income account</option>
              {incomeAccounts.map(a => (
                <option key={a.id} value={a.number}>{a.number} — {a.name}</option>
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
              <input type="text" value={memoPrefix} onChange={e=>setMemoPrefix(e.target.value)} placeholder="Finance charge" className="border rounded p-2" />
            </label>
          </div>
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
                <th className="p-2">Assess Days</th>
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
                  <td className="p-2">{r.assessDays}</td>
                  <td className="p-2 text-right tabular-nums font-mono">{formatCurrency(Number(r.balance || 0))}</td>
                  <td className="p-2 text-right tabular-nums font-mono">{formatCurrency(Number(r.suggestedCharge || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && !busy && <div className="p-3 text-slate-600">No candidates based on current parameters.</div>}
        </div>
        {result && (
          <div className="text-slate-700">Applied: {result.ok} · Failed: {result.failed}</div>
        )}
      </div>
    </div>
  )
}
