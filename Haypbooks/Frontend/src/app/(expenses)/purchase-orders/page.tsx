import Link from 'next/link'
import { getBaseUrl } from '@/lib/server-url'
import dynamic from 'next/dynamic'
import type { Route } from 'next'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })

async function loadPOs() {
	const res = await fetch(`${getBaseUrl()}/api/purchase-orders`, { cache: 'no-store' })
	if (!res.ok) return { purchaseOrders: [] }
	return res.json()
}

export default async function PurchaseOrdersPage() {
	const role = getRoleFromCookies()
	const canWrite = hasPermission(role, 'bills:write')
	const data = await loadPOs()
	const list = (data.purchaseOrders || []) as Array<{ id: string; number: string; vendor: string; status: string; date: string; total: number }>
	return (
		<div className="space-y-4">
			{/* Expenses sub-navigation is handled by the Expenses layout */}
			<div className="glass-card">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold text-slate-900">Purchase orders</h1>
						<p className="text-slate-600 text-sm">Issue and track purchase authorizations.</p>
					</div>
					{canWrite && (<Link href={'/purchase-orders/new' as Route} className="btn-primary">New PO</Link>)}
				</div>
				<div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
					<table className="min-w-full text-sm">
						<thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Number</th><th className="px-3 py-2 text-left">Vendor</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2 text-left">Status</th>{canWrite && <th className="px-3 py-2 text-right">Actions</th>}</tr></thead>
						<tbody className="text-slate-800">
							{list.length === 0 ? (
								<tr className="border-t border-slate-200"><td className="px-3 py-2" colSpan={canWrite ? 6 : 5}>No purchase orders yet.</td></tr>
							) : list.map(po => (
								<tr key={po.id} className="border-t border-slate-200">
									<td className="px-3 py-2"><Link href={`/purchase-orders/${po.id}`} className="text-sky-700 hover:underline">{po.number}</Link></td>
									<td className="px-3 py-2">{po.vendor}</td>
									<td className="px-3 py-2">{po.date?.slice(0,10)}</td>
									<td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(po.total)} /></td>
									<td className="px-3 py-2 capitalize">{po.status}</td>
									{canWrite && (
										<td className="px-3 py-2 text-right">
											<ReceivePOButton id={po.id} disabled={po.status !== 'open'} />
											<ClosePOButton id={po.id} disabled={po.status !== 'open'} />
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

const ReceivePOButton = dynamic<{ id: string; disabled?: boolean }>(() => import('@/app/purchase-orders/po-receive-button'), { ssr: false })
const ClosePOButton = dynamic<{ id: string; disabled?: boolean }>(() => import('@/app/purchase-orders/po-close-button'), { ssr: false })
