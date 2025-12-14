import { NextResponse } from 'next/server'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { todayIso } from '@/lib/date'
import { GET as getJson } from '../route'

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  // CSV-Version opt-in using shared parser
  const versionFlag = parseCsvVersionFlag(req)
  const end = url.searchParams.get('end') || undefined
  const q = url.searchParams.get('q') || undefined

  // JSON-first: delegate to customers JSON route (inherits customers:read RBAC and filters)
  const jsonRes = await getJson(req)
  if (!('ok' in jsonRes) || !(jsonRes as any).ok) return jsonRes as any
  const data = await (jsonRes as any).json() as { customers: Array<{ id: string; name: string }> }

  const lines: string[] = []
  if (versionFlag) lines.push('CSV-Version,1')
  lines.push(csvEscape(buildCsvCaption(null, null, end || todayIso())))
  lines.push(['Customer ID','Customer Name'].map(csvEscape).join(','))
  for (const c of data.customers) {
    lines.push([c.id, c.name].map(csvEscape).join(','))
  }
  const tokens: string[] = []
  if (q) tokens.push(`q-${sanitizeToken(q)}`)
  const filename = buildCsvFilename('customers', { asOfIso: end || todayIso(), tokens })
  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
