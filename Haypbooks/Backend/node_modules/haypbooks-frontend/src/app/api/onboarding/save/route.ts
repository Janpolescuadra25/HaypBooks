import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/mock/db'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { step, data } = body

  if (!step || typeof data === 'undefined') return NextResponse.json({ error: 'missing step/data' }, { status: 400 })

  // If a backend API is available, forward the request so onboarding steps persist server-side.
  const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'
  try {
    // Forward cookies to preserve auth
    const cookieHeader = req.headers.get('cookie') || ''
    const backendRes = await fetch(`${BACKEND}/api/onboarding/save`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'cookie': cookieHeader }, body: JSON.stringify({ step, data }) })
    if (backendRes && backendRes.ok) {
      const json = await backendRes.json().catch(() => null)
      return NextResponse.json(json || { success: true, saved: { step } }, { status: backendRes.status })
    }
  } catch (e) {
    // If proxy fails, fall back to local mock storage
    console.warn('Proxy to backend failed for /api/onboarding/save; falling back to local mock', e?.message || e)
  }

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
  // Try to proxy reads to backend first so saved progress is accurate
  const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const backendRes = await fetch(`${BACKEND}/api/onboarding/save`, { method: 'GET', headers: { 'cookie': cookieHeader } })
    if (backendRes && backendRes.ok) {
      const json = await backendRes.json().catch(() => null)
      return NextResponse.json(json || { steps: {} }, { status: backendRes.status })
    }
  } catch (e) {
    console.warn('Proxy to backend failed for GET /api/onboarding/save; falling back to local mock', e?.message || e)
  }

  const userId = cookies().get('userId')?.value || 'u_1'
  const snapshot = (db as any).onboardingDrafts?.[userId] || {}
  return NextResponse.json({ steps: snapshot })
}
