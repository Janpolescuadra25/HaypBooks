import { NextResponse } from 'next/server'
import { deriveRange } from '@/lib/report-helpers'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import '@/mock/seed'

type LedgerLine = {
  date: string
  journalId: string
  memo?: string | null
  accountNumber: string
  accountName: string
  debit: number
  credit: number
  balance: number // running balance for the account
}

function inRange(dateIso: string, start?: string | null, end?: string | null) {
  if (start && dateIso < start) return false
  if (end && dateIso > end) return false
  return true
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  const alias = period === 'ThisMonth' ? 'MTD' : period === 'ThisQuarter' ? 'QTD' : period
  const startQ = url.searchParams.get('start') || undefined
  const endQ = url.searchParams.get('end') || undefined
  const dr = deriveRange(alias, startQ, endQ)
  const start = dr.start || startQ || null
  const end = dr.end || endQ || null
  const accountParam = url.searchParams.get('account') || null // number or id

  // Build index of accounts by id and by number
  const byId = new Map<string, any>()
  const byNumber = new Map<string, any>()
  for (const a of db.accounts || []) { byId.set(a.id, a); byNumber.set(a.number, a) }

  const accountFilter = ((): any | null => {
    if (!accountParam) return null
    return byNumber.get(accountParam) || byId.get(accountParam) || null
  })()

  // Opening balances (prior to start) per account
  const opening = new Map<string, number>() // key: accountId -> opening balance
  const jeList: any[] = db.journalEntries || []
  for (const je of jeList) {
    const d = (je.date || '').slice(0,10)
    if (start && (!d || d >= start)) continue // only prior to start
    for (const l of je.lines || []) {
      const accId = l.accountId
      if (!byId.has(accId)) continue
      if (accountFilter && accId !== accountFilter.id) continue
      const prev = opening.get(accId) || 0
      const next = prev + (Number(l.debit||0) - Number(l.credit||0))
      opening.set(accId, next)
    }
  }

  // Build ledger lines within range with running balances
  const lines: LedgerLine[] = []
  const running = new Map<string, number>()
  // seed running with opening
  for (const [accId, bal] of opening.entries()) running.set(accId, bal)

  // Collect in-range journal lines
  type Raw = { date: string; journalId: string; memo?: string; accId: string; debit: number; credit: number }
  const raws: Raw[] = []
  for (const je of jeList) {
    const d = (je.date || '').slice(0,10)
    if (!d) continue
    if (!inRange(d, start || undefined, end || undefined)) continue
    for (const l of je.lines || []) {
      const accId = l.accountId
      if (!byId.has(accId)) continue
      if (accountFilter && accId !== accountFilter.id) continue
      raws.push({ date: d, journalId: je.id, memo: je.memo, accId, debit: Number(l.debit||0), credit: Number(l.credit||0) })
    }
  }
  // Sort deterministically: by account number, then date, then journal id
  raws.sort((a,b)=>{
    const an = byId.get(a.accId)?.number || ''
    const bn = byId.get(b.accId)?.number || ''
    const c1 = String(an).localeCompare(String(bn))
    if (c1 !== 0) return c1
    const c2 = a.date.localeCompare(b.date)
    if (c2 !== 0) return c2
    return String(a.journalId).localeCompare(String(b.journalId))
  })

  for (const r of raws) {
    const acc = byId.get(r.accId)
    const prev = running.get(r.accId) || 0
    const next = prev + (r.debit - r.credit)
    running.set(r.accId, next)
    lines.push({
      date: r.date,
      journalId: r.journalId,
      memo: r.memo || null,
      accountNumber: acc.number,
      accountName: acc.name,
      debit: r.debit,
      credit: r.credit,
      balance: Number(next.toFixed(2)),
    })
  }

  // Summaries per account
  const accounts: Array<{ number: string; name: string; opening: number; debit: number; credit: number; closing: number }> = []
  const grouped = new Map<string, { number: string; name: string; opening: number; debit: number; credit: number; closing: number }>()
  for (const l of lines) {
    const key = l.accountNumber
    const g = grouped.get(key) || { number: l.accountNumber, name: l.accountName, opening: Number((opening.get(byNumber.get(l.accountNumber)?.id || '') || 0).toFixed(2)), debit: 0, credit: 0, closing: 0 }
    g.debit += l.debit
    g.credit += l.credit
    g.closing = l.balance
    grouped.set(key, g)
  }
  for (const v of grouped.values()) { v.debit = Number(v.debit.toFixed(2)); v.credit = Number(v.credit.toFixed(2)); accounts.push(v) }
  // Totals across returned accounts
  const totals = accounts.reduce((acc, a)=>{ acc.debit += a.debit; acc.credit += a.credit; return acc }, { debit: 0, credit: 0 })
  totals.debit = Number(totals.debit.toFixed(2)); totals.credit = Number(totals.credit.toFixed(2))

  return NextResponse.json({
    period,
    start,
    end,
    account: accountFilter ? { number: accountFilter.number, name: accountFilter.name, id: accountFilter.id } : null,
    opening: accountFilter ? Number((opening.get(accountFilter.id) || 0).toFixed(2)) : null,
    rows: lines,
    accounts,
    totals,
    generatedAt: new Date().toISOString(),
  })
}
