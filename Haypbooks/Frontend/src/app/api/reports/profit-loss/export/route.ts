import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as JSON_GET } from '../route'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

type Line = { name: string; amount: number; isSubtotal?: boolean }

function toCSV(rows: string[][]) {
  return rows
    .map(r => r.map((c) => {
      if (c == null) return ''
      const s = String(c)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
      return s
    }).join(','))
    .join('\n')
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || 'YTD'
  const compare = url.searchParams.get('compare') === '1'
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  // Delegate to JSON route
  const jsonRes: any = await JSON_GET(req)
  if (!jsonRes || jsonRes.status !== 200) return jsonRes
  const data = await jsonRes.json() as {
    lines: Line[]
    prevLines?: Line[]
    start: string | null
    end: string | null
    baseCurrency?: string
  }

  const asOfIso = (data.end || end || new Date().toISOString()).slice(0, 10)
  const caption = buildCsvCaption(data.start, data.end, asOfIso)
  const baseCurrency = (db.settings?.baseCurrency as string) || data.baseCurrency || 'USD'

  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version', '1'])
  rows.push([caption])
  rows.push(['Account', 'Current', ...(compare ? ['Previous', 'Delta', 'Percent'] : [])])
  for (let i = 0; i < data.lines.length; i++) {
    const cur = data.lines[i]
    if (!compare) {
      rows.push([cur.name, formatCurrency(Number(cur.amount || 0), baseCurrency)])
    } else {
      const prev = data.prevLines?.[i]?.amount ?? 0
      const delta = (cur.amount || 0) - prev
      const pct = prev !== 0 ? (delta / Math.abs(prev)) * 100 : 0
      rows.push([
        cur.name,
        formatCurrency(Number(cur.amount || 0), baseCurrency),
        formatCurrency(Number(prev || 0), baseCurrency),
        formatCurrency(Number(delta || 0), baseCurrency),
        pct.toFixed(2) + '%',
      ])
    }
  }

  const body = toCSV(rows)
  const filename = buildCsvFilename('profit-loss', { asOfIso, tokens: [period + (compare ? '-compare' : '')], tokenPosition: 'before' })
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
