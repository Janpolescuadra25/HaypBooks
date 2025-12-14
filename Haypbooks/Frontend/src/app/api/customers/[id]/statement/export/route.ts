import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { GET as getStatement } from '../route'
import { parseCsvVersionFlag, buildCsvFilename } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
// Keep output numeric to ease parsing in tests and downstream tools.

function esc(val: any) {
  if (val == null) return ''
  const s = String(val)
  return (/[",\n]/.test(s)) ? '"' + s.replace(/"/g,'""') + '"' : s
}

// GET /api/customers/:id/statement/export?asOf=YYYY-MM-DD[&start=YYYY-MM-DD][&type=transaction|open-item|balance-forward][&csv=1]
export async function GET(req: Request, ctx: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const asOfIso = url.searchParams.get('asOf') || new Date().toISOString().slice(0,10)
  const startIso = url.searchParams.get('start') || null
  const versionFlag = parseCsvVersionFlag(req)
  // Delegate JSON-first
  const jsonRes: any = await getStatement(req, ctx as any)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed', { status: 500 })
  const data = await jsonRes.json() as any
  const st = data.statement || {}
  const lines = st.lines || []
  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version','1'])
  rows.push([buildCsvCaption(startIso, asOfIso, asOfIso)])
  rows.push([])
  const header = ['Date','Type','Description','Amount','Running Balance']
  rows.push(header)
  for (const l of lines) {
    rows.push([
      (l.date||'').slice(0,10),
      l.type,
      l.description,
      String(Number(l.amount)||0),
      String(Number(l.runningBalance)||0)
    ])
  }
  const net = Number(st.totals?.net || 0)
  rows.push(['Totals','','','', String(net)])
  const csv = rows.map(r => r.map(esc).join(',')).join('\n') + '\n'
  const stmtType = url.searchParams.get('type') || undefined
  const tokens = [`cust-${ctx.params.id}`]
  if (stmtType) tokens.push(`type-${stmtType}`)
  if (startIso) tokens.push(`from-${startIso}`)
  const filename = buildCsvFilename('customer-statement', { start: startIso || undefined, end: asOfIso || undefined, asOfIso, tokens })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
