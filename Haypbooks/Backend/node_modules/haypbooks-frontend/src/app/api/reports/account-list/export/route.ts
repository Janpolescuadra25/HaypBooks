import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename } from '@/lib/csv'

// Delegate to sibling JSON handler (JSON-first parity)
import { GET as getJson } from '@/app/api/reports/account-list/route'

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

  // Obtain authoritative rows/totals/asOf from the JSON route
  const jsonRes: any = await getJson(new Request(req.url))
  if (!jsonRes || typeof jsonRes.json !== 'function') {
    return new NextResponse('Upstream error', { status: 500 })
  }
  const data = await jsonRes.json()
  const asOfIso = (data.asOf || '').slice(0, 10) || new Date().toISOString().slice(0, 10)
  const start = data.start || null
  const end = data.end || null

  const rows: string[][] = []
  rows.push([buildCsvCaption(start, end, asOfIso)])
  rows.push([])
  rows.push(['Account', 'Type', 'Opening', 'Net Change', 'Balance'])

  let tOpening = 0,
    tNet = 0,
    tBal = 0
  for (const r of data.rows || []) {
    const opening = Number(r.opening || 0)
    const netChange = Number(r.netChange || 0)
    const balance = Number(r.balance || 0)
    tOpening += opening
    tNet += netChange
    tBal += balance
    rows.push([
      `${r.account?.number || ''} · ${r.account?.name || ''}`,
      r.account?.type || '',
      String(opening),
      String(netChange),
      String(balance),
    ])
  }
  rows.push(['Total', '', String(tOpening), String(tNet), String(tBal)])

  const csv = toCSV(rows)
  const filename = buildCsvFilename('account-list', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
