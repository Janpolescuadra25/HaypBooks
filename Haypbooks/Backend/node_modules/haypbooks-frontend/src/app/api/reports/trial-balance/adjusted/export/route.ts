import { NextResponse } from 'next/server'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as GET_API } from '../route'
import { formatCurrency } from '@/lib/format'
import { db } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

export async function GET(req: Request) {
  // RBAC first
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || 'Custom'
  const startParam = url.searchParams.get('start')
  const endParam = url.searchParams.get('end')
  const { start, end } = deriveRange(period, startParam, endParam)
  const asOfIso = end || new Date().toISOString().slice(0, 10)

  // Rebuild URL to target the JSON API in this folder
  const apiUrl = new URL(req.url)
  apiUrl.pathname = apiUrl.pathname.replace('/export', '')
  // Directly call the API handler
  const res: any = await GET_API(new Request(apiUrl.toString()))
  if (!res || res.status !== 200) {
    return new NextResponse('Failed to build export', { status: res?.status || 500 })
  }
  const data = await (res as any).json()

  function toCSV(rows: string[][]) {
    return rows
      .map(r => r
        .map(c => {
          if (c == null) return ''
          const s = String(c)
          return s.includes(',') || s.includes('"') || s.includes('\n')
            ? '"' + s.replace(/"/g, '""') + '"'
            : s
        })
        .join(','))
      .join('\n')
  }

  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version','1'])
  rows.push([buildCsvCaption(start || null, end || null, asOfIso)])
  rows.push([''])
  rows.push(['Account','Name','Unadj Debit','Unadj Credit','Adj Debit','Adj Credit','Final Debit','Final Credit'])
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  for (const r of data.rows as Array<any>) {
    const fmt = (n: number) => formatCurrency(Number(n || 0), baseCurrency).replace(/,/g, '')
    rows.push([
      r.number,
      r.name,
      fmt(r.unadjDebit),
      fmt(r.unadjCredit),
      fmt(r.adjDebit),
      fmt(r.adjCredit),
      fmt(r.finalDebit),
      fmt(r.finalCredit),
    ])
  }
  const t = data.totals || {}
  const fmt = (n: number) => formatCurrency(Number(n || 0), baseCurrency).replace(/,/g, '')
  rows.push(['','Totals', fmt(t.unadjDebit), fmt(t.unadjCredit), fmt(t.adjDebit), fmt(t.adjCredit), fmt(t.finalDebit), fmt(t.finalCredit)])

  const csv = toCSV(rows)
  const filename = buildCsvFilename('trial-balance-adjusted', { asOfIso })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
