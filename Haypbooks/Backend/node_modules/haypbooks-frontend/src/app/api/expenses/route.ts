import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { logEvent } from '@/lib/audit'
import { deleteExpense, listExpenses, seedExpenses, upsertExpense } from './store'
import { getClosedThrough } from '@/lib/periods'
import { isDateInClosedPeriod, buildClosedPeriodErrorPayload } from '@/lib/period-lock'

const cats = ['Meals', 'Travel', 'Supplies', 'Utilities', 'Rent'] as const

function gen(page = 1, limit = 20) {
  return Array.from({ length: limit }, (_, i) => {
    const idx = (page - 1) * limit + i + 1
    return {
      id: `exp_${idx}`,
      date: new Date(Date.UTC(2025, 0, Math.max(1, (idx % 28) + 1))).toISOString(),
      payee: `Vendor ${idx}`,
      category: cats[idx % cats.length],
      amount: ((idx % 2 === 0) ? 1 : -1) * (25 + (idx % 15) * 3),
      memo: `Expense ${idx}`,
      accountId: `acc_${(idx % 5) + 1}`,
    }
  })
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const category = url.searchParams.get('category')
  seedExpenses(gen(1, 60))
  let all = listExpenses().map(e => ({ ...e, date: e.date.slice(0,10) }))
  if (start) all = all.filter(e => e.date >= start)
  if (end) all = all.filter(e => e.date <= end)
  if (category) all = all.filter(e => e.category === category)
  const slice = all.slice((page - 1) * limit, (page - 1) * limit + limit)
  return NextResponse.json({ expenses: slice, total: all.length, page, limit })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({} as any))
  const { date, payee, category, amount, memo, accountId } = body || {}
  if (!date || !payee || !category || typeof amount !== 'number') {
    return NextResponse.json({ error: 'date, payee, category, amount are required' }, { status: 400 })
  }
  // Period lock: block expenses dated on/before closed date
  const cp = isDateInClosedPeriod(date)
  if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })
  const e = upsertExpense({ id: `exp_${Math.random().toString(36).slice(2,8)}`, date, payee, category, amount, memo, accountId })
  logEvent({ userId: 'u_1', action: 'expense.create', entity: 'expense', entityId: e.id, meta: { amount: e.amount, category: e.category } })
  return NextResponse.json({ expense: e })
}

export async function PUT(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({} as any))
  const { id, date, payee, category, amount, memo, accountId } = body || {}
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  if (!date || !payee || !category || typeof amount !== 'number') {
    return NextResponse.json({ error: 'date, payee, category, amount are required' }, { status: 400 })
  }
  // Period lock: prevent moving expense into a closed period
  const cp = isDateInClosedPeriod(date)
  if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })
  const e = upsertExpense({ id, date, payee, category, amount, memo, accountId })
  logEvent({ userId: 'u_1', action: 'expense.update', entity: 'expense', entityId: e.id, meta: { amount: e.amount } })
  return NextResponse.json({ expense: e })
}

export async function DELETE(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  deleteExpense(id)
  logEvent({ userId: 'u_1', action: 'expense.delete', entity: 'expense', entityId: id })
  return NextResponse.json({ ok: true })
}
