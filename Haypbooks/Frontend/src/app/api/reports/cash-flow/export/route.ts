import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as JSON_GET } from '../route'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

function toCSV(rows: string[][]) {
  return rows
    .map(r => r.map((c) => {
      if (c == null) return ''
      const s = String(c)
      return (s.includes(',') || s.includes('"') || s.includes('\n')) ? '"' + s.replace(/"/g, '""') + '"' : s
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
  const dr = deriveRange(period, start, end)
  start = dr.start || start
  end = dr.end || end

  // Delegate to JSON route
  const jsonRes: any = await JSON_GET(req)
  if (!jsonRes || jsonRes.status !== 200) return jsonRes
  const data = await jsonRes.json() as {
    sections: { operations: number; investing: number; financing: number }
    netChange: number
    start: string | null
    end: string | null
    prev?: { sections: { operations: number; investing: number; financing: number }; netChange: number } | null
  }

  const asOfIso = (data.end || end || new Date().toISOString()).slice(0, 10)
  const caption = buildCsvCaption(data.start, data.end, asOfIso)
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version', '1'])
  rows.push([caption])
  rows.push(['Section', 'Current', ...(compare ? ['Previous', 'Delta', 'Percent'] : [])])

  const current = [
    { name: 'Cash from Operations', amount: Number(data.sections.operations || 0) },
    { name: 'Cash from Investing', amount: Number(data.sections.investing || 0) },
    { name: 'Cash from Financing', amount: Number(data.sections.financing || 0) },
    { name: 'Net Change in Cash', amount: Number(data.netChange || 0) },
  ]

  const prev = compare && data.prev ? [
    Number(data.prev.sections.operations || 0),
    Number(data.prev.sections.investing || 0),
    Number(data.prev.sections.financing || 0),
    Number(data.prev.netChange || 0),
  ] : undefined

  for (let i = 0; i < current.length; i++) {
    const c = current[i]
    if (!compare) {
      rows.push([c.name, formatCurrency(c.amount, baseCurrency)])
    } else {
      const p = prev?.[i] ?? 0
      const d = c.amount - p
      const pct = p !== 0 ? (d / Math.abs(p)) * 100 : 0
      rows.push([
        c.name,
        formatCurrency(c.amount, baseCurrency),
        formatCurrency(p, baseCurrency),
        formatCurrency(d, baseCurrency),
        pct.toFixed(2) + '%',
      ])
    }
  }

  const body = toCSV(rows)
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${buildCsvFilename('cash-flow', { asOfIso, tokens: [period + (compare ? '-compare' : '')], tokenPosition: 'before' })}"`,
      'Cache-Control': 'no-store',
    },
  })
}
