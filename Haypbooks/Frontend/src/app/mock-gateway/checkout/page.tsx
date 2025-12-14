"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createIntent, attachMethod, captureIntent, listMethods } from '@/lib/gateway/mock'

const MockGatewayCheckoutPage: React.FC = () => {
  const params = useSearchParams()
  const invoiceId = params.get('invoiceId') || 'INV-DEMO'
  const amount = parseFloat(params.get('amount') || '125.00')
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [method, setMethod] = useState('card')
  const [intentId, setIntentId] = useState<string | null>(null)
  const methods = listMethods().filter(m => m.enabled)

  useEffect(() => {
    const intent = createIntent({ invoiceId, amount })
    setIntentId(intent.id)
  }, [invoiceId, amount])

  function pay() {
    if (!intentId) return
    setProcessing(true)
    setTimeout(() => {
      try {
        attachMethod(intentId, method)
        captureIntent(intentId)
      } catch {}
      router.push(`/mock-gateway/confirmation?invoiceId=${encodeURIComponent(invoiceId)}&amount=${amount}`)
    }, 600)
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Mock Payment Gateway</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div className="text-sm text-slate-700">Invoice <span className="font-mono font-medium">{invoiceId}</span></div>
        <div className="text-2xl font-semibold">${amount.toFixed(2)}</div>
        <div className="space-y-2">
          <label htmlFor="pay-method" className="block text-xs font-medium text-slate-700">Payment method</label>
          <select id="pay-method" aria-label="Select payment method" className="input mt-1 w-full" value={method} onChange={(e)=>setMethod(e.target.value)}>
            {methods.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
        <button disabled={processing} onClick={pay} className="w-full rounded-full bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {processing ? 'Processing…' : 'Pay $' + amount.toFixed(2)}
        </button>
        <p className="text-xs text-slate-500">This is a mock. No real charges occur.</p>
      </div>
    </main>
  )
}

export default MockGatewayCheckoutPage
