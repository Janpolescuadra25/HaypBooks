import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'

function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

export async function GET() {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const now = new Date()
  const asOfIso = now.toISOString().slice(0,10)
  const header = [buildCsvCaption(null, null, asOfIso)]
  const rows: string[][] = [header, [], ['Number','Date','Memo','Debit','Credit']]
  // Minimal mock rows to align with journals sample
  for (let i = 0; i < 5; i++) {
    const n = `JE-10${i+1}`
  const date = new Date(Date.now() - i*86400000).toISOString().slice(0,10)
    const memo = `Sample journal ${i+1}`
  const amt = (100 + i*10).toFixed(2)
  rows.push([n, date, memo, amt, amt])
  }
  const csv = toCSV(rows)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${buildCsvFilename('journal', { asOfIso })}"`,
      'Cache-Control': 'no-store',
    }
  })
}
