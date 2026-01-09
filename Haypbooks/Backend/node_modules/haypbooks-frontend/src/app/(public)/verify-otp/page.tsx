"use client"
"use client"
import { useEffect, useState } from 'react'
import { authService } from '@/services/auth.service'
import { useSearchParams, useRouter } from 'next/navigation'
import VerifyOtpForm from '@/components/auth/VerifyOtpForm'
import VerificationMethodCard from '@/components/auth/VerificationMethodCard'
import VerificationService from '@/services/verification.service'
import AuthLayout from '@/components/auth/AuthLayout'

function maskEmail(email: string | null) {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!local) return email
  if (local.length <= 2) return `*@${domain}`
  return `${local[0]}${'*'.repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}@${domain}`
}

import { maskPhoneForDisplay, normalizePhoneOrThrow } from '@/utils/phone.util'

function maskPhone(phone: string | null) {
  if (!phone) return ''
  try {
    // Try to normalize and use the canonical mask formatter
    const normalized = normalizePhoneOrThrow(phone)
    return maskPhoneForDisplay(normalized)
  } catch (e) {
    // Fallback: show mask with last 4 digits
    const last = phone.slice(-4)
    return `***${last}`
  }
}

export default function VerifyOtpPage() {
  const search = useSearchParams()
  const router = useRouter()
  const email = search?.get('email') || ''
  const phone = search?.get('phone') || ''
  // Only set flow if present — don't default to 'reset' so the guard can
  // detect whether this page is being used as part of a flow.
  const flow = search?.get('flow') || undefined // 'signup' | 'reset' | undefined
  const role = search?.get('role') || undefined // 'business' | 'accountant' | undefined

  const initialCode = search?.get('code') || search?.get('otp') || ''
  const method = search?.get('method') || undefined // 'email' | 'phone'
  const signupToken = search?.get('signupToken') || undefined // for pre-signup flows

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneInputCountry, setPhoneInputCountry] = useState('PH')
  const [serverPhone, setServerPhone] = useState('')
  const effectivePhone = serverPhone || phone
  // During signup with an active signupToken, default to email verification and auto-send
  const [selectedMethod, setSelectedMethod] = useState<'email'|'phone'|undefined>(() => {
    if (flow === 'signup' && signupToken) return 'email'
    return (flow === 'signup' && !method) ? 'email' : undefined
  })
  const [autoSent, setAutoSent] = useState(false)

  useEffect(() => {
    // Auto-send email when arriving to signup verify page with a signupToken and no explicit method/code
    if (flow === 'signup' && signupToken && !method && !initialCode && !autoSent) {
      setAutoSent(true)
      requestMethodSend('email').catch(() => setAutoSent(false))
    }
  }, [flow, method, initialCode, autoSent, signupToken])

  useEffect(() => {
    // If user is already signed in *and* this page is not being used as
    // part of an explicit flow (signup or reset with a code), redirect
    // them into the app. Allow flows with explicit params (flow or code)
    // so users can verify during signup/reset even in edge cases.
    try {
      if (authService.isAuthenticated && authService.isAuthenticated() && !flow && !initialCode) {
        router.replace('/')
        return
      }

      // If user is signed in and we don't have a phone in the query params,
      // fetch their current user and pre-populate phone if available so the
      // verification UI shows the SMS option by default.
      if (authService.isAuthenticated && authService.isAuthenticated() && !phone) {
        authService.getCurrentUser().then(u => {
          const p = (u as any)?.phone
          if (p) setServerPhone(p)
        }).catch(() => {})
      }
    } catch {}
  }, [router, flow, initialCode])

  useEffect(() => {
    // If this is a signup flow and no method or code has been provided yet,
    // auto-send an email verification and show the OTP input directly.
    if (flow === 'signup' && !method && !initialCode && !autoSent) {
      setAutoSent(true)
      setSelectedMethod('email')
      requestMethodSend('email').catch(() => setAutoSent(false))
    }
  }, [flow, method, initialCode, autoSent, signupToken])

  async function requestMethodSend(chosen: 'email'|'phone', phoneOverride?: string) {
    setError(null)
    setSending(true)
    try {
      const svc = new VerificationService()
      let resp: any
      if (chosen === 'email') {
        resp = await svc.sendEmailCode(email)
      } else {
        const toPhone = phoneOverride || effectivePhone
        if (!toPhone) throw new Error('Phone number required')
        // If a manual phone override was provided, use the selected country to help normalization
        const normalized = phoneOverride ? normalizePhoneOrThrow(toPhone, phoneInputCountry) : normalizePhoneOrThrow(toPhone)
        resp = await svc.sendPhoneCode(normalized)
      }
      const devOtp = resp?.otp
      const methodParam = `&method=${encodeURIComponent(chosen)}`
      const phoneParam = (phoneOverride || phone) ? `&phone=${encodeURIComponent(phoneOverride || phone)}` : ''
      const codeParam = devOtp ? `&code=${encodeURIComponent(devOtp)}` : ''
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&flow=${encodeURIComponent(flow || '')}${methodParam}${phoneParam}${codeParam}${role ? `&role=${encodeURIComponent(role)}` : ''}`)
    } catch (e: any) {
      setError(e?.message || 'Unable to send verification')
      setSending(false)
    }
  }

  return (
    <AuthLayout innerClassName="max-w-sm w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 relative z-10 animate-slide-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-3 shadow-lg animate-scale-in">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">{flow === 'signin' ? 'Confirm Your Identity' : 'Confirm your account'}</h1>
          {flow === 'signin' ? (
            <p className="text-sm text-slate-600 mb-4">Choose how you'd like to verify it's you</p>
          ) : flow === 'reset' ? (
            <p className="text-sm text-slate-600 mb-4">We’ve emailed you a 6-digit code. Enter it here to continue resetting your account.</p>
          ) : (
            <p className="text-sm text-slate-600 mb-4">Almost there! Enter the 6-digit code we sent to confirm it's you and finish setting up your account.</p>
          )}

          {/* For sign-in flows and non-signup selection flows show the card-style selection (Email / Phone) */}
          {flow !== 'signup' && !method && !signupToken && !initialCode && (flow === 'signin' || !email) ? (
            <div className="mt-4">
              <div className="space-y-4 text-left">
                <VerificationMethodCard
                  data-testid="verif-email-card"
                  title="Email Code"
                  subtitle={`Send a verification code to your email${email ? ` — ${maskEmail(email)}` : ''}`}
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                  onClick={() => requestMethodSend('email')}
                />

                {effectivePhone ? (
                  <VerificationMethodCard
                    data-testid="verif-phone-card"
                    title="Phone Code (SMS)"
                    subtitle={`Send a verification code to your phone${effectivePhone ? ` — ${maskPhone(effectivePhone)}` : ''}`}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6.5C4 4.29 6.24 2.5 9 2.5h6c2.76 0 5 1.79 5 4.01v6.99c0 2.22-2.24 4.01-5 4.01H11.5L8 21v-3.5H9c-2.76 0-5-1.79-5-4.01V6.5z"/><circle cx="9.5" cy="11" r="0.9" fill="currentColor" /></svg>}
                    onClick={() => requestMethodSend('phone')}
                  />
                ) : (
                  <div className="p-3 border rounded-xl">
                    <div className="font-medium mb-1">Text messages (SMS)</div>
                    <div className="text-sm text-slate-500 mb-3">Verification code will be sent to the phone number you enter below.</div>
                    <div className="flex gap-2 items-stretch">
                      <select value={phoneInputCountry} onChange={(e) => setPhoneInputCountry(e.target.value)} className="w-20 h-10 px-2 pr-6 py-2 border border-slate-700 rounded-l-md bg-white text-sm text-slate-900 text-left" title={phoneInputCountry === 'PH' ? '+63 Philippines' : phoneInputCountry === 'US' ? '+1 United States' : phoneInputCountry === 'GB' ? '+44 United Kingdom' : phoneInputCountry === 'AU' ? '+61 Australia' : phoneInputCountry === 'IN' ? '+91 India' : '+65 Singapore'}>
                      <option value="PH" title="+63 Philippines">+63</option>
                      <option value="US" title="+1 United States">+1</option>
                      <option value="GB" title="+44 United Kingdom">+44</option>
                      <option value="AU" title="+61 Australia">+61</option>
                      <option value="IN" title="+91 India">+91</option>
                      <option value="SG" title="+65 Singapore">+65</option>
                      </select>
                      <input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder="0916 123 4567" className="flex-1 min-w-0 h-10 px-3 py-2 border border-slate-700 rounded-r-md placeholder-slate-400 text-sm text-slate-900 bg-white" />
                      <button onClick={() => requestMethodSend('phone', phoneInput)} disabled={sending} className="px-3 py-2 bg-emerald-600 text-white rounded-md">Send</button>
                    </div>
                  </div>
                )}

                {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
              </div>

              {flow === 'signin' ? (
                <div className="mt-4 text-center">
                  <button onClick={() => router.push('/login?showLogin=1')} className="text-sm text-red-600 hover:underline">Cancel verification</button>
                </div>
              ) : null}
            </div>
          ) : null
          }
        </div> 

        <div className="mb-4">
          {(method || flow === 'signup') && (
            <VerifyOtpForm email={email} phone={phone} flow={flow as any} role={role} initialCode={initialCode} signupToken={signupToken} initialMethod={selectedMethod} showHeader={false} />
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <button onClick={() => router.push(flow === 'signup' ? '/signup' : '/login?showLogin=1')} className="text-sm text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Sign up
          </button>
        </div>
      </AuthLayout>
  )
}
