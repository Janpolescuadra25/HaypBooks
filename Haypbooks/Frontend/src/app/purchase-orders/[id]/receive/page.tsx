'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BackButton } from '@/components/BackButton'
import { api } from '@/lib/api'

export default function ReceivePOPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id
  const today = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth()+1).padStart(2,'0')
    const d = String(now.getDate()).padStart(2,'0')
    return `${y}-${m}-${d}`
  }, [])

  const [number, setNumber] = useState('')
  const [billDate, setBillDate] = useState(today)
  const [terms, setTerms] = useState('Net 30')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // RBAC: guard access client-side to match server
  useEffect(() => {
    let alive = true
    async function check() {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        const can = !!p?.permissions?.includes?.('bills:write')
        if (alive && !can) router.replace('/purchase-orders')
      } catch {}
    }
    check()
    return () => { alive = false }
  }, [router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setError(null)
    setSubmitting(true)
    try {
      const body = { billNumber: number || undefined, billDate, terms }
      await api(`/api/purchase-orders/${id}/receive`, { method: 'POST', body: JSON.stringify(body) })
      router.push('/purchase-orders')
    } catch (e: any) {
      setError(e.message || 'Failed to receive purchase order')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="glass-card max-w-xl">
      <h1 id="po-rec-title" className="text-xl font-semibold mb-2 text-slate-900">Receive Purchase Order</h1>
      <p id="po-rec-desc" className="text-sm text-slate-600 mb-4">Enter the bill details to receive this purchase authorization.</p>
      <form onSubmit={onSubmit} className="space-y-5" aria-labelledby="po-rec-title" aria-describedby="po-rec-desc">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="rec-number" className="block text-sm font-medium text-slate-700">Bill #</label>
            <input id="rec-number" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" placeholder="Optional" value={number} onChange={e=>setNumber(e.target.value)} />
          </div>
          <div>
            <label htmlFor="rec-date" className="block text-sm font-medium text-slate-700">Bill date</label>
            <input id="rec-date" type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={billDate} onChange={e=>setBillDate(e.target.value)} required />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rec-terms" className="block text-sm font-medium text-slate-700">Terms</label>
            <input id="rec-terms" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={terms} onChange={e=>setTerms(e.target.value)} placeholder="Net 30, Due on receipt…" />
          </div>
        </div>
        {error && <div id="po-rec-error" className="text-red-600" role="alert">{error}</div>}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" aria-describedby={error ? 'po-rec-error' : undefined} disabled={submitting}>{submitting ? 'Receiving…' : 'Receive'}</button>
          <BackButton ariaLabel="Back to Purchase Orders" fallback="/purchase-orders" disabled={submitting}>Cancel</BackButton>
        </div>
      </form>
    </div>
  )
}
