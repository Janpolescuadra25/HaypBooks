// Duplicate route handlers removed; see implementations below which include vendor name hydration.
import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, listVendorCredits, createVendorCredit, db } from '@/mock/db'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const url = new URL(req.url)
  const vendorId = url.searchParams.get('vendorId') || undefined
  const rows = listVendorCredits({ vendorId })
  // map vendor name
  const list = rows.map(vc => ({ ...vc, vendor: db.vendors.find(v => v.id === vc.vendorId)?.name || vc.vendorId }))
  return NextResponse.json({ vendorCredits: list })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const body = await req.json().catch(() => ({}))
  const { number, vendorId, date, lines } = body || {}
  if (!vendorId || !Array.isArray(lines) || lines.length === 0) return NextResponse.json({ error: 'vendorId and lines required' }, { status: 400 })
  try {
    const vc = createVendorCredit({ number, vendorId, date, lines })
    return NextResponse.json({ vendorCredit: { ...vc, vendor: db.vendors.find(v => v.id === vc.vendorId)?.name || vc.vendorId } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 400 })
  }
}
