import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { formatCurrency } from '@/lib/format'
import { GET as JSON_DETAIL } from '../route'

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

function toCSV(rows: string[][]): string {
  return rows.map(r => r.map(csvEscape).join(',')).join('\n')
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = params || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const versionFlag = parseCsvVersionFlag(req)
  // Delegate to sibling JSON route for authoritative shape and RBAC (JSON-first)
  const baseUrl = new URL(req.url)
  // Strip trailing /export for delegation to ../route (handled by import)
  const jsonResp = await JSON_DETAIL(new Request(baseUrl.toString(), { headers: req.headers }), { params: { id } })
  if (!('ok' in jsonResp) || !(jsonResp as any).ok) return jsonResp as any
  const payload = await (jsonResp as any).json() as { deposit: any }
  const detail = payload?.deposit
  if (!detail) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rows: string[][] = []
  const asOf = (detail.date || '').slice(0,10) || new Date().toISOString().slice(0,10)
  if (versionFlag) rows.push(['CSV-Version','1'])
  rows.push(['Deposit'])
  rows.push([buildCsvCaption(null, null, asOf)])
  rows.push([])
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  rows.push(['Deposit ID', detail.id])
  rows.push(['Date', asOf])
  if (detail.depositToAccount) rows.push(['Deposit to', `${detail.depositToAccount.number} · ${detail.depositToAccount.name}`])
  const memo = detail.memo
  if (memo) rows.push(['Memo', memo])
  const voidedAt = detail.voidedAt
  if (voidedAt) rows.push(['Voided', (voidedAt || '').slice(0,10)])
  rows.push(['Total', formatCurrency(Number(detail.total) || 0, baseCurrency)])
  rows.push([])
  rows.push(['Invoice #','Payment ID','Amount','Payment Date'])
  for (const p of detail.payments) {
    rows.push([
      p.invoiceNumber,
      p.id,
      formatCurrency(Number(p.amount) || 0, baseCurrency),
      (p.date || '').slice(0,10),
    ])
  }
  rows.push([])
  rows.push(['Payments', String(detail.payments.length)])
  rows.push(['Total', formatCurrency(Number(detail.total) || 0, baseCurrency)])

  const tokens = [sanitizeToken(detail.id)]
  if (detail.depositToAccount) tokens.push(sanitizeToken(detail.depositToAccount.number))
  const filename = buildCsvFilename('deposit', { asOfIso: asOf, tokens })
  const csv = toCSV(rows)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
