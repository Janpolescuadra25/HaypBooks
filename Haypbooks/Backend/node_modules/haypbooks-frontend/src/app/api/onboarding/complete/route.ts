import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true })
  // Set a cookie to mark onboarding as complete for the user
  // Cookie is readable in middleware and client-side.
  res.cookies.set('onboardingComplete', 'true', { path: '/' })
  return res
}

export async function GET() {
  const res = NextResponse.json({ status: 'ok' })
  return res
}
