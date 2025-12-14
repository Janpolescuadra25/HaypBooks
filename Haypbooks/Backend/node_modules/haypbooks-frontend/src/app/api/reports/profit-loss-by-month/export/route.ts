import { NextResponse } from 'next/server'
import { buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as getJson } from '../route'
import { formatCurrency } from '@/lib/format'
import { db } from '@/mock/db'

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
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || 'YTD'

  // Delegate to JSON route for authoritative data
  const jsonRes = await getJson(req)
  if (!jsonRes.ok) return jsonRes
  const data = await jsonRes.json() as {
    period: string
    start: string
    end: string
    months: string[]
    lines: Array<{ name: string; values: number[] }>
  }

  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const asOfIso = (data.end || new Date().toISOString().slice(0,10))
  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version','1'])
  rows.push([buildCsvCaption(data.start, data.end, asOfIso)])
  rows.push([])
  const monthHeaders = data.months.map((mk) => {
    const [y, m] = mk.split('-').map((n) => parseInt(n,10))
    const d = new Date(Date.UTC(y, m-1, 1))
    return d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' })
  })
  rows.push(['Account', ...monthHeaders, 'Total'])

  for (const line of data.lines) {
    const total = (line.values || []).reduce((a,b)=> a + (Number(b)||0), 0)
    rows.push([
      line.name,
      ...line.values.map((v) => formatCurrency(Number(v||0), baseCurrency)),
      formatCurrency(total, baseCurrency),
    ])
  }

  const body = toCSV(rows)
  const filename = buildCsvFilename('profit-loss-by-month', { asOfIso, tokens: [period], tokenPosition: 'before' })
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
