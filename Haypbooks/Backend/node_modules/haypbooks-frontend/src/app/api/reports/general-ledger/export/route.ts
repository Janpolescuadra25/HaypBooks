import { NextResponse } from 'next/server'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as GET_API } from '../route'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

export async function GET(req: Request) {
  const versionFlag = parseCsvVersionFlag(req)
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'Custom'
  const startParam = url.searchParams.get('start')
  const endParam = url.searchParams.get('end')
  const { start, end } = deriveRange(period, startParam, endParam)
  const asOfIso = end || new Date().toISOString().slice(0,10)

  // Hit local API
  const apiUrl = new URL(req.url)
  apiUrl.pathname = apiUrl.pathname.replace('/export','')
  const res: any = await GET_API(new Request(apiUrl.toString()))
  if (!res || res.status !== 200) {
    return new NextResponse('Failed to build export', { status: res?.status || 500 })
  }
  const data = await (res as any).json()

  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version','1'])
  rows.push([buildCsvCaption(start || null, end || null, asOfIso)])
  rows.push([''])
  rows.push(['Date','Journal','Account','Name','Memo','Debit','Credit','Balance'])
  for (const l of data.rows as Array<any>) {
    rows.push([
      l.date,
      String(l.journalId),
      l.accountNumber,
      l.accountName,
      l.memo || '',
      formatCurrency(Number(l.debit||0), baseCurrency),
      formatCurrency(Number(l.credit||0), baseCurrency),
      formatCurrency(Number(l.balance||0), baseCurrency),
    ])
  }
  const csv = rows.map(r=>r.map(c=>{
    const s = String(c)
    return s.includes(',')||s.includes('"')||s.includes('\n') ? '"'+s.replace(/"/g,'""')+'"' : s
  }).join(',')).join('\n')
  const filename = buildCsvFilename('general-ledger', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
