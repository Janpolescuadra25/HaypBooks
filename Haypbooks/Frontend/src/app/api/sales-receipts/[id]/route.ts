import { NextResponse } from 'next/server'
import { getSalesReceipt, seedSalesReceipts } from '../store'

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

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params
  seedSalesReceipts(gen(60))
  const receipt = getSalesReceipt(id)
  if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ receipt })
}
