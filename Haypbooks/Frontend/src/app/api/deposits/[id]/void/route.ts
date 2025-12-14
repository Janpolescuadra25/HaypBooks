import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, voidDeposit } from '@/mock/db'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const id = params?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    const dep = voidDeposit(id)
    return NextResponse.json({ deposit: dep })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Failed to void deposit') }, { status: 400 })
  }
}
