"use client"

"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmailCodeForm from '@/components/auth/EmailCodeForm'
import PhoneCodeForm from '@/components/auth/PhoneCodeForm'
import AddPhoneForm from '@/components/auth/AddPhoneForm'
import AuthLayout from '@/components/auth/AuthLayout' 
import { maskPhoneForDisplay } from '@/utils/phone.util'
import { authService } from '@/services/auth.service'

function maskEmail(email: string | null) {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!local) return email
  if (local.length <= 2) return `*@${domain}`
  return `${local[0]}${'*'.repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}@${domain}`
}

export default function VerificationPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userPhone, setUserPhone] = useState<string | null>(null)
  const [view, setView] = useState<'options'|'email'|'phone'>('options')
  const [emailFlowPurpose, setEmailFlowPurpose] = useState<'login'|'reset'>('login')
  // Non-blocking developer hint when session cookies may not be attaching (e.g. localhost vs 127.0.0.1)
  const [cookieHint, setCookieHint] = useState<string | null>(null)

  useEffect(() => {
    // Load user info to pre-fill email from query and show helpful cookie hint
    (async () => {
      try {
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
        const emailFromQuery = params?.get('email') || null
        setUserEmail(emailFromQuery)

        // If we arrived from sign-in, show a short contextual banner so user understands why
        // they were taken here automatically.
        const from = params?.get('from') || null
        if (from === 'signin') {
          setCookieHint('You were redirected here after signing in. Choose Email or Text Message (SMS) to receive your verification code.')
        }

        // Developer hint: some browsers don't expose httpOnly auth cookies via document.cookie.
        // Instead, do a small authenticated probe to /api/users/me to check whether cookies are
        // being sent; if the probe returns 401 and we're on `localhost` suggest opening 127.0.0.1
        // which often fixes cookie scoping for local dev. IMPORTANT: this is a non-blocking
        // informational hint only and does not interfere with normal auth flows.
        try {
          if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            fetch('/api/users/me', { method: 'GET', credentials: 'include', cache: 'no-store' })
              .then((r) => {
                if (r.status === 401) {
                  // eslint-disable-next-line no-console
                  console.info('[verification] Probe returned 401 – session cookies may not be attaching for this host; try http://127.0.0.1:3000')
                  setCookieHint('Session cookies may not be attaching for this host; try opening the site at http://127.0.0.1:3000')
                }
              })
              .catch(() => { /* ignore probe errors */ })
          }
        } catch (e) { /* ignore */ }

        const user = await authService.getCurrentUser()
        if (!emailFromQuery) setUserEmail(user.email)
        if ((user as any)?.phone) setUserPhone((user as any).phone)
      } catch (err) {
        // ignore - unauthenticated or other issues, UI degrades gracefully
      }
    })()
  }, [])

  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const onVerified = React.useCallback(() => {
    try {
      // prefer router.replace for testability
      router.replace('/hub/selection')
    } catch (e) {
      try { window.location.href = '/hub/selection' } catch (err) { /* swallow in tests */ }
    }
  }, [router])

  async function handleSwitchAccount() {
    setIsLoggingOut(true)
    try {
      let emailToUse = userEmail
      if (!emailToUse) {
        try {
          const u = await authService.getCurrentUser()
          emailToUse = (u as any)?.email || null
        } catch (e) {
          // ignore - we'll still navigate to login without email
        }
      }

      await authService.logout()
      const q = new URLSearchParams()
      if (emailToUse) q.set('email', emailToUse)
      q.set('loggedOut', '1')
      router.replace(`/login?${q.toString()}`)
    } catch (e) {
      router.replace('/login?loggedOut=1')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <AuthLayout innerClassName="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-3 shadow-md">HB</div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">Let’s verify it’s really you</h2>
          <p className="text-sm text-slate-600">To keep your account secure, choose how you’d like to receive your verification code.</p> 
        </div>

        {/* Hidden state for tests/e2e: exposes current view for deterministic waits */}
        <div data-testid="verification-state" aria-live="polite" className="sr-only">{`view:${view}`}</div>

        {cookieHint ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm mb-4">
            <div>{cookieHint}</div>
            <div className="mt-2 text-sm flex gap-3">
              <button className="text-emerald-600 underline" onClick={() => { window.location.href = `http://127.0.0.1:3000${window.location.pathname}${window.location.search}` }}>Open at 127.0.0.1:3000</button>
              <button className="text-emerald-600 underline" onClick={() => setCookieHint(null)}>Dismiss</button>
            </div>
          </div>
        ) : null}

        {view === 'options' && (
          <form className="space-y-4 flex flex-col items-center max-w-md mx-auto">
            <button type="button" data-testid="option-email" className="option-card flex items-center p-3 md:p-4 w-full border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 transition focus:outline-none mx-auto" onClick={() => { setEmailFlowPurpose('login'); setView('email') }}>
              <div className="flex items-start gap-4 w-full">
                <div className="flex-none w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex flex-col items-start text-left">
                  <div className="font-bold text-lg md:text-lg text-slate-900 leading-tight">Email</div>
                  <div className="text-sm md:text-sm text-slate-600 mt-1 leading-tight">Verification code will be sent to:<br /><span className="font-semibold">{maskEmail(userEmail)}</span></div>
                </div>
              </div>
            </button>

            {/* Always show phone option — if user has no phone, allow adding it */}
            <button type="button" data-testid="option-phone" className="option-card flex items-center p-3 md:p-4 w-full border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 transition focus:outline-none mx-auto" onClick={() => setView('phone')}>
              <div className="flex items-start gap-4 w-full">
                <div className="flex-none w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H8l-5 3V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <circle cx="8.5" cy="11.5" r="0.6" fill="currentColor" />
                    <circle cx="12" cy="11.5" r="0.6" fill="currentColor" />
                    <circle cx="15.5" cy="11.5" r="0.6" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex flex-col items-start text-left">
                  <div className="font-bold text-lg md:text-lg text-slate-900 leading-tight">Text Message (SMS)</div>
                  {userPhone ? (
                    <div className="text-sm md:text-sm text-slate-600 mt-1 leading-tight">Verification code will be sent to:<br /><span className="font-semibold">{maskPhoneForDisplay(userPhone)}</span></div>
                  ) : (
                    <div className="text-sm md:text-sm text-slate-600 mt-1 leading-tight">Add a phone number to receive a verification code</div>
                  )}
                </div>
              </div>
            </button>



            <div className="text-center mt-6">
              <button type="button" className="text-emerald-600 hover:text-emerald-700 font-semibold text-md" onClick={handleSwitchAccount}>{isLoggingOut ? 'Signing out...' : 'Not you? Switch account'}</button>
            </div>
          </form>
        )}

        {view === 'email' && (
          <div>
            <EmailCodeForm email={userEmail || ''} onSuccess={() => { onVerified() }} onBack={() => setView('options')} />
          </div>
        )}

        {view === 'phone' && (
          <div>
            {userPhone ? (
              <PhoneCodeForm phone={userPhone} onSuccess={() => { onVerified() }} onBack={() => setView('options')} />
            ) : (
              <AddPhoneForm onSaved={(p) => { setUserPhone(p); setView('phone') }} onCancel={() => setView('options')} />
            )}
          </div>
        )}

      </AuthLayout>
  )
}
