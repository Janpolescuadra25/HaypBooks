import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, invoiceTimeEntries } from '@/mock/db'

export async function POST(request: Request) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const { entryIds, invoiceNumber, date, terms, dueDate } = body
  try {
    const invoice = invoiceTimeEntries({ entryIds, invoiceNumber, date, terms, dueDate })
    return NextResponse.json({ invoice })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 400 })
  }
}
