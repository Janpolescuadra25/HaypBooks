import { NextResponse } from 'next/server'
import { getRoleFromCookies } from '@/lib/rbac-server'
import { db } from '@/mock/db'

// This module reuses state from parent via global scope per instance; for demo, we just echo
export async function POST() {
  const role = getRoleFromCookies()
  if (!['admin','manager'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  ;(db as any).paymentsEnabled = !(db as any).paymentsEnabled
  return NextResponse.json({ enabled: (db as any).paymentsEnabled })
}
