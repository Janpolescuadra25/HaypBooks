import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, convertEstimateToInvoice as dbConvert, findEstimate as dbFindEstimate } from '@/mock/db'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json().catch(() => ({}))
  const inv = dbConvert(params.id, { invoiceNumber: body.invoiceNumber, date: body.date, terms: body.terms, dueDate: body.dueDate })
  const est = dbFindEstimate(params.id)
  return NextResponse.json({ invoice: inv, estimate: est })
}
