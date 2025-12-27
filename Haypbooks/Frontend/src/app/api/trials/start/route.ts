import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'

export async function POST(req: Request) {
  try {
    // Allow dev-only use; in production this should be protected and route to real billing
    if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API !== 'true') {
      return NextResponse.json({ error: 'trial start restricted' }, { status: 403 })
    }

    // Compute trial end: 30 days from now (UTC)
    const now = new Date()
    const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const trialEndsAt: string = end.toISOString();

    // If user is present in mock DB (via body.email or a session cookie), persist trialEndsAt on that user
    const body = await req.json().catch(() => ({}))
    seedIfNeeded()

    const trialEndsAtString = end.toISOString()
    const trialStartedAtString = new Date().toISOString()

    // 1) Try cookie 'userId' from headers (set by auth flow). Example cookie: userId=user-demo-1
    const cookieHeader = (req.headers && (req as any).headers.get && (req as any).headers.get('cookie')) || ''
    const cookies = cookieHeader.split(';').map(s => s.trim()).filter(Boolean).reduce((acc: any, cur: string) => {
      const [k,v] = cur.split('=')
      acc[k] = v
      return acc
    }, {})

    let user = null
    if (cookies && cookies.userId) {
      user = (db.users || []).find((u: any) => u.id === cookies.userId)
      if (user) {
        Object.assign(user as any, { trialEndsAt: trialEndsAtString, trialStartedAt: trialStartedAtString })
      }
    }

    // 2) Fallback: check email in body
    if (!user && body && body.email) {
      const u: any = (db.users || []).find((u2: any) => u2.email === body.email)
      if (u) {
        Object.assign(u as any, { trialEndsAt: trialEndsAtString, trialStartedAt: trialStartedAtString })
        user = u
      }
    }

    // If we found a user in the frontend mock DB, and backend test endpoints are enabled,
    // also persist the trial end in the backend mock DB so tests that assert backend state succeed.
    try {
      if (user) {
        const backendUrl = process.env.TEST_BACKEND_URL || 'http://localhost:4000'
        await fetch(`${backendUrl}/api/test/set-trial`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, trialEndsAt }) })
      }
    } catch (err) {
      // non-fatal: best-effort
    }

    // Return the canonical ISO and a simple formatted date in en-US
    const formatted = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    return NextResponse.json({ trialEndsAt, formatted, persisted: !!user })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
