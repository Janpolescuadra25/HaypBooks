import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { listSalesReceipts, seedSalesReceipts } from '../../sales-receipts/store'

function gen(limit = 60) {
  return Array.from({ length: limit }, (_, i) => {
    const idx = i + 1
    return {
      id: `sr_${idx}`,
      date: new Date(Date.UTC(2025, 0, Math.max(1, (idx % 28) + 1))).toISOString(),
      customer: `Customer ${idx}`,
      description: `Sales receipt ${idx}`,
      amount: 50 + (idx % 20) * 5,
    }
  })
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase()
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  seedSalesReceipts(gen(60))
  let rows = listSalesReceipts().map((r) => ({ date: r.date.slice(0, 10), customer: r.customer, description: r.description || '', amount: r.amount }))
  if (start) rows = rows.filter((r) => r.date >= start)
  if (end) rows = rows.filter((r) => r.date <= end)
  if (q) rows = rows.filter((r) => r.customer.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
  return NextResponse.json({ rows })
}
