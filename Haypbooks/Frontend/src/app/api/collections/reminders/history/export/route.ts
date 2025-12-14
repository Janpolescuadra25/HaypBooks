import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { GET as getHistory } from '../route'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'audit:read') || !hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const includeVersion = parseCsvVersionFlag(req)
  // Reuse JSON handler to ensure single source of truth
  const jsonResp = await getHistory(req)
  if (!jsonResp.ok) return jsonResp
  const data: any = await jsonResp.json()
  const rows: any[] = data.history.rows
  const start = data.history.start
  const end = data.history.end
  const filename = buildCsvFilename('reminder-history', { start, end, asOfIso: end })
  const caption = buildCsvCaption(start, end, end)
  const headers = ['Date','Customer','Invoice','Dunning Stage','Reminder Count','Batch Id']
  const lines: string[] = []
  if (includeVersion) lines.push('CSV-Version,1')
  lines.push(caption)
  lines.push(headers.join(','))
  for (const r of rows) {
    const fields = [r.lastReminderDate || '', r.customerId || '', r.invoiceId || '', r.dunningStage || '', String(r.reminderCount ?? ''), r.batchId || '']
    lines.push(fields.map(f => (f?.includes(',') ? '"'+f.replace(/"/g,'""')+'"' : f)).join(','))
  }
  const body = lines.join('\n') + '\n'
  return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
