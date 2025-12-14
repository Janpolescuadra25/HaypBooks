import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { deriveRange, buildCsvRangeOrDate } from '@/lib/report-helpers'

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
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  const start = url.searchParams.get('start') || null
  const end = url.searchParams.get('end') || null
  const { start: dStart, end: dEnd } = deriveRange(period, start, end)
  const asOfIso = dEnd || new Date().toISOString().slice(0,10)
  const versionFlag = parseCsvVersionFlag(req)
  const rows = [
    { date: end, vendor: 'Ace Consulting LLC', tin: 'XX-XXXX123', amount: 1200, account: 'Contractor Expense', memo: 'Consulting Jan', eligible: true },
    { date: end, vendor: 'Blue Ocean Design', tin: 'XX-XXXX987', amount: 290, account: 'Contractor Expense', memo: 'Design Feb', eligible: false },
    { date: end, vendor: 'Cedar Tech Services', tin: 'XX-XXXX555', amount: 310.5, account: 'Contractor Expense', memo: 'IT Support Mar', eligible: true },
    { date: end, vendor: 'Delta Contractors', tin: 'XX-XXXX222', amount: 6500, account: 'Contractor Expense', memo: 'Project Alpha', eligible: true },
  ]
  const base = buildCsvRangeOrDate(dStart, dEnd, asOfIso)
  const captionRow: string[] = [(dStart && dEnd) ? base : `${period}-asof-${asOfIso}`]
  const headerRow = ['Date','Vendor','TIN (masked)','Amount','Account','Memo','Eligible (>= $600 YTD)']
  const csvRows: string[][] = []
  if (versionFlag) csvRows.push(['CSV-Version','1'])
  csvRows.push(captionRow)
  csvRows.push([])
  csvRows.push(headerRow)
  let total = 0
  for (const r of rows) {
    total += r.amount
    csvRows.push([
      r.date || '',
      r.vendor || '',
      r.tin || '',
      String(r.amount ?? ''),
      r.account || '',
      r.memo || '',
      r.eligible ? 'Yes' : 'No',
    ])
  }
  csvRows.push(['Totals','','', '' + total, '', '', ''])
  const csv = toCSV(csvRows)
  const filename = buildCsvFilename('1099-transaction-detail-us', { asOfIso, tokens: [period], tokenPosition: 'before' })
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
