import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'

// Delegate to sibling JSON handler (JSON-first parity)
import { GET as GET_API } from '../route'

function toCSV(rows: string[][]) {
  return rows
    .map((r) =>
      r
        .map((c) => {
          if (c == null) return ''
          const s = String(c)
          if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
          return s
        })
        .join(',')
    )
    .join('\n')
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })

  // Call sibling JSON route directly (no network) to ensure data parity
  const apiUrl = new URL(req.url)
  apiUrl.pathname = apiUrl.pathname.replace('/export', '')
  const jsonRes: any = await GET_API(new Request(apiUrl.toString()))
  if (!jsonRes || typeof jsonRes.json !== 'function') return new NextResponse('Upstream error', { status: 500 })
  const data = await jsonRes.json()
  const asOfIso = (data.asOf || '').slice(0, 10) || new Date().toISOString().slice(0, 10)

  const rows: string[][] = []
  if (parseCsvVersionFlag(req)) rows.push(['CSV-Version','1'])
  // Use no-comma caption to avoid CSV quoting, e.g., "As of YYYY-MM-DD"
  rows.push([buildCsvRangeOrDate(null, null, asOfIso)])
  rows.push([])
  rows.push(['Setting','Value'])
  rows.push(['Closed through', String((data.rows?.[0]?.[1] ?? '—'))])

  const csv = toCSV(rows)
  const filename = buildCsvFilename('closing-date', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
