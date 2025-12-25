"use client"

import React, { useEffect, useState } from 'react'
import PinEntryForm from '@/components/auth/PinEntryForm'
import PinSetupForm from '@/components/auth/PinSetupForm'
import EmailCodeForm from '@/components/auth/EmailCodeForm'
import { authService } from '@/services/auth.service'

export default function VerificationPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [hasPin, setHasPin] = useState<boolean | null>(null)
  const [view, setView] = useState<'options'|'setup'|'pin'|'email'>('options')

  useEffect(() => {
    // Load user info to determine if PIN exists and pre-fill email from query
    (async () => {
      try {
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
        const emailFromQuery = params?.get('email') || null
        const viewParam = params?.get('view') || null
        setUserEmail(emailFromQuery)

        const user = await authService.getCurrentUser()
        if (!emailFromQuery) setUserEmail(user.email)

        // Respect explicit `view` query param if present (e.g., ?view=setup)
        if (viewParam) {
          setView(viewParam as any)
        }

        // Set `hasPin` based on backend flags if available so we can decide on click
        const hasPinFlag = (user as any)?.hasPin || !!(user as any)?.pinSetAt
        setHasPin(Boolean(hasPinFlag))
        // Note: intentionally DO NOT auto-navigate to the setup view on page load. The UX
        // should show the verification options first and only prompt PIN creation after
        // the user explicitly clicks "Enter Your PIN". This keeps the selection screen
        // as the primary control point for verification flows.
      } catch (err) {
        // ignore - unauthenticated or other issues, UI degrades gracefully
      }
    })()
  }, [])

  async function handleEnterPin() {
    // When user clicks Enter Your PIN, always fetch latest user info to avoid stale flags
    try {
      const user = await authService.getCurrentUser()
      const hasPinFlag = (user as any)?.hasPin || !!(user as any)?.pinSetAt
      // Dev-only debug: log what the client fetched for diagnostics
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('[verification] handleEnterPin fetched user', { id: user.id, email: user.email, hasPin: Boolean(hasPinFlag), pinSetAt: (user as any)?.pinSetAt })
      }
      setHasPin(Boolean(hasPinFlag))
      if (!hasPinFlag) {
        setView('setup')
        return
      }
      setView('pin')
    } catch (e) {
      // Dev: log error to aid e2e debugging
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('[verification] handleEnterPin error', e && (e as any).toString ? (e as any).toString() : e)
      }
      // If we can't determine, default to setup so users can create a PIN
      setView('setup')
    }
  }

  function onPinSetupDone() {
    setView('options')
    setHasPin(true)
  }

  function onVerified() {
    // Redirect to hub selection
    window.location.href = '/hub/selection'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-lg">HB</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Confirm Your Identity</h2>
          <p className="text-md text-slate-600">Choose a secure way to verify it's you before continuing.</p>
        </div>

        {view === 'options' && (
          <div className="space-y-6">
            <button onClick={() => handleEnterPin()} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-6 flex items-center gap-4 hover:border-emerald-400 hover:shadow transition-all">
              <div className="flex-1 text-left">
                <p className="text-xl font-semibold">Enter Your PIN</p>
                <p className="text-sm text-slate-600 mt-1">Quick access using your personal 6-digit PIN</p>
              </div>
              <div className="text-slate-400">→</div>
            </button>

            <button onClick={() => setView('email')} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-6 flex items-center gap-4 hover:border-emerald-400 hover:shadow transition-all">
              <div className="flex-1 text-left">
                <p className="text-xl font-semibold">Send Code to Email</p>
                <p className="text-sm text-slate-600 mt-1">One-time code sent to your email</p>
              </div>
              <div className="text-slate-400">→</div>
            </button>

            <div className="text-center mt-6">
              <button className="text-emerald-600 hover:text-emerald-700 font-semibold text-md" onClick={() => { window.location.href = '/auth/logout' }}>Not you? Switch account</button>
            </div>
          </div>
        )}

        {view === 'setup' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Set Up Your PIN for Faster Login</h3>
            <PinSetupForm onDone={onPinSetupDone} />
          </div>
        )}

        {view === 'pin' && (
          <div>
            <PinEntryForm onSuccess={onVerified} />
            <div className="mt-4 text-sm text-slate-600">Forgot PIN? <button className="text-emerald-600" onClick={() => setView('setup')}>Reset PIN</button></div>
          </div>
        )}

        {view === 'email' && (
          <div>
            <EmailCodeForm email={userEmail || ''} onSuccess={onVerified} />
          </div>
        )}

      </div>
    </div>
  )
}
