import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { createBankTransfer, listBankTransfers, db, seedIfNeeded } from '@/mock/db'

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const start = url.searchParams.get('start') || undefined
  const end = url.searchParams.get('end') || undefined
  const from = url.searchParams.get('fromAccountNumber') || undefined
  const to = url.searchParams.get('toAccountNumber') || undefined
  const rows = listBankTransfers({ start, end, fromAccountNumber: from, toAccountNumber: to })
  return NextResponse.json({ rows, count: rows.length })
}

export async function POST(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await req.json()
    const { date, fromAccountNumber, toAccountNumber, amount, memo } = body || {}
    if (!fromAccountNumber || !toAccountNumber || !(Number(amount) > 0)) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    const xfer = createBankTransfer({ date, fromAccountNumber, toAccountNumber, amount: Number(amount), memo })
    return NextResponse.json({ result: xfer })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Failed') }, { status: 400 })
  }
}
