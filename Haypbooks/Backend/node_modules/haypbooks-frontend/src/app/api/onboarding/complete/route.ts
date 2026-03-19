import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Attempt to proxy to backend so onboarding completion will create tenant/company server-side
  const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const body = await req.text()
    const backendRes = await fetch(`${BACKEND}/api/onboarding/complete`, {
      method: 'POST',
      headers: { 'cookie': cookieHeader, 'content-type': 'application/json' },
      body,
    })
    const json = await backendRes.json().catch(() => null)
    const res = NextResponse.json(json || { success: backendRes.ok }, { status: backendRes.status })
    if (backendRes.ok) {
      // Only set the onboarding complete cookie when the backend confirms success
      try { res.cookies.set('onboardingComplete', 'true', { path: '/' }) } catch (e) { /* ignore */ }
    }
    return res
  } catch (e) {
    console.warn('Proxy to backend failed for /api/onboarding/complete', e?.message || e)
    // Do NOT set onboardingComplete cookie here — the backend did not confirm success.
    // Return a 502 so the frontend can show a "try again" error instead of skipping onboarding.
    return NextResponse.json({ success: false, error: 'Backend unavailable. Please try again.' }, { status: 502 })
  }
}

export async function GET() {
  const res = NextResponse.json({ status: 'ok' })
  return res
}
