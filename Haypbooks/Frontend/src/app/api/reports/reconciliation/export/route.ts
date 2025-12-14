import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { parseCsvVersionFlag, buildCsvFilename, sanitizeToken } from '@/lib/csv'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'
import { GET as GET_SUMMARY } from '../summary/route'

function toCSV(rows: Array<Array<string | number>>): string {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const s = String(c ?? '')
          return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s
        })
        .join(',')
    )
    .join('\n')
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })

  // Call sibling summary route for data parity
  const url = new URL(req.url)
  url.pathname = url.pathname.replace(/\/export$/, '/summary')
  const jsonRes: any = await GET_SUMMARY(new Request(url.toString()))
  if (!jsonRes || typeof jsonRes.json !== 'function') return new NextResponse('Upstream error', { status: 500 })
  const data = await jsonRes.json()

  const asOfIso: string = (data.asOf || '').slice(0,10) || new Date().toISOString().slice(0,10)
  const versionFlag = parseCsvVersionFlag(req)
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const accountId = String(data.accountId || '')

  const rows: Array<Array<string | number>> = []
  if (versionFlag) rows.push(['CSV-Version','1'])
  rows.push([buildCsvRangeOrDate(null, null, asOfIso)])
  rows.push([])
  rows.push(['Statement end', String(data.statementEndDate || asOfIso)])
  rows.push(['Account ID', accountId])
  rows.push(['Statement ending balance', formatCurrency(Number(data.statementEndingBalance || 0), baseCurrency)])
  rows.push(['Cleared debits', formatCurrency(Number(data.clearedDebits || 0), baseCurrency)])
  rows.push(['Cleared credits', formatCurrency(Number(data.clearedCredits || 0), baseCurrency)])
  rows.push(['Outstanding checks', formatCurrency(Number(data.outstandingChecks || 0), baseCurrency)])
  rows.push(['Outstanding deposits', formatCurrency(Number(data.outstandingDeposits || 0), baseCurrency)])
  rows.push(['Difference', formatCurrency(Number(data.difference || 0), baseCurrency)])
  rows.push([])
  rows.push(['Date','Type','Amount','Cleared'])
  const items: any[] = Array.isArray(data.items) ? data.items : []
  for (const it of items) {
    rows.push([
      String(it.date || ''),
      String(it.type || ''),
      formatCurrency(Number(it.amount || 0), baseCurrency),
      it.cleared ? 'Yes' : 'No',
    ])
  }

  const csv = toCSV(rows)
  const tokens = [] as string[]
  if (accountId) tokens.push(`acct-${sanitizeToken(accountId)}`)
  const filename = buildCsvFilename('reconciliation', { asOfIso, tokens })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    }
  })
}
