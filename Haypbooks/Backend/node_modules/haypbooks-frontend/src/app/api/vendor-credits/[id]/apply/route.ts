// Duplicate implementation removed; see POST below.
import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, applyVendorCreditToBill } from '@/mock/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const body = await req.json().catch(() => ({}))
  const { billId, amount } = body || {}
  if (!billId || !(Number(amount) > 0)) return NextResponse.json({ error: 'billId and positive amount required' }, { status: 400 })
  try {
    const { bill, vendorCredit } = applyVendorCreditToBill(params.id, billId, Number(amount))
    return NextResponse.json({ bill, vendorCredit })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 400 })
  }
}
