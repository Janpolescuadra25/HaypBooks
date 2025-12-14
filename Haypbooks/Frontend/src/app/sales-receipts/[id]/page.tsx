import Link from 'next/link'
import Amount from '@/components/Amount'
import { getBaseUrl } from '@/lib/server-url'
import { BackButton } from '@/components/BackButton'
import { formatMMDDYYYY } from '@/lib/date'

async function fetchReceipt(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/sales-receipts/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function SalesReceiptDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const data = await fetchReceipt(id)
  const r = data?.receipt
  if (!r) {
    return (
      <div className="glass-card">
        <div className="mb-3 print:hidden"><BackButton fallback="/sales-receipts" ariaLabel="Back to Sales Receipts" /></div>
        <div className="text-slate-700">Sales receipt not found.</div>
      </div>
    )
  }
  return (
    <div className="glass-card">
      <div className="mb-3 print:hidden"><BackButton fallback="/sales-receipts" ariaLabel="Back to Sales Receipts" /></div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-slate-900">Sales Receipt {r.id}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-700">Date {formatMMDDYYYY(r.date)}</span>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Customer</th><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
          <tbody className="text-slate-800">
            <tr className="border-t border-slate-200">
              <td className="px-3 py-2">{r.customer}</td>
              <td className="px-3 py-2">{r.description || ''}</td>
              <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.amount)} /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
