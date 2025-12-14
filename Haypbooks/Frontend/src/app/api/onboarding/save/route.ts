import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/mock/db'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { step, data } = body

  if (!step || typeof data === 'undefined') return NextResponse.json({ error: 'missing step/data' }, { status: 400 })

  const userId = cookies().get('userId')?.value || 'u_1'
  // store per-user onboardingDrafts in the mock DB (safe for dev only)
  try {
    ;(db as any).onboardingDrafts = (db as any).onboardingDrafts || {}
    ;(db as any).onboardingDrafts[userId] = { ...( (db as any).onboardingDrafts[userId] || {} ), [step]: data }
    return NextResponse.json({ success: true, saved: { step } })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const userId = cookies().get('userId')?.value || 'u_1'
  const snapshot = (db as any).onboardingDrafts?.[userId] || {}
  return NextResponse.json({ snapshot })
}
