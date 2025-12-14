import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as getJson } from '../route'

function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

// CSV is now built from the sibling JSON route to avoid logic drift

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  const { start, end } = deriveRange(qStart && qEnd ? 'Custom' : period, qStart, qEnd)

  // Delegate to JSON handler for authoritative data
  const jsonResp = await getJson(req)
  if (!jsonResp.ok) return jsonResp
  const data = await jsonResp.json() as { rows: Array<{ metric: string; value: number; unit?: string }>; asOf: string }
  const asOfIso = (data.asOf || (end || new Date().toISOString())).slice(0, 10)
  const header: string[] = [buildCsvCaption(start, end, asOfIso)]
  const csvRows: string[][] = [header, [], ['Metric', 'Value', 'Unit']]
  const versionFlag = parseCsvVersionFlag(req)
  if (versionFlag) csvRows.unshift(['CSV-Version','1'])
  for (const r of data.rows) {
    csvRows.push([r.metric, String(r.value), r.unit || ''])
  }

  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('ratio-analysis', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
