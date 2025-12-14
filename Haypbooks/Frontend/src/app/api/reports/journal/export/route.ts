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

  // Delegate to JSON for rows/totals
  const jsonResp = await getJson(req)
  if (!jsonResp.ok) return jsonResp
  const data = await jsonResp.json() as { rows: Array<{ id: string; date: string; memo: string; debits: number; credits: number }>; totals?: { debits: number; credits: number }; asOf?: string }
  const asOfIso = (data.asOf || (end || new Date().toISOString())).slice(0, 10)

  const rows: string[][] = []
  // Optional version line comes first when opted-in
  if (versionFlag) rows.push(['CSV-Version', '1'])
  // Caption then spacer
  rows.push([buildCsvCaption(start || null, end || null, asOfIso)])
  rows.push([])
  // Header row
  rows.push(['Journal No', 'Date', 'Memo', 'Debits', 'Credits'])
  for (const r of data.rows) {
    rows.push([r.id, r.date, r.memo, String(r.debits), String(r.credits)])
  }
  if (data.totals) {
    rows.push(['Total', '', '', String(data.totals.debits), String(data.totals.credits)])
  }

  const csv = toCSV(rows)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      // Filename policy uses explicit query params: if only end provided (no explicit start), use as-of naming.
      'Content-Disposition': `attachment; filename="${buildCsvFilename('journal', { start: startQ || undefined, end: endQ || undefined, asOfIso })}"`,
      'Cache-Control': 'no-store',
    },
  })
}
