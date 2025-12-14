import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { GET as JSON_GET } from '../route'
import { buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'

function csv(rows: string[][]) {
  return rows.map(r => r.map(c => {
    if (c == null) return ''
    const s = String(c)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }).join(',')).join('\n')
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const versionFlag = parseCsvVersionFlag(req)
  const urlIn = new URL(req.url)
  const asOfIso = (urlIn.searchParams.get('asOf') || new Date().toISOString().slice(0,10))

  // Delegate to JSON
  const jsonRes: any = await JSON_GET()
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to build export', { status: 500 })
  const data = await jsonRes.json() as { inflows: number; outflows: number; net: number; progress: number; counts: { for_review: number; categorized: number; excluded: number } }

  const header = ['Status','Count']
  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version','1'])
  rows.push([buildCsvCaption(null,null,asOfIso)])
  rows.push([])
  rows.push(header)
  rows.push(['For Review', String(data.counts.for_review)])
  rows.push(['Categorized', String(data.counts.categorized)])
  rows.push(['Excluded', String(data.counts.excluded)])
  rows.push([])
  rows.push(['Inflows', String(data.inflows)])
  rows.push(['Outflows', String(data.outflows)])
  rows.push(['Net', String(data.net)])
  rows.push(['Progress %', String(data.progress)])

  const body = csv(rows)
  const filename = buildCsvFilename('reconciliation-summary', { asOfIso })
  return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}
