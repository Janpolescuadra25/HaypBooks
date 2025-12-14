import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { GET as JSON_GET } from '../preview/route'
import { parseCsvVersionFlag, buildCsvFilename } from '@/lib/csv'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

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
  rows.push([buildCsvRangeOrDate(null, asOfIso, null)])
  rows.push([])
  rows.push(['Customer','Invoice','Due Date','Days Past Due','Assess Days','Balance','Suggested Finance Charge'])
  for (const r of (data.rows || [])) {
    // Compose robust values
    const customer = r.customer || r.customerId || ''
    const invNum = r.number || r.id
    const due = (r.dueDate || '').slice(0,10)
    const dpd = r.daysPastDue ?? ''
    const assess = r.assessDays ?? ''
    const bal = Number(r.balance || 0)
    const suggested = Number(r.suggestedCharge || 0)
    rows.push([
      String(customer),
      String(invNum),
      String(due),
      String(dpd),
      String(assess),
      formatCurrency(bal, baseCurrency),
      formatCurrency(suggested, baseCurrency),
    ])
  }

  const csv = toCSV(rows)
  const filename = buildCsvFilename('finance-charges-preview', { asOfIso })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
