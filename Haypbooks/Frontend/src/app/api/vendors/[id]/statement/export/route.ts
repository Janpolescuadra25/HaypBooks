import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
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

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const id = ctx.params.id
  const asOfIso = (url.searchParams.get('asOf') || new Date().toISOString().slice(0,10))
  const startIso = url.searchParams.get('start') || undefined
  const stmtType = url.searchParams.get('type') || undefined

  // Delegate to JSON (preserve filters)
  const jsonUrl = new URL(req.url)
  if (startIso) jsonUrl.searchParams.set('start', startIso)
  if (stmtType) jsonUrl.searchParams.set('type', stmtType)
  const jsonRes: any = await getJson(new Request(jsonUrl.toString()), ctx as any)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const parsed = await jsonRes.json()
  const payload = parsed?.statement || parsed || {}
  const { lines, totals, asOf } = payload
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const caption = buildCsvCaption(startIso || null, asOf || null, asOf)
  const header = ['Date','Type','Description','Amount','Running Balance']
  const rows: string[][] = [[caption], [''], header]
  for (const l of lines as Array<{ date: string; type: string; description: string; amount: number; runningBalance: number }>) {
    rows.push([
      (l.date || '').slice(0,10),
      l.type,
      l.description,
      formatCurrency(Number(l.amount) || 0, baseCurrency),
      formatCurrency(Number(l.runningBalance) || 0, baseCurrency),
    ])
  }
  rows.push([
    'Totals','','','', formatCurrency(Number(totals?.net ?? 0) || 0, baseCurrency)
  ])

  if (versionFlag) rows.unshift(['CSV-Version','1'])

  const csv = toCSV(rows)
  const tokens = [`ven-${id}`]
  if (stmtType) tokens.push(`type-${stmtType}`)
  if (startIso) tokens.push(`from-${startIso}`)
  const filename = buildCsvFilename('vendor-statement', { start: startIso, end: asOfIso, asOfIso, tokens })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
