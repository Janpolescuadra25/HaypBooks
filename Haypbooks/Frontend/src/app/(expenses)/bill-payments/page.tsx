import { DataTable } from '@/components/DataTable'
import { getBaseUrl } from '@/lib/server-url'
import { Suspense } from 'react'
import { ExportCsvButton, PrintButton, PrintChecksButton } from '@/components/ReportActions'
import { formatMMDDYYYY } from '@/lib/date'
import Notice from '@/components/Notice'
import Amount from '@/components/Amount'

async function fetchPayments(params?: { start?: string; end?: string }) {
	const sp = new URLSearchParams()
	if (params?.start) sp.set('start', params.start)
	if (params?.end) sp.set('end', params.end)
	const res = await fetch(`${getBaseUrl()}/api/bill-payments${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
	if (!res.ok) throw new Error('Failed to load bill payments')
	return res.json()
}

export default async function BillPaymentsPage({ searchParams }: { searchParams: { start?: string; end?: string; accountName?: string } }) {
	const data = await fetchPayments({ start: searchParams?.start, end: searchParams?.end })
	const rows = data.payments || []
	const columns = [
		{ key: 'date', header: 'Payment date', render: (v: string) => formatMMDDYYYY(v) },
		{ key: 'vendor', header: 'Vendor' },
		{ key: 'number', header: 'Bill #' },
		{ key: 'amount', header: 'Amount', align: 'right' as const, render: (v: number) => <span className="tabular-nums"><Amount value={Number(v || 0)} /></span> },
	]

	const total: number = rows.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0)

	return (
		<div className="space-y-4">
			<Notice />
			{/* Expenses sub-navigation is handled by the Expenses layout */}
			<div className="glass-card print:hidden overflow-x-auto">
				<div className="flex items-center justify-between gap-2">
					<div>
						<h1 className="text-xl font-semibold text-slate-900">Bill payments</h1>
						<p className="text-slate-600 text-sm">Review and manage outgoing payments to vendors.</p>
					</div>
					<div className="flex items-center gap-1.5 whitespace-nowrap">
						<Suspense fallback={null}><ExportCsvButton exportPath="/api/bill-payments/export" /></Suspense>
						<PrintChecksButton accountName={searchParams?.accountName} />
						<PrintButton />
					</div>
				</div>
			</div>
			<div className="glass-card">
				<DataTable<any> keyField="id" columns={columns as any} rows={rows} />
				<div className="mt-3 text-right text-sm text-slate-900">
					<span className="font-medium">Total</span>
					<span className="ml-2 tabular-nums"><Amount value={Number(total || 0)} /></span>
				</div>
			</div>
		</div>
	)
}
