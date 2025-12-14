import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { getPeriods, getClosedThrough } from '@/lib/periods'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  let versionFlag = false
  try {
    const url = new URL((req as any).url)
    versionFlag = parseCsvVersionFlag(req)
  } catch {}
  const periods = getPeriods()
  const asOfIso = new Date().toISOString().slice(0,10)
  const rows = [
  ...(versionFlag ? [['CSV-Version','1']] : []),
    [buildCsvCaption(null, null, asOfIso)],
    ['Closed Through', getClosedThrough() || ''],
    [],
    ['ID','Start','End','Status'],
    ...periods.map(p => [p.id, p.start, p.end, p.status]),
  ]
  const csv = rows.map(r => r.map(x => typeof x === 'string' && x.includes(',') ? `"${x}"` : String(x)).join(',')).join('\n')
  const filename = buildCsvFilename('periods', { asOfIso })
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    }
  })
}
