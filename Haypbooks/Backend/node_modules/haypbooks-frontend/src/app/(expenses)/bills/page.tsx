import { DataTable } from '@/components/DataTable'
import { formatMMDDYYYY } from '@/lib/date'
import { getBaseUrl } from '@/lib/server-url'
import Link from 'next/link'
import type { Route } from 'next'
import { Suspense } from 'react'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { CancelScheduleButton } from '@/components/CancelScheduleButton'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'
import { BillsFilters } from '@/components/BillsFilters'
import ActiveFilterBar from '@/components/ActiveFilterBar'
import BillsPager from '@/components/BillsPager'
import Notice from '@/components/Notice'
import BillQuickPay from '@/components/BillQuickPay'
import Amount from '@/components/Amount'

async function fetchBills(params?: { start?: string; end?: string; status?: string; tag?: string; page?: number; limit?: number }) {
  const sp = new URLSearchParams()
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  if (params?.status) sp.set('status', params.status)
  if (params?.tag) sp.set('tag', params.tag)
  if (params?.page) sp.set('page', String(params.page))
  if (params?.limit) sp.set('limit', String(params.limit))
  const qs = sp.toString()
  const res = await fetch(`${getBaseUrl()}/api/bills${qs ? `?${qs}` : ''}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load bills')
  return res.json()
}

async function fetchAPAging(params?: { end?: string }) {
  const sp = new URLSearchParams()
  sp.set('period', 'YTD')
  if (params?.end) sp.set('end', params.end)
  const res = await fetch(`${getBaseUrl()}/api/reports/ap-aging?${sp.toString()}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function BillsPage({ searchParams }: { searchParams: { start?: string; end?: string; status?: string; tag?: string; page?: string; limit?: string } }) {
  const page = Number(searchParams?.page || '1')
  const limit = Number(searchParams?.limit || '20')
  const data = await fetchBills({ start: searchParams?.start, end: searchParams?.end, status: searchParams?.status, tag: searchParams?.tag, page, limit })
  const rows = data.bills || []
  const total: number | undefined = data.total
  const pageFromApi: number | undefined = data.page
  const limitFromApi: number | undefined = data.limit
  const role = getRoleFromCookies()
  const canWrite = hasPermission(role, 'bills:write')
  const ap = await fetchAPAging({ end: searchParams?.end })
  const columns = [
    { key: 'number', header: 'Bill #', render: (_: any, row: any) => <Link className="text-sky-700 hover:underline" href={`/bills/${row.id}?from=/bills` as Route}>{row.number}</Link> },
    { key: 'vendor', header: 'Vendor', hideBelow: 'sm' as const },
    { key: 'dueDate', header: 'Due', render: (v: string) => formatMMDDYYYY(v) },
    { key: 'status', header: 'Status', hideBelow: 'md' as const, render: (_: any, row: any) => (
      <span className={`${row.status==='paid' ? 'text-emerald-700' : row.status==='open' ? 'text-sky-700' : 'text-amber-700'}`}>
        {row.status}{row.scheduledDate ? ` · ${formatMMDDYYYY(row.scheduledDate)}` : ''}
      </span>
    ) },
    { key: 'total', header: 'Total', align: 'right' as const, cellClassName: 'tabular-nums font-mono', render: (v: number) => <Amount value={Number(v || 0)} /> },
    { key: 'balance', header: 'Balance', hideBelow: 'md' as const, align: 'right' as const, cellClassName: 'tabular-nums font-mono', render: (v: number) => <Amount value={Number(v || 0)} /> },
    { key: 'actions' as any, header: 'Actions', hideBelow: 'md' as const, render: (_: any, row: any) => (
      canWrite ? (
        row.status === 'scheduled' ? <CancelScheduleButton id={row.id} /> : <BillQuickPay id={row.id} balance={row.balance} status={row.status} canWrite={canWrite} />
      ) : null
    ) },
  ]

  return (
    <div className="space-y-5">
      <Notice />
      {ap && (
        <div className="glass-card !p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Payables Aging Summary</h2>
              <p className="text-xs text-slate-600">{formatMMDDYYYY(ap.asOf)}</p>
            </div>
            <Link href={'/reports/ap-aging?from=/bills' as Route} className="btn-secondary" aria-label="Open payables aging report" title="Open detailed payables aging report">Open Report</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['current','30','60','90','120+'] as const).map((k) => (
              <div key={k} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs text-slate-600">{k === 'current' ? 'Current' : `${k} days`}</div>
                <div className="text-sm font-medium tabular-nums"><Amount value={Number(ap.totals?.[k] || 0)} /></div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-right text-sm text-slate-900">
            <span className="font-medium">Total</span>
            <span className="ml-2 tabular-nums"><Amount value={Number(ap.totals?.total || 0)} /></span>
          </div>
        </div>
      )}
      <div className="glass-card print:hidden overflow-x-auto !p-4">
        <div className="flex items-end gap-2 whitespace-nowrap">
          <div className="min-w-0 grow">
            <BillsFilters />
          </div>
          <div className="flex items-center gap-1.5">
            <Suspense fallback={null}><ExportCsvButton exportPath="/api/bills/export" /></Suspense>
            <PrintButton />
            <Link href={'/bills/scheduled' as Route} className="btn-secondary" aria-label="View scheduled bills">Scheduled</Link>
            <Link href={'/activity/bill' as Route} className="btn-secondary" aria-label="View bill activity">Activity</Link>
            {canWrite && (<Link href={'/bills/new' as Route} className="btn-primary">New Bill</Link>)}
          </div>
        </div>
      </div>
      <ActiveFilterBar slug="list:bills" />
      <div className="glass-card !p-4">
        <DataTable<any> keyField="id" columns={columns as any} rows={rows} />
        <BillsPager page={pageFromApi ?? page} limit={limitFromApi ?? limit} total={total} />
      </div>
    </div>
  )
}
