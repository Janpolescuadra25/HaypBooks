import { ExportCsvButton, RefreshButton, PrintButton } from '@/components/ReportActions'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { Suspense } from 'react'
import { KpiCards, type Metrics as UIMetrics } from '@/components/KpiCards'

type Metrics = UIMetrics

async function getMetrics(params?: { period?: string; start?: string; end?: string; compare?: string }): Promise<Metrics> {
  const mod = await import('@/app/api/performance/metrics/route')
  const sp = new URLSearchParams()
  if (params?.period) sp.set('period', params.period)
  if (params?.start) sp.set('start', params.start)
  if (params?.end) sp.set('end', params.end)
  if (params?.compare === '1') sp.set('compare', '1')
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res: any = await mod.GET(new Request(`http://localhost/api/performance/metrics${qs}`))
  if (!res || res.status !== 200) throw new Error('Failed to load metrics')
  return res.json()
}

export default async function PerformanceCenterPage({ searchParams }: { searchParams: { period?: string; start?: string; end?: string; compare?: string } }) {
  const m = await getMetrics({ period: searchParams?.period, start: searchParams?.start, end: searchParams?.end, compare: searchParams?.compare })
  const compared = searchParams?.compare === '1'
  return (
    <div className="space-y-4">
      <div className="glass-card">
        <h2 className="text-slate-900 font-semibold mb-2">Performance center</h2>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-slate-600">Benchmarks, trendlines, and KPIs across time, customers, items. Configure benchmark thresholds via Settings.</p>
          <div className="flex items-center gap-2">
            <ReportPeriodSelect value={(searchParams?.period as any) || 'YTD'} showCompare />
            <Suspense fallback={null}>
              <ExportCsvButton exportPath="/api/performance/metrics/export" />
            </Suspense>
            <RefreshButton />
            <PrintButton />
          </div>
        </div>
        <KpiCards metrics={m} compared={compared} />
      </div>
    </div>
  )
}
