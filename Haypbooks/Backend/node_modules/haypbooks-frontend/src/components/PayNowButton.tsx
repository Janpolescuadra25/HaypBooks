"use client"
import Link from 'next/link'

export function PayNowButton({ invoiceId, amount, className }: { invoiceId: string; amount: number; className?: string }) {
  const dev = process.env.NEXT_PUBLIC_DEV_UI === '1' || process.env.NEXT_PUBLIC_GATEWAY_MOCK === '1'
  const href = `/mock-gateway/checkout?invoiceId=${encodeURIComponent(invoiceId)}&amount=${encodeURIComponent(amount)}`
  if (!dev) {
    return (
      <button className={className || 'rounded-full bg-slate-200 px-4 py-2 text-sm text-slate-500 cursor-not-allowed'} title="Available in dev only">
        Pay now
      </button>
    )
  }
  return (
    <Link href={href as any} className={className || 'rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700'}>
      Pay now
    </Link>
  )
}
export default PayNowButton
