"use client"
import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from './ToastProvider'
import { useCurrency } from '@/components/CurrencyProvider'
import { formatMMDDYYYY } from '@/lib/date'

interface AllocationDraft { invoiceId: string; number: string; balance: number; amount: string }
interface Props {
  customerId: string
  customerName: string
  invoices: { id: string; number: string; balance: number }[]
  onClose(): void
  onApplied(updatedInvoices: { id: string; balance: number; status: string }[], cp: any): void
}

export default function RecordCustomerPaymentModal({ customerId, customerName, invoices, onClose, onApplied }: Props) {
  const { push } = useToast()
  const { formatCurrency } = useCurrency()
  const [date, setDate] = useState(()=> new Date().toISOString().slice(0,10))
  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')
  const [amountReceived, setAmountReceived] = useState('')
  const [autoCredit, setAutoCredit] = useState(true)
  const [depositTo, setDepositTo] = useState<string>('1010')
  const [allocations, setAllocations] = useState<AllocationDraft[]>(() => invoices.map(inv => ({ invoiceId: inv.id, number: inv.number, balance: inv.balance, amount: '' })))
  const [applyMode, setApplyMode] = useState<'manual' | 'oldest-first'>('oldest-first')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [closedThrough, setClosedThrough] = useState<string | null>(null)
  const firstFieldRef = useRef<HTMLInputElement|null>(null)
  const announceRef = useRef<HTMLDivElement|null>(null)

  useEffect(()=> { firstFieldRef.current?.focus() }, [])

  // Load closed-through date for client-side banner + disable behavior
  useEffect(() => {
    let alive = true
    async function loadClosed() {
      try {
        const res = await fetch('/api/periods', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (alive) setClosedThrough(data?.closedThrough || null)
      } catch {}
    }
    loadClosed()
    return () => { alive = false }
  }, [])

  // Load asset accounts for "Deposit to" selector without external deps
  const [assetAccounts, setAssetAccounts] = useState<any[]>([])
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/accounts?includeInactive=1', { cache: 'no-store' })
        if (!r.ok) return
        const d = await r.json()
        const list: any[] = (d?.accounts || []).filter((a: any) => a.type === 'Asset').sort((a: any, b: any) => String(a.number).localeCompare(String(b.number)))
        if (alive) setAssetAccounts(list)
      } catch { /* noop */ }
    })()
    return () => { alive = false }
  }, [])

  // Auto distribute when amountReceived or mode changes (except in manual)
  useEffect(()=> {
    if (applyMode !== 'oldest-first') return
    const amt = Number(amountReceived)
    if (!(amt>0)) {
      setAllocations(prev => prev.map(a => ({ ...a, amount: '' })))
      return
    }
    let remaining = amt
    setAllocations(prev => prev.map(a => {
      if (remaining <= 0) return { ...a, amount: '' }
      const take = Math.min(remaining, a.balance)
      remaining -= take
      return { ...a, amount: take.toFixed(2) }
    }))
  }, [amountReceived, applyMode])

  const totalAllocated = allocations.reduce((s,a)=> s + (Number(a.amount)||0), 0)
  const amountReceivedNum = Number(amountReceived)||0
  const unapplied = Math.max(0, +(amountReceivedNum - totalAllocated).toFixed(2))
  const isBlocked = !!(closedThrough && date && date.slice(0,10) <= closedThrough)

  function setAllocation(invoiceId: string, val: string) {
    setAllocations(prev => prev.map(a => a.invoiceId === invoiceId ? { ...a, amount: val } : a))
  }

  function validate(): string | null {
    if (!(amountReceivedNum>0)) return 'Amount received must be > 0'
    if (totalAllocated > amountReceivedNum) return 'Allocated exceeds amount received'
    for (const a of allocations) {
      const n = Number(a.amount)||0
      if (n < 0) return 'Negative allocations not allowed'
      if (n > a.balance) return `Allocation exceeds balance for ${a.number}`
    }
    return null
  }

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const v = validate()
      if (v) { setError(v); setSubmitting(false); return }
      const allocPayload = allocations.filter(a => Number(a.amount)>0).map(a => ({ invoiceId: a.invoiceId, amount: Number(a.amount) }))
  const body = { customerId, amountReceived: Number(amountReceived), date, method: method || undefined, reference: reference || undefined, allocations: allocPayload, autoCreditUnapplied: autoCredit, depositAccountNumber: depositTo }
      const res = await api<{ customerPayment: any; invoices: { id: string; number: string; balance: number; status: string }[] }>(`/api/customer-payments`, { method: 'POST', body: JSON.stringify(body) })
      push({ type: 'success', message: 'Payment recorded' })
      onApplied(res.invoices, res.customerPayment)
    } catch (e: any) {
      const msg = e?.message || 'Failed to record payment'
      setError(msg)
      push({ type: 'error', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="rcp-title" onKeyDown={e=>{ if (e.key==='Escape') onClose() }}>
      <form onSubmit={e=>{ e.preventDefault(); void submit() }} className="w-full max-w-3xl bg-white rounded-md shadow-lg p-5 space-y-4">
        <h2 id="rcp-title" className="text-lg font-semibold">Record Payment – <span className="font-normal text-slate-600">{customerName}</span></h2>
        {closedThrough && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" aria-live="polite">
            Closed through: <strong>{formatMMDDYYYY(closedThrough)}</strong>. Payments dated on or before this date will be blocked.
          </div>
        )}
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <label className="font-medium" htmlFor="rcp-date">Date</label>
            <input ref={firstFieldRef} id="rcp-date" type="date" className="border rounded px-2 py-1 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-400/50" value={date} onChange={e=>setDate(e.target.value)} required />
            {closedThrough && (
              <p className="text-amber-700 text-xs mt-1" role="status">
                {isBlocked ? 'Selected date is within a closed period. Choose a later date.' : 'Dates on or before the closed-through date are blocked.'}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium" htmlFor="rcp-amount">Amount Received<span className="text-rose-600">*</span></label>
            <input id="rcp-amount" type="number" step="0.01" min={0.01} className="border rounded px-2 py-1" value={amountReceived} onChange={e=>setAmountReceived(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium" htmlFor="rcp-method">Method</label>
            <input id="rcp-method" type="text" className="border rounded px-2 py-1" value={method} onChange={e=>setMethod(e.target.value)} placeholder="Optional" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium" htmlFor="rcp-ref">Reference #</label>
            <input id="rcp-ref" type="text" className="border rounded px-2 py-1" value={reference} onChange={e=>setReference(e.target.value)} placeholder="Check #, txn id" />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="font-medium" htmlFor="rcp-deposit">Deposit to</label>
            <select id="rcp-deposit" className="border rounded px-2 py-1" value={depositTo} onChange={e=>setDepositTo(e.target.value)}>
              <option value="1010">Undeposited Funds (1010)</option>
              {assetAccounts.filter((a: any) => a.number !== '1010').map((a: any) => (
                <option key={a.id} value={a.number}>{a.name} ({a.number})</option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Choose Undeposited Funds for batch bank deposits, or a bank account to post directly.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium">Apply Mode:</span>
            <label className="flex items-center gap-1"><input type="radio" name="apply-mode" value="oldest-first" checked={applyMode==='oldest-first'} onChange={()=>setApplyMode('oldest-first')} /> Oldest first</label>
            <label className="flex items-center gap-1"><input type="radio" name="apply-mode" value="manual" checked={applyMode==='manual'} onChange={()=>setApplyMode('manual')} /> Manual</label>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={autoCredit} onChange={e=>setAutoCredit(e.target.checked)} /> Create customer credit for unapplied remainder</label>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <div>Allocated: <span className="font-mono tabular-nums">{formatCurrency(totalAllocated)}</span></div>
            <div>Unapplied: <span className="font-mono tabular-nums">{formatCurrency(unapplied)}</span></div>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left font-medium px-3 py-2">Invoice</th>
                <th className="text-right font-medium px-3 py-2">Balance</th>
                <th className="text-right font-medium px-3 py-2 w-40">Apply</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map(a => {
                const disabled = applyMode==='oldest-first'
                return (
                  <tr key={a.invoiceId} className="border-t">
                    <td className="px-3 py-2 text-sky-700">
                      <a href={`/invoices/${a.invoiceId}?from=/invoices`} className="hover:underline">{a.number}</a>
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{formatCurrency(a.balance)}</td>
                    <td className="px-3 py-2 text-right">
                      <input aria-label={`Apply to ${a.number}`} type="number" step="0.01" min={0} max={a.balance} value={a.amount} disabled={disabled} onChange={e=>setAllocation(a.invoiceId, e.target.value)} className="w-32 border rounded px-2 py-1 text-right font-mono tabular-nums disabled:bg-slate-100" />
                    </td>
                  </tr>
                )
              })}
              {allocations.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-slate-500">No open invoices selected</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {error && <div className="text-sm text-rose-600" role="alert">{error}</div>}
        <div ref={announceRef} className="sr-only" aria-live="polite" />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting || !amountReceived || !!validate() || isBlocked}>{submitting ? 'Saving…' : 'Save Payment'}</button>
        </div>
      </form>
    </div>
  )
}
