import { NextResponse } from 'next/server'
import { applyRulesToTransactions, seedIfNeeded, db } from '@/mock/db'

export async function POST(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const url = new URL(req.url)
  const accountId = url.searchParams.get('accountId') || undefined
  const result = applyRulesToTransactions(['imported','for_review'], accountId)
  return NextResponse.json(result)
}
