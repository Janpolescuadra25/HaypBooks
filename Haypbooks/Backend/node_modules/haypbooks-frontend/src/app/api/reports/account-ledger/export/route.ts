import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'
import { GET as getJson } from '../route'

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
  const acct = url.searchParams.get('account') || '1000'
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  const startQ = url.searchParams.get('start')
  const endQ = url.searchParams.get('end')
  const dr = deriveRange(period, startQ, endQ)
  const start = dr.start || startQ
  const end = dr.end || endQ

  // Delegate to JSON for account ledger data
  const jsonResp = await getJson(req)
  if (!jsonResp.ok) return jsonResp
  const data = await jsonResp.json() as { account: { number: string; name: string }; rows: Array<{ date: string; memo: string; debit: number; credit: number; balance: number }>; asOf?: string }
  const asOfIso = (data.asOf || (end || new Date().toISOString())).slice(0,10)
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'

  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version','1'])
  rows.push([buildCsvCaption(start || null, end || null, asOfIso)])
  rows.push([])
  rows.push(['Date','Memo','Debit','Credit','Balance'])
  for (const r of data.rows) {
    rows.push([
      r.date.slice(0,10),
      r.memo,
      formatCurrency(Number(r.debit) || 0, baseCurrency),
      formatCurrency(Number(r.credit) || 0, baseCurrency),
      formatCurrency(Number(r.balance) || 0, baseCurrency),
    ])
  }
  const csv = toCSV(rows)
  // Ledger filenames intentionally use as-of semantics with an account token.
  const filename = buildCsvFilename('account-ledger', { asOfIso, tokens: [acct] })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
