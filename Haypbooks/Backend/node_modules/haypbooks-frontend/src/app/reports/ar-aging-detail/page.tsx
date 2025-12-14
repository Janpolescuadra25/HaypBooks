import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'
import { AccessDeniedCard } from '@/components/AccessDeniedCard'
import ActiveFilterBar from '@/components/ActiveFilterBar'
import { formatAsOf } from '@/lib/date'
import ARAgingTableClient from './TableClient'

export default async function ARAgingDetailPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  const res = await fetch(`${getBaseUrl()}/api/reports/ar-aging-detail${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <ReportHeader exportPath="/api/reports/ar-aging-detail/export" />
        <AccessDeniedCard message="You don’t have permission to view this report." />
      </div>
    )
  }
  const data = await res.json()
  const asOfIso = (data?.asOf || (searchParams?.end ? new Date(searchParams.end + 'T00:00:00Z') : new Date()).toISOString()).slice(0,10)
  return (
    <div className="space-y-4">
      <ReportHeader
        exportPath="/api/reports/ar-aging-detail/export"
        periodValue={data.period}
      />
      <ActiveFilterBar slug="ar-aging-detail" />
      <ARAGINGTable
        rows={data.rows}
        totals={data.totals}
        captionStart={searchParams?.start}
        captionEnd={searchParams?.end}
        asOfIso={asOfIso}
      />
    </div>
  )
}

function ARAGINGTable(props: any) { return <ARAgingTableClient {...props} /> }
