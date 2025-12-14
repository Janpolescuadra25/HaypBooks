import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded, createDeposit as dbCreateDeposit, listDeposits as dbListDeposits } from '@/mock/db'

export async function GET() {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:read') && !hasPermission(role, 'reports:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const deposits = dbListDeposits().map(d => {
    // Derive deposit-to account from the original journal entry's debit line
    const je = d.journalEntryId ? (db.journalEntries || []).find(j => j.id === d.journalEntryId) : undefined
    let depositToAccount: { number: string; name: string } | undefined
    if (je) {
      const debitLine = je.lines.find(l => (l.debit || 0) > 0)
      if (debitLine) {
        const acc = (db.accounts || []).find(a => a.id === debitLine.accountId)
        if (acc) depositToAccount = { number: acc.number, name: acc.name }
      }
    }
    const voidedAt = (d as any).voidedAt as string | undefined
    return { id: d.id, date: d.date, total: d.total, paymentCount: d.paymentIds.length, depositToAccount, voidedAt }
  })
  return NextResponse.json({ deposits, total: deposits.length })
}

export async function POST(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({} as any))
  const paymentIds: string[] = Array.isArray(body?.paymentIds) ? body.paymentIds : []
  if (!paymentIds.length) return NextResponse.json({ error: 'paymentIds required' }, { status: 400 })
  try {
    const dep = dbCreateDeposit({ date: body?.date, paymentIds, accountNumber: body?.accountNumber, memo: body?.memo })
    return NextResponse.json({ deposit: dep })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Failed to create deposit') }, { status: 400 })
  }
}
