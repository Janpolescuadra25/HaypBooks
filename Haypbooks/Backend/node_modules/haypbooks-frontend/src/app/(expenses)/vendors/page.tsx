import Link from 'next/link'
import type { Route } from 'next'
import { getBaseUrl } from '@/lib/server-url'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import VendorsListCard from '@/components/VendorsListCard'
import Notice from '@/components/Notice'

async function loadVendors() {
	const res = await fetch(`${getBaseUrl()}/api/vendors`, { cache: 'no-store' })
	if (!res.ok) throw new Error('Failed to load vendors')
	return res.json()
}

export default async function VendorsPage() {
	const data = await loadVendors()
	const vendors = data.vendors as Array<{ id: string; name: string; terms?: string }>
	const role = getRoleFromCookies()
	const canCreate = hasPermission(role, 'vendors:write')
	return (
		<div className="space-y-4">
			<Notice />
			<VendorsListCard vendors={vendors as any} canCreate={canCreate} />
			<div className="rounded-xl border border-slate-200 bg-white p-3">
				<h2 className="text-sm font-semibold mb-2 text-slate-800">Vendor Statements</h2>
				<div className="text-xs text-slate-600 mb-2">Quick links to statements as of today</div>
				<ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
								{vendors.slice(0,6).map(v => (
						<li key={v.id}>
										<Link
											className="btn-secondary w-full inline-block text-center"
											href={`/vendor-statements/${v.id}` as Route}
										>
											View {v.name}
										</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
