import { NextResponse } from 'next/server'
import { getRoleFromCookies } from '@/lib/rbac-server'
import { db } from '@/mock/db'

export async function GET() {
  const role = getRoleFromCookies()
  const canRead = ['admin','manager','viewer','ap-clerk'].includes(role)
  if (!canRead) return NextResponse.json({ forbidden: true }, { status: 403 })
  const methods: string[] = (db as any).paymentMethods || ['Card', 'ACH']
  const payments = { enabled: (db as any).paymentsEnabled ?? true, processor: 'Stripe', methods }
  return NextResponse.json({ role, ...payments })
}

export async function POST() {
  const role = getRoleFromCookies()
  if (!['admin','manager'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  ;(db as any).paymentsEnabled = !(db as any).paymentsEnabled
  return NextResponse.json({ enabled: (db as any).paymentsEnabled })
}
