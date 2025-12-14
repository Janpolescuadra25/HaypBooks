import { Suspense } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { formatMMDDYYYY } from '@/lib/date'
import { getBaseUrl } from '@/lib/server-url'
import { DataTable } from '@/components/DataTable'
import Notice from '@/components/Notice'

async function fetchScheduledBills(params?: { start?: string; end?: string }) {
	const sp = new URLSearchParams()
	if (params?.start) sp.set('start', params.start)
	if (params?.end) sp.set('end', params.end)
	// Reuse the bills list endpoint and filter on the server by scheduledDate when exporting; for UI we can filter client-side
	const res = await fetch(`${getBaseUrl()}/api/bills`, { cache: 'no-store' })
	if (!res.ok) throw new Error('Failed to load bills')
	const json = await res.json()
	const all = Array.isArray(json?.bills) ? json.bills : []
	return all.filter((b: any) => !!b.scheduledDate)
}

export default async function ScheduledBillsPage({ searchParams }: { searchParams: { start?: string; end?: string } }) {
	const rows = await fetchScheduledBills({ start: searchParams?.start, end: searchParams?.end })

	const columns = [
		{ key: 'number', header: 'Bill #' },
		{ key: 'vendor', header: 'Vendor' },
		{ key: 'dueDate', header: 'Due', render: (v: string) => formatMMDDYYYY(v) },
		{ key: 'scheduledDate', header: 'Scheduled', render: (v: string) => formatMMDDYYYY(v) },
		{ key: 'total', header: 'Total', align: 'right' as const, cellClassName: 'tabular-nums font-mono' },
		{ key: 'balance', header: 'Balance', align: 'right' as const, cellClassName: 'tabular-nums font-mono' },
	]

	return (
		<div className="space-y-5">
			<Notice />
			<div className="glass-card print:hidden overflow-x-auto !p-4">
				<div className="flex items-end gap-2 whitespace-nowrap">
					<div className="min-w-0 grow">
						<h2 className="text-base font-semibold text-slate-900">Scheduled bills</h2>
						<p className="text-xs text-slate-600">Bills with a scheduled payment date.</p>
					</div>
					<div className="flex items-center gap-1.5">
						<Suspense fallback={null}><ExportCsvButton exportPath="/api/bills/scheduled/export" /></Suspense>
						<PrintButton />
						<Link href={'/bills' as Route} className="btn-secondary">Back to list</Link>
					</div>
				</div>
			</div>

			<div className="glass-card !p-4">
				<DataTable<any> keyField="id" columns={columns as any} rows={rows} />
			</div>
		</div>
	)
}
