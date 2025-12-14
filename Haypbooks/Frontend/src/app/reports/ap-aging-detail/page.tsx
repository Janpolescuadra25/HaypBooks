import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { AccessDeniedCard } from '@/components/AccessDeniedCard'
import ActiveFilterBar from '@/components/ActiveFilterBar'
import { formatAsOf } from '@/lib/date'
import APAgingTableClient from './TableClient'
import APAgingDetailFilters from '@/components/APAgingDetailFilters'

const AP_COLUMNS = [
  { key: 'vendor', label: 'Vendor', required: true },
  { key: 'type', label: 'Type', required: true },
  { key: 'number', label: 'Number' },
  { key: 'billDate', label: 'Bill Date' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'aging', label: 'Aging (days)' },
  { key: 'openBalance', label: 'Open Balance', required: true },
]

export default async function APAgingDetailPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string; vendorId?: string; vendor?: string; bucket?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  if (searchParams?.vendorId) sp.set('vendorId', searchParams.vendorId)
  if (searchParams?.vendor) sp.set('vendor', searchParams.vendor)
  if (searchParams?.bucket) sp.set('bucket', searchParams.bucket)
  const res = await fetch(`${getBaseUrl()}/api/reports/ap-aging-detail${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <ReportHeader exportPath="/api/reports/ap-aging-detail/export" rightExtras={<APAgingDetailFilters />} />
        <AccessDeniedCard message="You don’t have permission to view this report." />
      </div>
    )
  }
  const data = await res.json()
  const asOfIso = (data?.asOf || (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString()).slice(0,10)
  return (
    <div className="space-y-4">
      <ReportHeader
        exportPath="/api/reports/ap-aging-detail/export"
        periodValue={data.period}
        rightExtras={<APAgingDetailFilters />}
      />
      <ActiveFilterBar slug="ap-aging-detail" />
      <APAGINGTable
        rows={data.rows}
        totals={data.totals}
        captionStart={searchParams?.start}
        captionEnd={searchParams?.end}
        asOfIso={asOfIso}
      />
    </div>
  )
}

// Client table wrapper avoids import of client hooks in this server file
function APAGINGTable(props: any) { return <APAgingTableClient {...props} /> }
