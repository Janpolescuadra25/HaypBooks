import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that do not require auth
// Keep general public assets and landing; specific auth pages are handled below to
// allow redirecting authenticated users away from auth pages when appropriate.
const PUBLIC_PATHS = [
  '/landing',
  '/_next',
  '/favicon.ico',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Remove deprecated dedicated print routes by stripping the '/print' segment
  if (pathname.includes('/print')) {
    const parts = pathname.split('/').filter(Boolean)
    const filtered = parts.filter((p) => p !== 'print')
    const cleanedPath = '/' + filtered.join('/')
    const url = req.nextUrl.clone()
    url.pathname = cleanedPath || '/'
    return NextResponse.redirect(url)
  }

  // Allow public assets and pages
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check for authToken instead of token (we now use localStorage, not cookies)
  // For middleware, we'll check the cookie that the backend sets
  const token = req.cookies.get('authToken')?.value || req.cookies.get('token')?.value

  // Root path handling
  // Read onboarding status early so we can redirect authenticated-but-unfinished users
  const onboardingComplete = req.cookies.get('onboardingComplete')?.value

  if (pathname === '/') {
    if (!token) {
      // Redirect to landing page for unauthenticated users
      return NextResponse.redirect(new URL('/landing', req.url))
    }
    // If authenticated but onboarding not finished, send to the main onboarding flow
    if (token && onboardingComplete !== 'true') {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
    // Otherwise, go to Central Hub (hub page outside the core app)
    return NextResponse.redirect(new URL('/hub/companies', req.url))
  }

  // Special handling for onboarding - allow if authenticated
  if (pathname.startsWith('/onboarding')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?next=' + pathname, req.url))
    }
    return NextResponse.next()
  }

  // onboardingComplete already read higher up

  // If no token, redirect to /login
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // If user already authenticated, avoid letting them visit auth pages directly
  const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/verify-otp', '/reset-password']
  if (token && AUTH_PAGES.some(p => pathname.startsWith(p))) {
    // Allow `/login?loggedOut=1` or `/login?showLogin=1` so a just-logged-out user or
    // someone intentionally requesting the sign-in form can see the page even if a cookie
    // still lingers due to a race or slow Set-Cookie processing.
    try {
      const loggedOut = req.nextUrl.searchParams.get('loggedOut')
      const showLogin = req.nextUrl.searchParams.get('showLogin')
      if (pathname.startsWith('/login') && (loggedOut === '1' || showLogin === '1')) {
        return NextResponse.next()
      }
    } catch (e) {
      // ignore and fall through to redirect
    }
    return NextResponse.redirect(new URL('/companies', req.url))
  }

  // Allow opt-out for CI/tests/dev if explicitly requested
  if (process.env.NEXT_PUBLIC_SKIP_ONBOARDING === 'true') {
    return NextResponse.next()
  }

  // If we have a token but onboarding has not been completed, redirect to onboarding
  // Only enforce when the user is not already on an onboarding route.
  if (token && onboardingComplete !== 'true') {
    // Allow the onboarding pages and onboarding APIs
    if (!pathname.startsWith('/onboarding') && !pathname.startsWith('/api/onboarding')) {
      const url = req.nextUrl.clone()
        // Redirect users into the main onboarding flow as the first required step
        // Use the full onboarding path by default so the lifecycle is: login -> onboarding -> app
        url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  // Protect accountant routes: only users with isAccountant cookie === 'true' may visit
  if (pathname.startsWith('/accountant')) {
    const isAccountant = req.cookies.get('isAccountant')?.value
    if (isAccountant !== 'true') {
      return NextResponse.redirect(new URL('/companies', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
  '/',
  // Exclude all API routes and Next assets; protect all other pages
  '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
}
