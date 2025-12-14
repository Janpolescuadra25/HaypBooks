import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })

  // Import local API handler to avoid external fetch in unit tests
  const { GET: GET_METRICS } = await import('../route')
  // Preserve period params when invoking the metrics API
  const url = new URL(req.url)
  const period = url.searchParams.get('period')
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const compare = url.searchParams.get('compare') === '1'
  const sp = new URLSearchParams()
  if (period) sp.set('period', period)
  if (start) sp.set('start', start)
  if (end) sp.set('end', end)
  if (compare) sp.set('compare', '1')
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  const res: any = await GET_METRICS(new Request(`http://localhost/api/performance/metrics${qs}`))
  if (!res || res.status !== 200) return new NextResponse('Failed to build export', { status: 500, headers: { 'Content-Type': 'text/plain' } })
  const data = await res.json() as { months: string[]; revenue: number[]; grossMargin: number[]; cash: number[]; mrr: number[]; churn: number[]; arDays: number[]; apDays: number[]; prev?: { revenue: number[]; grossMargin: number[]; cash: number[]; mrr: number[]; churn: number[]; arDays: number[]; apDays: number[] } }

  const { end: derivedEnd } = deriveRange(period, start, end)
  const asOfIso = (derivedEnd || new Date().toISOString().slice(0,10))
  const header: string[] = compare ? ['Metric', ...data.months.map(m => `${m} (Cur)`), ...data.months.map(m => `${m} (Prev)`), ...data.months.map(m => `${m} (Δ)`), ...data.months.map(m => `${m} (%)`)] : ['Metric', ...data.months]
  const rows: string[][] = []
  function packRow(label: string, cur: number[], prev?: number[]) {
    if (!compare || !prev) return [label, ...cur.map(String)]
    const deltas = cur.map((v, i) => Number((v - Number(prev?.[i] ?? 0)).toFixed(2)))
    const pcts = cur.map((v, i) => {
      const p = Number(prev?.[i] ?? 0)
      return (p !== 0 ? Number(((v - p) / Math.abs(p) * 100).toFixed(2)) : 0)
    })
    return [label, ...cur.map(String), ...prev.map(String), ...deltas.map(String), ...pcts.map(v => v + '%')]
  }
  rows.push(packRow('Revenue (K)', data.revenue, data.prev?.revenue))
  rows.push(packRow('Gross margin (K)', data.grossMargin, data.prev?.grossMargin))
  rows.push(packRow('Cash (K)', data.cash, data.prev?.cash))
  rows.push(packRow('MRR (K)', data.mrr, data.prev?.mrr))
  rows.push(packRow('Churn (%)', data.churn, data.prev?.churn))
  rows.push(packRow('A/R days', data.arDays, data.prev?.arDays))
  rows.push(packRow('A/P days', data.apDays, data.prev?.apDays))

  const out: string[] = []
  const versionFlag = parseCsvVersionFlag(req)
  if (versionFlag) out.push('CSV-Version,1')
  out.push(buildCsvCaption(null, asOfIso, asOfIso))
  out.push(header.join(','))
  for (const r of rows) out.push(r.join(','))
  const csv = out.join('\n')

  const filename = buildCsvFilename('performance-metrics', { asOfIso: asOfIso, tokens: compare ? ['compare'] : undefined, tokenPosition: 'before' })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
