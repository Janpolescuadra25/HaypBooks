import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, parseCsvVersionFlag, sanitizeToken } from '@/lib/csv'
import { GET as getJson } from '../route'
import { hasReconciliationDiscrepancy } from '@/mock/db'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

function toCSV(rows: string[][]) {
  return rows.map(r => r.map((c) => {
    if (c == null) return ''
    const s = String(c)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }).join(',')).join('\n')
}

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const versionFlag = parseCsvVersionFlag(req)
  const url = new URL(req.url)
  const mode = (url.searchParams.get('csv') || '').toLowerCase()

  // Delegate to sibling JSON handler for single source of truth
  const jsonRes: any = await getJson(req, ctx as any)
  if (!jsonRes || jsonRes.status !== 200) return new NextResponse('Failed to build export', { status: 500 })
  const payload = await jsonRes.json() as {
    session: { accountId: string; periodEnd: string; beginningBalance?: number; endingBalance: number; serviceCharge?: number; interestEarned?: number; note?: string }
    account: { id: string; number?: string; name?: string } | null
    lines: Array<{ id: string; date: string; description: string; amount: number; cleared: boolean }>
    aggregates: {
      beginningBalance: number
      endingBalance: number
      serviceCharge: number
      interestEarned: number
      clearedDepositsTotal: number
      clearedPaymentsTotalAbs: number
      adjustmentsTotal: number
      clearedBalance: number
      difference: number
      periodEnd: string
    }
  }

  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const asOfIso = (payload.aggregates?.periodEnd || payload.session?.periodEnd || new Date().toISOString()).slice(0, 10)

  const rows: string[][] = []
  if (versionFlag) rows.push(['CSV-Version','1'])
  if (mode === 'discrepancy') {
    rows.push([buildCsvCaption('Reconciliation discrepancy report', null, asOfIso)])
    rows.push([])
    // Build snapshot vs current comparison
    const snap = (payload as any)?.session?.snapshot as Array<{ id: string; date: string; amount: number }> | undefined
    const sessionCreatedAt: string | undefined = (payload as any)?.session?.createdAt
    const curById = new Map<string, { date: string; amount: number; cleared?: boolean }>()
    for (const l of payload.lines) curById.set(l.id, { date: (l.date || '').slice(0,10), amount: Number(l.amount)||0, cleared: !!l.cleared })
    const diffs: Array<{ id: string; status: 'missing' | 'changed' | 'unreconciled'; snapDate?: string; snapAmount?: number; curDate?: string; curAmount?: number; actor?: string; action?: string; at?: string; changeType?: string }> = []
    if (Array.isArray(snap)) {
      for (const s of snap) {
        const cur = curById.get(s.id)
        if (!cur) { diffs.push({ id: s.id, status: 'missing', snapDate: s.date, snapAmount: s.amount }); continue }
        const changed = (cur.date !== s.date) || (Math.abs(Number(cur.amount||0) - Number(s.amount||0)) > 0.0001)
        const unrecon = cur.cleared === false // previously reconciled item appears as not-cleared now
        if (unrecon) {
          diffs.push({ id: s.id, status: 'unreconciled', snapDate: s.date, snapAmount: s.amount, curDate: cur.date, curAmount: cur.amount, changeType: 'unreconciled' })
        } else if (changed) {
          const ct = Math.abs(Number(cur.amount||0) - Number(s.amount||0)) > 0.0001 ? 'amount_changed' : (cur.date !== s.date ? 'date_changed' : 'changed')
          diffs.push({ id: s.id, status: 'changed', snapDate: s.date, snapAmount: s.amount, curDate: cur.date, curAmount: cur.amount, changeType: ct })
        }
      }
    }
    // Attach audit metadata from db.auditEvents (if available)
    try {
      const js: any = await jsonRes.json()
      // Note: jsonRes.json() can only be called once; above we called jsonRes.json() already into payload.
      // So instead, use db directly for audit metadata.
    } catch {}
    // Pull audit events for each diff (prefer events at/after session creation)
    const auditEvents: any[] = Array.isArray((db as any).auditEvents) ? (db as any).auditEvents : []
    for (const d of diffs) {
      const events = auditEvents.filter((e: any) => e && e.entityType === 'transaction' && e.entityId === d.id)
      if (events.length > 0) {
        const after = sessionCreatedAt ? events.filter(e => e.ts && e.ts >= sessionCreatedAt) : []
        const pickSource = (after.length > 0 ? after : events).slice().sort((a: any, b: any) => String(a.ts||'').localeCompare(String(b.ts||'')))
        const pick = pickSource[pickSource.length - 1]
        if (pick) { d.actor = pick.actor || ''; d.action = pick.action || ''; d.at = pick.ts || '' }
      }
    }
    rows.push(['Txn ID','Status','Snapshot Date','Snapshot Amount','Current Date','Current Amount','Change Type','Actor','Action','Timestamp'])
    for (const d of diffs) {
      rows.push([
        d.id,
        d.status,
        d.snapDate || '',
        formatCurrency(Number(d.snapAmount||0), baseCurrency),
        d.curDate || '',
        d.curAmount != null ? formatCurrency(Number(d.curAmount||0), baseCurrency) : '',
        d.changeType || '',
        d.actor || '',
        d.action || '',
        d.at || ''
      ])
    }
    const csv = toCSV(rows)
    const tokens: string[] = []
    const accNum = (payload.account as any)?.number || ''
    if (accNum) tokens.push(`acc-${sanitizeToken(String(accNum))}`)
    const filename = buildCsvFilename('reconciliation-discrepancy', { asOfIso, tokens })
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  rows.push([buildCsvCaption(null, null, asOfIso)])
  rows.push([])
  if (payload.session?.note) {
    rows.push(['Note', payload.session.note])
    rows.push([])
  }

  // Detail lines
  rows.push(['Date','Description','Amount','Cleared'])
  for (const l of payload.lines) {
    rows.push([
      (l.date || '').slice(0,10),
      l.description || '',
      formatCurrency(Number(l.amount) || 0, baseCurrency),
      l.cleared ? 'Y' : 'N',
    ])
  }

  rows.push([])
  // Summary section
  rows.push(['Summary'])
  rows.push(['Beginning Balance','', formatCurrency(Number(payload.aggregates.beginningBalance) || 0, baseCurrency)])
  rows.push(['Cleared Deposits','', formatCurrency(Number(payload.aggregates.clearedDepositsTotal) || 0, baseCurrency)])
  rows.push(['Cleared Payments','', formatCurrency(Number(payload.aggregates.clearedPaymentsTotalAbs) || 0, baseCurrency)])
  rows.push(['Adjustments Total','', formatCurrency(Number(payload.aggregates.adjustmentsTotal) || 0, baseCurrency)])
  rows.push(['Cleared Balance','', formatCurrency(Number(payload.aggregates.clearedBalance) || 0, baseCurrency)])
  rows.push(['Statement Ending Balance','', formatCurrency(Number(payload.aggregates.endingBalance) || 0, baseCurrency)])
  rows.push(['Difference','', formatCurrency(Number(payload.aggregates.difference) || 0, baseCurrency)])

  const csv = toCSV(rows)
  const tokens: string[] = []
  const accNum = (payload.account as any)?.number || ''
  if (accNum) tokens.push(`acc-${sanitizeToken(String(accNum))}`)
  const filename = buildCsvFilename('reconciliation-session', { asOfIso, tokens })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
