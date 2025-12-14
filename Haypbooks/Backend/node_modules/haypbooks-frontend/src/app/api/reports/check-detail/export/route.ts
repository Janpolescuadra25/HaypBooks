import { NextResponse } from 'next/server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { GET as getJson } from '../route'
import { formatCurrency } from '@/lib/format'
import { db, seedIfNeeded } from '@/mock/db'

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
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const jsonRes = await getJson(req)
  if (!jsonRes.ok) return jsonRes
  const data = await jsonRes.json() as {
    rows: Array<{ date: string; number: string; payee: string; account: string; memo: string; amount: number }>
    totals?: { amount: number }
    start: string | null
    end: string | null
    asOf: string
  }

  const versionFlag = parseCsvVersionFlag(req)
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const csvRows: string[][] = []
  if (versionFlag) csvRows.push(['CSV-Version','1'])
  csvRows.push([buildCsvCaption(data.start, data.end, data.asOf)])
  csvRows.push([])
  csvRows.push(['Date','Number','Payee','Account','Memo','Amount'])
  let total = 0
  for (const r of data.rows || []) {
    const amt = Number(r.amount) || 0
    total += amt
    csvRows.push([r.date, r.number, r.payee, r.account, r.memo, formatCurrency(amt, baseCurrency)])
  }
  const totalsAmt = data.totals?.amount ?? total
  csvRows.push(['Totals','','','','', formatCurrency(totalsAmt, baseCurrency)])

  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('check-detail', { asOfIso: data.asOf })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
