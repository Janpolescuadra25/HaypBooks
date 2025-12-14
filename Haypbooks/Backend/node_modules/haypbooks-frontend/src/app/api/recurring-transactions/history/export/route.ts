import { NextRequest, NextResponse } from 'next/server'
import { listHistory } from '../../store'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { todayIso } from '@/lib/date'

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const templateId = url.searchParams.get('templateId') || undefined
  const start = url.searchParams.get('start') || undefined
  const end = url.searchParams.get('end') || undefined
  const items = listHistory({ templateId, start, end })
  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  const asOfIso = todayIso()
  // Caption reflects range when provided, else as-of
  if (start || end) {
    lines.push(csvEscape(buildCsvCaption(start || null, end || null, undefined as any)))
  } else {
    lines.push(csvEscape(buildCsvCaption(null, null, asOfIso)))
  }
  lines.push('')
  lines.push(['Run Date','Template ID','Artifact Type','Artifact ID','Amount'].map(csvEscape).join(','))
  for (const h of items) {
    lines.push([h.runDate, h.templateId, h.artifactType, h.artifactId || '', String(h.amount || 0)].map(csvEscape).join(','))
  }
  const filename = buildCsvFilename('recurring-history', { asOfIso })
  return new NextResponse(lines.join('\n'), { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' } })
}
