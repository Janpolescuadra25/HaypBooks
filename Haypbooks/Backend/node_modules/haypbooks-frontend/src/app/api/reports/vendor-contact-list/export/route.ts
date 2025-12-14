import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvCaption } from '@/lib/report-helpers'
import { GET as getJson } from '../route'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  // CSV-Version opt-in via aliases
  const versionFlag = parseCsvVersionFlag(req)
  const q = (url.searchParams.get('q') || '').toLowerCase()
  const end = url.searchParams.get('end') || new Date().toISOString().slice(0, 10)
  // Delegate to JSON handler to avoid drift
  const api = new URL(req.url)
  api.pathname = api.pathname.replace('/export', '')
  const res = await getJson(new Request(api.toString()))
  if ((res as any).status !== 200) return new NextResponse('Failed to build export', { status: 500 })
  const json = await (res as any).json()
  let rows = (json.rows as Array<{ name: string; email: string; phone: string }> )
  if (q) rows = rows.filter(r => r.name.toLowerCase().includes(q))

  function toCsvCell(v: any) {
    if (v == null) return ''
    const s = String(v)
    if (/[,"\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }

  const out: string[] = []
  if (versionFlag) out.push('CSV-Version,1')
  // Caption-first row via shared helper for consistency
  out.push([buildCsvCaption(null, null, end)].join(','))
  out.push('')
  out.push(['Name','Email','Phone'].join(','))
  for (const r of rows) out.push([r.name, r.email, r.phone].map(toCsvCell).join(','))

  const body = out.join('\n')
  const filename = buildCsvFilename('vendor-contacts', { asOfIso: end })
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
