"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { useCurrency } from '@/components/CurrencyProvider'

export default function BillQuickPay({ id, balance, status, canWrite }: { id: string; balance?: number; status?: string; canWrite: boolean }) {
  const router = useRouter()
  const bal = Number(balance || 0)
  const [amount, setAmount] = useState<string>(bal > 0 ? bal.toFixed(2) : '')
  const [submitting, setSubmitting] = useState(false)
  const disabled = !canWrite || submitting || status === 'paid' || bal <= 0
  const { push } = useToast()
  const { formatCurrency } = useCurrency()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(amount)
    if (!n || n <= 0) return
    try {
      setSubmitting(true)
      const res = await fetch(`/api/bills/${id}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: n }) })
      if (!res.ok) throw new Error('Failed to record payment')
  push({ type: 'success', message: `Payment recorded (${formatCurrency(Number(amount))})` })
      // Refresh the server-rendered list
      router.refresh()
    } catch (e) {
      console.error(e)
      push({ type: 'error', message: (e as any)?.message || 'Failed to record payment' })
    } finally {
      setSubmitting(false)
    }
  }

  if (disabled) return null

  return (
    <form onSubmit={onSubmit} className="inline-flex items-center gap-2">
      <label htmlFor={`bill-pay-${id}`} className="sr-only">Payment amount</label>
      <input
        id={`bill-pay-${id}`}
        type="number"
        step="0.01"
        min={0.01}
        max={Math.max(0.01, bal)}
        value={amount}
        onChange={(e) => setAmount(e.currentTarget.value)}
        className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-right tabular-nums font-mono"
        placeholder="Amount"
        disabled={submitting}
      />
      {bal > 0 && (
        <button
          type="button"
          onClick={() => setAmount(bal.toFixed(2))}
          className="btn-tertiary !px-2 !py-1 text-xs"
          disabled={submitting}
          title="Fill full remaining balance"
        >Pay remaining</button>
      )}
      <button type="submit" className="btn-secondary !px-2 !py-1 text-xs" disabled={submitting}>
        {submitting ? 'Saving…' : 'Record'}
      </button>
    </form>
  )
}
