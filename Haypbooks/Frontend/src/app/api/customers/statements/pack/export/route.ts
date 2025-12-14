import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { parseCsvVersionFlag, buildCsvFilename } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { GET as getJson } from '../route'
import { formatCurrency } from '@/lib/format'
import { db } from '@/mock/db'

function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

// GET /api/customers/statements/pack/export?asOf=YYYY-MM-DD[&customerId=c1,c2][&start=YYYY-MM-DD][&type=summary|detail][&csv=1]
export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const asOfIso = url.searchParams.get('asOf') || new Date().toISOString().slice(0,10)
  const startIso = url.searchParams.get('start') || undefined
  const typeParam = url.searchParams.get('type') || undefined
  // Delegate JSON-first
  const jsonRes: any = await getJson(new Request(req.url))
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed', { status: 500 })
  const data = await jsonRes.json() as { statements: any[]; asOf: string }
  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version','1'])
  const caption = buildCsvCaption(startIso || null, asOfIso, asOfIso)
  rows.push([caption])
  rows.push([])
  const header = ['Customer','Date','Type','Description','Amount','Running Balance']
  rows.push(header)
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  for (const entry of data.statements) {
    const cust = (db.customers || []).find(c => c.id === entry.id)
    const name = cust?.name || entry.id
    const st = entry.statement || {}
    for (const l of (st.lines || [])) {
      rows.push([
        name,
        (l.date || '').slice(0,10),
        l.type,
        l.description,
        formatCurrency(Number(l.amount)||0, baseCurrency),
        formatCurrency(Number(l.runningBalance)||0, baseCurrency)
      ])
    }
    // Totals row per customer
    const net = Number(st.totals?.net || 0)
    rows.push([name,'Totals','','','', formatCurrency(net, baseCurrency)])
  }
  const csv = toCSV(rows)
  const filename = buildCsvFilename('statements-pack', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
