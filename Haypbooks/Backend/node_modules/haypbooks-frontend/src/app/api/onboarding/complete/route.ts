import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Attempt to proxy to backend so onboarding completion will create tenant/company server-side
  const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const backendRes = await fetch(`${BACKEND}/api/onboarding/complete`, { method: 'POST', headers: { 'cookie': cookieHeader, 'content-type': 'application/json' }, body: await req.text() })
    if (backendRes && backendRes.ok) {
      const json = await backendRes.json().catch(() => null)
      const res = NextResponse.json(json || { success: true }, { status: backendRes.status })
      // Preserve onboardingComplete cookie if backend set any; otherwise set a local cookie for UI continuity
      try { res.cookies.set('onboardingComplete', 'true', { path: '/' }) } catch (e) { /* ignore */ }
      return res
    }
  } catch (e) {
    console.warn('Proxy to backend failed for /api/onboarding/complete; falling back to local mock', e?.message || e)
  }

  // Fallback mock behavior
  const res = NextResponse.json({ success: true })
  res.cookies.set('onboardingComplete', 'true', { path: '/' })
  return res
}

export async function GET() {
  const res = NextResponse.json({ status: 'ok' })
  return res
}
