import { NextResponse } from 'next/server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { todayIso } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import { db, seedIfNeeded } from '@/mock/db'
import { GET as JSON_LIST } from '../route'

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

export async function GET(req: Request) {
  try { seedIfNeeded() } catch {}
  const hasReq = !!(req as any)
  const url = hasReq && (req as any).url ? new URL((req as any).url, 'http://test') : new URL('http://local/api/recurring-transactions/export')
  const versionFlag = parseCsvVersionFlag(hasReq ? (req as any) : url)

  // Delegate to JSON list (JSON-first)
  const jsonResp = await JSON_LIST()
  if (!('ok' in jsonResp) || !(jsonResp as any).ok) return jsonResp as any
  const data = await (jsonResp as any).json() as { data: Array<any> }
  const list = Array.isArray((data as any).data) ? (data as any).data : []

  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  const asOfIso = todayIso()
  lines.push(csvEscape(buildCsvCaption(null, null, asOfIso)))
  lines.push('')
  lines.push(['Name','Type','Frequency','Next Run','Last Run','End Date','Status','Remaining','Amount','Currency'].map(csvEscape).join(','))
  for (const r of list) {
    const currency = String(r.currency || baseCurrency)
    const amount = (Array.isArray(r.lines) ? r.lines.reduce((s: number, l: any) => s + Number(l?.amount || 0), 0) : 0)
    lines.push([
      String(r.name || ''),
      String(r.kind || ''),
      String(r.frequency || ''),
      String((r.nextRunDate || '').slice(0,10)),
      String((r.lastRunDate || '') ? String(r.lastRunDate).slice(0,10) : ''),
      String((r.endDate || '') ? String(r.endDate).slice(0,10) : ''),
      String(r.status || ''),
      (typeof r.remainingRuns === 'number' ? String(r.remainingRuns) : '∞'),
      formatCurrency(Number(amount || 0), currency),
      currency,
    ].map(csvEscape).join(','))
  }

  const filename = buildCsvFilename('recurring-transactions', { asOfIso })
  return new NextResponse(lines.join('\n'), { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' } })
}
