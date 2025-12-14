import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { getClosedThrough } from '@/lib/periods'
import { isDateInClosedPeriod, buildClosedPeriodErrorPayload } from '@/lib/period-lock'
import { findByAccountAndNumber, nextCheckNumber, upsertCheck } from './store'
import { db } from '@/mock/db'

type IssueCheckBody = {
  date?: string
  payee: string
  amount: number
  account: string
  number?: string
  memo?: string
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({} as IssueCheckBody))
  let { date, payee, amount, account, number, memo } = body || ({} as IssueCheckBody)
  if (!payee || typeof amount !== 'number' || !account) {
    return NextResponse.json({ error: 'payee, amount, account are required' }, { status: 400 })
  }
  const today = new Date().toISOString().slice(0,10)
  const eff = (typeof date === 'string' && date.length >= 10) ? date.slice(0,10) : today
  const cp = isDateInClosedPeriod(eff)
  if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })
  // Number sequencing and duplicate prevention per account
  const no = (number && String(number)) || nextCheckNumber(account)
  if (findByAccountAndNumber(account, no)) {
    return NextResponse.json({ error: 'Duplicate check number for this account' }, { status: 400 })
  }
  const chk = upsertCheck({ id: `chk_${Math.random().toString(36).slice(2,8)}`, date: eff, payee, amount, account, number: no, memo, status: 'to_print' })
  // Audit: record check creation
  ;(db.auditEvents ||= []).push({
    id: `aud_${Date.now()}`,
    ts: new Date().toISOString(),
    actor: 'system',
    action: 'check:create',
    entityType: 'check',
    entityId: chk.id,
    after: { ...chk },
    meta: { account: chk.account, number: chk.number, amount: chk.amount }
  } as any)
  return NextResponse.json({ check: chk })
}
