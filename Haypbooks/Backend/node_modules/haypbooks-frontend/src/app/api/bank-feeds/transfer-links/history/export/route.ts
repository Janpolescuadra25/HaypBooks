import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { db, seedIfNeeded } from '@/mock/db'
import { GET as getHistory } from '../route'
import { formatCurrency } from '@/lib/format'

// CSV export delegating to JSON history handler for transfer link events
// GET /api/bank-feeds/transfer-links/history/export?start=YYYY-MM-DD&end=YYYY-MM-DD&accountNumber=...&txnId=...&transferId=...[&csvVersion=1]
export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'audit:read') || !hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  seedIfNeeded()

  const includeVersion = parseCsvVersionFlag(req)
  // Use JSON handler to get rows and applied filters
  const json = await getHistory(req)
  if (!json.ok) return json
  const data: any = await json.json()
  const hist = data.history || {}
  const rows: any[] = hist.rows || []
  const start = hist.start || null
  const end = hist.end || null
  const asOfIso = end || new Date().toISOString().slice(0,10)

  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const caption = buildCsvCaption(start, end, asOfIso)
  const headers = ['Date','Action','Account','Bank Txn Id','Bank Txn Date','Bank Amount','Transfer Id','From Account','To Account','Transfer Date','Transfer Amount','Memo']

  const lines: string[] = []
  if (includeVersion) lines.push('CSV-Version,1')
  lines.push(caption)
  lines.push(headers.join(','))
  for (const r of rows) {
    const line = [
      r.date || '',
      r.action || '',
      r.accountNumber || '',
      r.txnId || '',
      r.txnDate || '',
      r.txnAmount != null ? formatCurrency(Number(r.txnAmount), baseCurrency) : '',
      r.transferId || '',
      r.fromAccountNumber || '',
      r.toAccountNumber || '',
      r.transferDate || '',
      r.transferAmount != null ? formatCurrency(Number(r.transferAmount), baseCurrency) : '',
      (r.memo || '').toString(),
    ]
    lines.push(line.map((f) => String(f).includes(',') || String(f).includes('"') || String(f).includes('\n') ? '"' + String(f).replace(/"/g,'""') + '"' : String(f)).join(','))
  }

  const body = lines.join('\n') + '\n'
  const filename = buildCsvFilename('transfer-link-history', { start, end, asOfIso })
  return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' } })
}
