import { NextResponse } from 'next/server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { GET as getJson } from '../route'

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export async function GET(req: Request) {
  // Delegate to sibling JSON for data and RBAC
  const jsonRes = await getJson(req)
  if (!jsonRes.ok) return jsonRes
  const data = await jsonRes.json() as {
    rows: Array<{ id: string; number: string; date: string; issue: string; line: number | null; account: string; debit: number; credit: number }>
    total: number
    start: string | null
    end: string | null
    asOf: string
  }

  const versionFlag = parseCsvVersionFlag(req)
  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  lines.push(csvEscape(buildCsvCaption(data.start || undefined, data.end || undefined, data.asOf)))
  lines.push('')
  lines.push(['Journal ID','Number','Date','Issue','Line','Account','Debit','Credit'].map(csvEscape).join(','))
  let tDebit = 0, tCredit = 0
  for (const r of data.rows) {
    tDebit += Number(r.debit) || 0
    tCredit += Number(r.credit) || 0
    lines.push([
      r.id,
      r.number,
      r.date,
      r.issue,
      r.line == null ? '' : String(r.line),
      r.account,
      String(r.debit ?? 0),
      String(r.credit ?? 0),
    ].map(csvEscape).join(','))
  }
  lines.push(['Total','','','','','', String(tDebit), String(tCredit)].map(csvEscape).join(','))

  const csv = lines.join('\n')
  const filename = buildCsvFilename('invalid-journal-transactions', { start: data.start || undefined, end: data.end || undefined, asOfIso: data.asOf })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
