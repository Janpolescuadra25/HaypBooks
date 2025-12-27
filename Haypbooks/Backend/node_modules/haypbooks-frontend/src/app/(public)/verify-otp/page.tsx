"use client"
import { useEffect, useState } from 'react'
import { authService } from '@/services/auth.service'
import { useSearchParams, useRouter } from 'next/navigation'
import VerifyOtpForm from '@/components/auth/VerifyOtpForm'
import VerificationService from '@/services/verification.service'
import { normalizePhoneOrThrow } from '@/utils/phone.util'

function maskEmail(email: string | null) {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!local) return email
  if (local.length <= 2) return `*@${domain}`
  return `${local[0]}${'*'.repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}@${domain}`
}

function maskPhone(phone: string | null) {
  if (!phone) return ''
  // Simple mask: show last 2-3 digits only
  const last = phone.slice(-3)
  return `***${last}`
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

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneInput, setPhoneInput] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<'email'|'phone'|undefined>(() => (flow === 'signup' && !method ? 'email' : undefined))

  useEffect(() => {
    try {
      // If user is already signed in *and* this page is not being used as
      // part of an explicit flow (signup or reset with a code), redirect
      // them into the app. Allow flows with explicit params (flow or code)
      // so users can verify during signup/reset even in edge cases.
      if (authService.isAuthenticated() && !flow && !initialCode) {
        router.replace('/')
      }
    } catch {}
  }, [router, flow, initialCode])

  async function requestMethodSend(chosen: 'email'|'phone', phoneOverride?: string) {
    setError(null)
    setSending(true)
    try {
      const svc = new VerificationService()
      let resp: any
      if (chosen === 'email') {
        resp = await svc.sendEmailCode(email)
      } else {
        const toPhone = phoneOverride || phone
        if (!toPhone) throw new Error('Phone number required')
        const normalized = normalizePhoneOrThrow(toPhone)
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative z-10 animate-slide-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg animate-scale-in">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Verify Your Identity</h1>

          {/* If we're in a signup flow and no method has been chosen yet, show a selection UI */}
          {flow === 'signup' && !method ? (
            <div className="mt-4">
              <p className="text-sm text-slate-600 mb-4">Choose how you'd like to receive your verification code:</p>
              <div className="space-y-3 text-left">
                <label className="inline-flex items-start gap-3 p-3 border rounded-xl w-full cursor-pointer">
                  <input type="radio" name="method" value="email" className="mt-1" checked={selectedMethod === 'email'} onChange={() => setSelectedMethod('email')} />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-slate-500">Send to {maskEmail(email)}</div>
                  </div>
                </label>
                <label className="inline-flex items-start gap-3 p-3 border rounded-xl w-full cursor-pointer">
                  <input type="radio" name="method" value="phone" className="mt-1" checked={selectedMethod === 'phone'} onChange={() => setSelectedMethod('phone')} />
                  <div>
                    <div className="font-medium">SMS</div>
                    <div className="text-sm text-slate-500">{phone ? `Send to ${maskPhone(phone)}` : 'Enter a phone number below'}</div>
                  </div>
                </label>

                {!phone && selectedMethod === 'phone' ? (
                  <input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder="Enter phone number" className="w-full px-3 py-2 border rounded-md" />
                ) : null}

                <div className="flex gap-3">
                  <button onClick={() => selectedMethod ? requestMethodSend(selectedMethod, selectedMethod === 'phone' ? phoneInput : undefined) : setError('Choose a method')} disabled={sending} className="px-4 py-2 bg-emerald-600 text-white rounded-md">Continue</button>
                  <button onClick={() => { setSelectedMethod(undefined); setPhoneInput('') }} className="px-4 py-2 border rounded-md">Cancel</button>
                </div>

                {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
              </div>
            </div>
          ) : (
            phone ? (
              <p className="text-sm text-slate-600">We’ve sent a <strong>one-time password (OTP)</strong> to your phone via SMS <strong className="text-emerald-600">{phone}</strong>. Please enter the 6-digit code below to continue.</p>
            ) : (
              <p className="text-sm text-slate-600">We’ve sent a <strong>one-time password (OTP)</strong> to your registered email <strong className="text-emerald-600">{maskEmail(email)}</strong>. Please enter the 6-digit code below to continue.</p>
            )
          )}
        </div> 

        <div className="mb-4">
          {(method || flow !== 'signup') && (
            <VerifyOtpForm email={email} phone={phone} flow={flow as any} role={role} initialCode={initialCode} />
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <a href="/login?showLogin=1" className="text-sm text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign in
          </a>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-30px, 30px) rotate(-5deg); }
          66% { transform: translate(20px, -20px) rotate(5deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.2s; opacity: 0; }
      `}</style>
    </div>
  )
}
