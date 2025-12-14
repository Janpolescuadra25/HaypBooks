import { DataTable } from '@/components/DataTable'
import { getBaseUrl } from '@/lib/server-url'
import { Suspense } from 'react'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { formatMMDDYYYY } from '@/lib/date'
import Notice from '@/components/Notice'
import Amount from '@/components/Amount'
import CustomerPaymentsFilters from '@/components/CustomerPaymentsFilters'
import { Suspense as ClientSuspense } from 'react'

async function fetchCustomerPayments(params?: { start?: string; end?: string; q?: string; customerId?: string }) {
  const sp = new URLSearchParams()
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  if (params?.q) sp.set('q', params.q)
  if (params?.customerId) sp.set('customerId', params.customerId)
  const res = await fetch(`${getBaseUrl()}/api/customer-payments${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load customer payments')
  return res.json()
}

export default async function CustomerPaymentsPage({ searchParams }: { searchParams: { start?: string; end?: string; q?: string; customerId?: string } }) {
  const data = await fetchCustomerPayments({ start: searchParams?.start, end: searchParams?.end, q: searchParams?.q, customerId: searchParams?.customerId })
  const rows = data.customerPayments || []
  const columns = [
    { key: 'date', header: 'Payment date', render: (v: string) => formatMMDDYYYY(v) },
    { key: 'customer', header: 'Customer' },
    { key: 'amountReceived', header: 'Received', align: 'right' as const, render: (v: number) => <span className="tabular-nums"><Amount value={Number(v || 0)} /></span> },
    { key: 'amountAllocated', header: 'Allocated', align: 'right' as const, render: (v: number) => <span className="tabular-nums"><Amount value={Number(v || 0)} /></span> },
    { key: 'amountUnapplied', header: 'Unapplied', align: 'right' as const, render: (v: number) => <span className="tabular-nums"><Amount value={Number(v || 0)} /></span> },
  ]

  const totals = data.totals || { received: 0, allocated: 0, unapplied: 0 }

  return (
    <div className="space-y-4">
      <Notice />
      <div className="glass-card print:hidden overflow-x-auto">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Customer payments</h1>
            <p className="text-slate-600 text-sm">Review and manage incoming payments from customers.</p>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Suspense fallback={null}><ExportCsvButton exportPath="/api/customer-payments/export" /></Suspense>
          </div>
        </div>
        <div className="mt-3">
          {/* Client-side filters UI persists to URL and store */}
          <ClientSuspense fallback={null}>
            <CustomerPaymentsFilters />
          </ClientSuspense>
        </div>
      </div>
      <div className="glass-card">
        <DataTable<any> keyField="id" columns={columns as any} rows={rows} />
        <div className="mt-3 text-right text-sm text-slate-900">
          <span className="font-medium">Totals</span>
          <span className="ml-4">Received</span>
          <span className="ml-2 tabular-nums"><Amount value={Number(totals.received || 0)} /></span>
          <span className="ml-4">Allocated</span>
          <span className="ml-2 tabular-nums"><Amount value={Number(totals.allocated || 0)} /></span>
          <span className="ml-4">Unapplied</span>
          <span className="ml-2 tabular-nums"><Amount value={Number(totals.unapplied || 0)} /></span>
        </div>
      </div>
    </div>
  )
}
