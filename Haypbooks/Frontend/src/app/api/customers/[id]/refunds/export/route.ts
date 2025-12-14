import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag, sanitizeToken } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { db, seedIfNeeded } from '@/mock/db'
import { formatCurrency } from '@/lib/format'
import { GET as JSON_GET } from '../route'

function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

export async function GET(req: Request, ctx: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const id = ctx.params.id
  const asOfIso = (url.searchParams.get('asOf') || new Date().toISOString().slice(0,10))
  // JSON-first: delegate to sibling JSON route
  const jsonResp = await JSON_GET(new Request(url.toString(), { headers: req.headers }), ctx)
  if (!('ok' in jsonResp) || !(jsonResp as any).ok) return jsonResp as any
  const data = await (jsonResp as any).json() as { refunds: Array<{ date: string; amount: number; method?: string; reference?: string; creditMemoId?: string }> }
  const refunds = data.refunds || []

  const caption = buildCsvCaption(null, null, asOfIso)
  const header = ['Date','Amount','Method','Reference','Linked Credit']
  const rows: string[][] = [[caption], [''], header]
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  for (const r of refunds) {
    rows.push([
      (r.date || '').slice(0,10),
      formatCurrency(Number(r.amount) || 0, baseCurrency),
      r.method || '',
      r.reference || '',
      r.creditMemoId ? 'Credit' : '',
    ])
  }
  if (versionFlag) rows.unshift(['CSV-Version','1'])

  const csv = toCSV(rows)
  const filename = buildCsvFilename('customer-refunds', { asOfIso, tokens: [`cust-${sanitizeToken(id)}`] })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
