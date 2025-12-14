import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvCaption } from '@/lib/report-helpers'
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

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
    || undefined
  const period = url.searchParams.get('period') || undefined
  const startQ = url.searchParams.get('start')
  const endQ = url.searchParams.get('end')
  const derived = deriveRange(period, startQ, endQ)
  const start = derived.start || startQ
  const end = derived.end || endQ

  // Delegate to JSON handler
  const jsonResp = await getJson(req)
  if (!jsonResp.ok) return jsonResp
  const data = await jsonResp.json() as { rows: Array<{ id: string; date: string; type: string; number: string; name: string; memo: string; amount: number }>; totals?: { net: number }; asOf?: string }
  const asOfIso = (data.asOf || (end || new Date().toISOString())).slice(0, 10)
  const csvRows: string[][] = []
  if (versionFlag) csvRows.push(['CSV-Version','1'])
  csvRows.push([buildCsvCaption(start || null, end || null, asOfIso)])
  csvRows.push([])
  csvRows.push(['ID', 'Date', 'Type', 'Number', 'Name', 'Memo', 'Amount'])
  for (const r of data.rows) {
    csvRows.push([r.id, r.date, r.type, r.number, r.name, r.memo, String(r.amount)])
  }
  if (data.totals) {
    csvRows.push(['Total', '', '', '', '', '', String(data.totals.net)])
  }

  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('transaction-report', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
