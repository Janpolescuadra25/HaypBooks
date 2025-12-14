import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
import { GET as JSON_GET } from '../preview/route'
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

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  // Require reports:read for export visibility AND write permission to access the preview JSON sibling
  const canWrite = hasPermission(role, 'journal:write' as any) || hasPermission(role, 'invoices:write' as any)
  if (!hasPermission(role, 'reports:read') || !canWrite) return new NextResponse('Forbidden', { status: 403 })
  const versionFlag = parseCsvVersionFlag(req)
  const url = new URL(req.url)
  const asOfIso = url.searchParams.get('asOf') || new Date().toISOString().slice(0,10)
  const jsonRes: any = await JSON_GET(req)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to generate CSV', { status: 500 })
  const data = await jsonRes.json() as { asOf: string; rows: any[] }
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version','1'])
  // For list-style exports, pass the as-of date as the 'end' to get a bare ISO caption
  rows.push([buildCsvRangeOrDate(null, asOfIso, null)])
  rows.push([])
  rows.push(['Customer','Invoice','Due Date','Days Past Due','Balance','Suggested Write-off'])
  for (const r of data.rows) {
    // Fallback to DB lookup for robustness if preview omitted some fields
    const inv = db.invoices.find(i => i.id === (r.id || r.invoiceId))
    const customerId = r.customerId || inv?.customerId
    const customerName = (r.customer != null && r.customer !== undefined)
      ? String(r.customer)
      : (customerId ? (db.customers.find(c => c.id === customerId)?.name || customerId) : '')
    const invNumber = r.number || inv?.number || r.id
    const due = r.dueDate || inv?.dueDate || inv?.date || ''
    const days = r.daysPastDue != null ? r.daysPastDue : ''
    const balance = Number(r.balance != null ? r.balance : (inv?.balance ?? 0))
    const suggested = Number(r.suggestedAmount != null ? r.suggestedAmount : Math.min(balance, Number(url.searchParams.get('maxAmount') || 50)))
    rows.push([
      String(customerName),
      String(invNumber),
      String(typeof due === 'string' ? due.slice(0,10) : due),
      String(days),
      formatCurrency(balance, baseCurrency),
      formatCurrency(suggested, baseCurrency),
    ])
  }

  const csv = toCSV(rows)
  const filename = buildCsvFilename('write-offs-preview', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
