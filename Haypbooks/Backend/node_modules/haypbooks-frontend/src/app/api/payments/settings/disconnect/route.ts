import { NextResponse } from 'next/server'
import { getRoleFromCookies } from '@/lib/rbac-server'

export async function POST() {
  const role = getRoleFromCookies()
  if (!['admin','manager'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ connected: false })
}
