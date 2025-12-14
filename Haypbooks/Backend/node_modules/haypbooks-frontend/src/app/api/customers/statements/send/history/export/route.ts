import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { GET as getHistory } from '../route'

function esc(s: any) {
  if (s == null) return ''
  const t = String(s)
  return (t.includes(',') || t.includes('"') || t.includes('\n')) ? '"' + t.replace(/"/g,'""') + '"' : t
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'audit:read') || !hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const includeVersion = parseCsvVersionFlag(req)
  const jsonResp = await getHistory(req)
  if (!jsonResp.ok) return jsonResp
  const data: any = await jsonResp.json()
  const rows: any[] = data.history.rows
  const start = data.history.start
  const end = data.history.end
  const out: string[] = []
  const header = ['Date','Customer','As Of','Type','Status','Message Id','Batch Id']
  if (includeVersion) out.push('CSV-Version,1')
  out.push(buildCsvCaption(start, end, end))
  out.push(header.join(','))
  for (const r of rows) {
    out.push([r.date||'', r.customerId||'', r.asOf||'', r.type||'', r.status||'', r.messageId||'', r.batchId||''].map(esc).join(','))
  }
  const body = out.join('\n') + '\n'
  const filename = buildCsvFilename('statement-send-history', { start, end, asOfIso: end })
  return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
