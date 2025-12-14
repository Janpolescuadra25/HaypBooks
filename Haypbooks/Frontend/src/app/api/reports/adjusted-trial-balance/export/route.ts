import { NextResponse } from 'next/server'
import { buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as getJson } from '../route'


export async function GET(req: Request) {
  const versionFlag = parseCsvVersionFlag(req)
  const jsonRes = await getJson(req)
  if (!jsonRes.ok) return jsonRes
  const data = await jsonRes.json() as {
    start: string | null
    end: string | null
    asOf: string
    rows: Array<{ number: string; name: string; unadjDebit: number; unadjCredit: number; adjDebit: number; adjCredit: number; finalDebit: number; finalCredit: number }>
    totals: { unadjDebit: number; unadjCredit: number; adjDebit: number; adjCredit: number; finalDebit: number; finalCredit: number }
  }

  const asOfIso = data.asOf
  const out: string[] = []
  if (versionFlag) out.push('CSV-Version,1')
  out.push([buildCsvCaption(data.start, data.end, asOfIso)].join(','))
  out.push('')
  out.push(['Account', 'Name', 'Unadj Debit', 'Unadj Credit', 'Adj Debit', 'Adj Credit', 'Final Debit', 'Final Credit'].join(','))
  for (const r of data.rows) {
    out.push([
      r.number,
      r.name,
      String(r.unadjDebit),
      String(r.unadjCredit),
      String(r.adjDebit),
      String(r.adjCredit),
      String(r.finalDebit),
      String(r.finalCredit),
    ].join(','))
  }
  out.push(['', 'Totals', String(data.totals.unadjDebit), String(data.totals.unadjCredit), String(data.totals.adjDebit), String(data.totals.adjCredit), String(data.totals.finalDebit), String(data.totals.finalCredit)].join(','))

  const csv = out.join('\n')
  const filename = buildCsvFilename('adjusted-trial-balance', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
