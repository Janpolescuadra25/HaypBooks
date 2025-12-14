import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getBaseUrl } from '@/lib/server-url'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })
const ReceivePOButton = dynamic<{ id: string; disabled?: boolean }>(() => import('../po-receive-button'), { ssr: false })
const ClosePOButton = dynamic<{ id: string; disabled?: boolean }>(() => import('../po-close-button'), { ssr: false })

async function loadPO(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/purchase-orders/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function PurchaseOrderDetailPage({ params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  const canWrite = hasPermission(role, 'bills:write')
  const data = await loadPO(params.id)
  if (!data?.purchaseOrder) return <div className="glass-card"><div className="text-slate-600 text-sm">Purchase order not found.</div></div>
  const po = data.purchaseOrder as { id: string; number: string; vendor: string; vendorId: string; date: string; status: string; lines: { description: string; qty: number; rate: number }[]; total: number }
  return (
    <div className="space-y-4">
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{po.number}</h1>
            <p className="text-slate-600 text-sm">Vendor: {po.vendor} • Date: {po.date?.slice(0,10)} • Status: <span className="capitalize">{po.status}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <Link className="btn-secondary" href="/purchase-orders">Back</Link>
            {canWrite && (
              <>
                <ReceivePOButton id={po.id} disabled={po.status !== 'open'} />
                <ClosePOButton id={po.id} disabled={po.status !== 'open'} />
              </>
            )}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Rate</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
            <tbody className="text-slate-800">
              {po.lines.map((l, i) => (
                <tr key={i} className="border-t border-slate-200">
                  <td className="px-3 py-2">{l.description}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{Number(l.qty)}</td>
                  <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(l.rate)} /></td>
                  <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(l.qty) * Number(l.rate)} /></td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 bg-slate-50 font-medium">
                <td className="px-3 py-2 text-right" colSpan={3}>Total</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(po.total)} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
