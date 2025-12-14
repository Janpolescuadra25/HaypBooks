import { ReportHeader } from '@/components/ReportHeader'
import { getBaseUrl } from '@/lib/server-url'
import Client from './TableClient'

async function loadData(searchParams?: { q?: string; start?: string; end?: string }) {
	const sp = new URLSearchParams()
	if (searchParams?.q) sp.set('q', searchParams.q)
	if (searchParams?.start) sp.set('start', searchParams.start)
	if (searchParams?.end) sp.set('end', searchParams.end)
		const res = await fetch(`${getBaseUrl()}/api/deposits/list${sp.size ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
	if (!res.ok) return null
	return res.json()
}

export default async function DepositDetailReportPage({ searchParams }: { searchParams: { q?: string; start?: string; end?: string } }) {
	const data = await loadData(searchParams)
	if (!data) {
		return (
			<div className="space-y-4">
				<ReportHeader exportPath="/api/reports/deposit-detail/export" />
				<div className="glass-card"><p className="text-slate-800">Access denied. You don’t have permission to view this report.</p></div>
			</div>
		)
	}
	return (
		<div className="space-y-4">
			<ReportHeader exportPath="/api/reports/deposit-detail/export" />
			<Client rows={data.rows} />
		</div>
	)
}
