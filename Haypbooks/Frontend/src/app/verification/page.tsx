"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmailCodeForm from '@/components/auth/EmailCodeForm'
import PhoneCodeForm from '@/components/auth/PhoneCodeForm'
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

  function onVerified() {
    // Redirect to hub selection
    window.location.href = '/hub/selection'
  }

  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-lg">HB</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Confirm Your Identity</h2>
          <p className="text-md text-slate-600">Choose a secure way to verify you before continuing.</p>
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
          <form className="space-y-6">
            <label className="option-card flex items-center p-6 border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 transition peer-checked:bg-emerald-50/50 peer-checked:border-emerald-500">
              <input type="radio" name="preferred_method" value="email" defaultChecked={!!userEmail} onChange={() => {/* noop for accessibility: selection handled by form state */}} className="peer form-radio h-6 w-6 text-emerald-600 focus:ring-emerald-500" />
              <div className="ml-5 flex-1">
                <div className="font-bold text-xl text-slate-900">Email</div>
                <div className="text-slate-600 mt-1">Verification code will be sent to:<br /><span className="font-semibold">{maskEmail(userEmail)}</span></div>
              </div>
            </label>

            {userPhone ? (
              <label className="option-card flex items-center p-6 border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 transition peer-checked:bg-emerald-50/50 peer-checked:border-emerald-500">
                <input type="radio" name="preferred_method" value="phone" className="peer form-radio h-6 w-6 text-emerald-600 focus:ring-emerald-500" />
                <div className="ml-5 flex-1">
                  <div className="font-bold text-xl text-slate-900">Text Message (SMS)</div>
                  <div className="text-slate-600 mt-1">Verification code will be sent to:<br /><span className="font-semibold">{maskPhoneForDisplay(userPhone)}</span></div>
                </div>
              </label>
            ) : null}

            <button type="button" onClick={(e) => {
              // Read selected option and navigate
              const sel = (document.querySelector('input[name="preferred_method"]:checked') as HTMLInputElement | null)?.value
              if (sel === 'phone') setView('phone')
              else setEmailFlowPurpose('login') || setView('email')
            }} className="mt-8 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition shadow-xl hover:shadow-2xl">Continue</button>

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

        {view === 'phone' && userPhone && (
          <div>
            <PhoneCodeForm phone={userPhone} onSuccess={() => { onVerified() }} onBack={() => setView('options')} />
          </div>
        )}

      </div>
      <style>{`
        .option-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
      `}</style>
    </div>
  )
}
