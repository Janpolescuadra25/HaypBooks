import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { GET as JSON_GET } from '../route'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

type BSAccount = { number: string; name: string; amount: number }

function toCSV(rows: string[][]) {
  return rows
    .map(r => r.map((c) => {
      if (c == null) return ''
      const s = String(c)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
      return s
    }).join(','))
    .join('\n')
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || 'YTD'
  const compare = url.searchParams.get('compare') === '1'
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  // Delegate to JSON route (JSON-first)
  const jsonRes: any = await JSON_GET(req)
  if (!jsonRes || jsonRes.status !== 200) return jsonRes
  const data = await jsonRes.json() as {
    assets: BSAccount[]
    liabilities: BSAccount[]
    equity: BSAccount[]
    totals: { assets: number; liabilities: number; equity: number }
    asOf: string
    baseCurrency?: string
    compare?: { assets: BSAccount[]; liabilities: BSAccount[]; equity: BSAccount[]; totals: { assets: number; liabilities: number; equity: number } } | null
  }

  const asOfIso = (data.asOf || end || new Date().toISOString()).slice(0, 10)
  const caption = buildCsvCaption(null, asOfIso, asOfIso)
  const baseCurrency = (db.settings?.baseCurrency as string) || data.baseCurrency || 'USD'

  // Build maps for previous compare amounts (by account number, fallback name)
  const prevMaps = {
    assets: new Map<string, number>(),
    liabilities: new Map<string, number>(),
    equity: new Map<string, number>(),
  }
  if (compare && data.compare) {
    for (const a of data.compare.assets || []) prevMaps.assets.set(a.number || a.name, a.amount)
    for (const a of data.compare.liabilities || []) prevMaps.liabilities.set(a.number || a.name, a.amount)
    for (const a of data.compare.equity || []) prevMaps.equity.set(a.number || a.name, a.amount)
  }

  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version', '1'])
  rows.push([caption])
  rows.push(['Section', 'Account', 'Current', ...(compare ? ['Previous', 'Delta', 'Percent'] : [])])

  function pushSection(section: 'Assets'|'Liabilities'|'Equity', cur: BSAccount[], prevMap: Map<string, number>) {
    for (const c of cur) {
      if (!compare) {
        rows.push([section, c.name, formatCurrency(Number(c.amount || 0), baseCurrency)])
      } else {
        const prev = prevMap.get(c.number || c.name) || 0
        const delta = (c.amount || 0) - prev
        const pct = prev !== 0 ? (delta / Math.abs(prev)) * 100 : 0
        rows.push([
          section,
          c.name,
          formatCurrency(Number(c.amount || 0), baseCurrency),
          formatCurrency(Number(prev || 0), baseCurrency),
          formatCurrency(Number(delta || 0), baseCurrency),
          pct.toFixed(2) + '%',
        ])
      }
    }
  }

  pushSection('Assets', data.assets || [], prevMaps.assets)
  pushSection('Liabilities', data.liabilities || [], prevMaps.liabilities)
  pushSection('Equity', data.equity || [], prevMaps.equity)

  // Totals
  rows.push([])
  if (!compare) {
    rows.push(['Totals'])
    rows.push(['Assets Total', '', formatCurrency(Number(data.totals.assets || 0), baseCurrency)])
    rows.push(['Liabilities Total', '', formatCurrency(Number(data.totals.liabilities || 0), baseCurrency)])
    rows.push(['Equity Total', '', formatCurrency(Number(data.totals.equity || 0), baseCurrency)])
  } else {
    rows.push(['Totals'])
    const p = data.compare?.totals
    const pushTotal = (label: string, cur: number, prev: number) => {
      const delta = cur - prev
      const pct = prev !== 0 ? (delta / Math.abs(prev)) * 100 : 0
      rows.push([
        label,
        '',
        formatCurrency(Number(cur || 0), baseCurrency),
        formatCurrency(Number(prev || 0), baseCurrency),
        formatCurrency(Number(delta || 0), baseCurrency),
        pct.toFixed(2) + '%',
      ])
    }
    pushTotal('Assets Total', data.totals.assets || 0, p?.assets || 0)
    pushTotal('Liabilities Total', data.totals.liabilities || 0, p?.liabilities || 0)
    pushTotal('Equity Total', data.totals.equity || 0, p?.equity || 0)
  }

  const body = toCSV(rows)
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${buildCsvFilename('balance-sheet', { asOfIso, tokens: [period + (compare ? '-compare' : '')], tokenPosition: 'before' })}"`,
      'Cache-Control': 'no-store',
    }
  })
}
