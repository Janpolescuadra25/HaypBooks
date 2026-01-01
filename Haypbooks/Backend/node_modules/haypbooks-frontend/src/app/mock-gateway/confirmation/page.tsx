"use client"
import { useSearchParams, useRouter } from 'next/navigation'

export default function MockGatewayConfirmationPage() {
  const params = useSearchParams() ?? new URLSearchParams()
  const router = useRouter()
  const invoiceId = params.get('invoiceId') || 'INV-DEMO'
  const amount = params.get('amount') || '0'

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Payment successful</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
        <p className="text-sm text-slate-700">We recorded your mock payment.</p>
        <p className="text-sm">Invoice <span className="font-mono font-medium">{invoiceId}</span></p>
        <p className="text-2xl font-semibold">${amount}</p>
        <p className="text-xs text-slate-500">A dev-only webhook event was broadcast to Haypbooks. You can close this tab.</p>
        <div className="pt-2">
          <button onClick={()=>router.back()} className="rounded-full border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Go back</button>
        </div>
      </div>
    </main>
  )
}
