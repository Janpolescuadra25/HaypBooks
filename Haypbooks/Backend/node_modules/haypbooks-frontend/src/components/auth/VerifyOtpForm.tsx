"use client"
import React, { useEffect, useState } from 'react'
import OtpInput from './OtpInput'
import { authService } from '@/services/auth.service'
import { useRouter } from 'next/navigation'
import { normalizePhoneOrThrow, maskPhoneForDisplay } from '@/utils/phone.util'

function maskEmail(email?: string | null) {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!local) return email
  if (local.length <= 2) return `*@${domain}`
  return `${local[0]}${'*'.repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}@${domain}`
}

function maskPhone(phone?: string | null) {
  if (!phone) return ''
  try {
    const normalized = normalizePhoneOrThrow(phone)
    return maskPhoneForDisplay(normalized)
  } catch (e) {
    const last = String(phone).slice(-4)
    return `***${last}`
  }
}

type Props = {
  email?: string
  phone?: string
  flow?: 'signup' | 'reset' | string
  role?: 'business' | 'accountant' | string
  initialCode?: string
  signupToken?: string
  initialMethod?: 'email'|'phone'
  showHeader?: boolean
}

export default function VerifyOtpForm({ email, phone, flow = 'reset', role, initialCode = '', signupToken, initialMethod, showHeader = true }: Props) {
  const router = useRouter()
  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState<number>(0)
  const [signupMethod, setSignupMethod] = useState<'email'|'phone'>(() => {
    // Allow an explicit initialMethod prop to override defaults (used for signup flows)
    if ((initialMethod as any) === 'email' || (initialMethod as any) === 'phone') return initialMethod as any
    // If both are present during signup, verify email first, then phone.
    if (email && phone) return 'email'
    if (phone) return 'phone'
    return 'email'
  })

  useEffect(() => {
    if (initialCode) setCode(initialCode)
    const t = setInterval(() => setResendTimer(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [initialCode])

  async function handleVerify() {
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      let res
      if (signupToken && flow === 'signup') {
        // Complete the pending signup; server creates the user on success
        res = await authService.completeSignup(signupToken, code, signupMethod as any)
        // Backend returns token+user only when ALL required verification steps are completed
        if (res && (res as any).token) {
          // Navigate into onboarding same as previously
          if (role === 'accountant') router.push('/onboarding/accountant')
          else if (role === 'business') router.push('/get-started/plans')
          else router.push('/signup/choose-role')
          return
        }

        // Partial progress (e.g. email verified, still need phone)
        const nextMethod = (res as any)?.nextMethod as ('email'|'phone'|undefined)
        if (nextMethod) {
          setSignupMethod(nextMethod)
          setCode('')
          setResendTimer(0)
          setInfo(nextMethod === 'phone'
            ? 'Email confirmed. Now enter the code sent to your phone.'
            : 'Phone confirmed. Now enter the code sent to your email.'
          )
          return
        }

        setError('Verification incomplete. Please try again.')
        return
      } else if (phone) {
        // verify by phone
        const verification = require('@/services/verification.service').default
        res = await verification.prototype.verifyPhoneCode(phone, code)
      } else {
        res = await authService.verifyOtp(email || '', code)
      }

      if (res && (res as any).success) {
        // Handle redirect internally to avoid passing event handlers across
        // server/client boundaries. This keeps props serializable.
        if (flow === 'signup') {
          // If role hint is present, forward into the appropriate flow
          if (role === 'accountant') router.push('/onboarding/accountant')
          else if (role === 'business') router.push('/get-started/plans')
          else router.push('/signup/choose-role')
        } else if (flow === 'reset') {
          router.push(`/reset-password?email=${encodeURIComponent(email || '')}&otp=${encodeURIComponent(code)}`)
        } else router.push('/')
      } else setError('Code invalid or expired')
    } catch (e: any) {
      // Prefer a clear message when the API client surfaces routing misconfig errors
      setError(e?.message || e?.response?.data?.message || 'Verification failed')
    } finally { setLoading(false) }
  }

  async function handleResend() {
    if (resendTimer > 0) return
    try {
      // During signup, always resend email (we force email-first signup verify)
      if (flow === 'signup' && email) {
        const resp = await authService.sendVerification(email || '')
        const devOtp = (resp as any)?.otp
        if (devOtp) setCode(devOtp)
      } else if (phone) {
        const verification = require('@/services/verification.service').default
        const resp = await verification.prototype.sendPhoneCode(phone)
        const devOtp = (resp as any)?.otp
        if (devOtp) setCode(devOtp)
      } else {
        const resp = await authService.sendVerification(email || '')
        const devOtp = (resp as any)?.otp
        if (devOtp) setCode(devOtp)
      }
      setResendTimer(30)
    } catch (e) {
      setError('Unable to resend code')
    }
  }

  return (
    <div className="text-center">
        {showHeader && (
        <>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-lg mb-4 shadow-md mx-auto">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold mb-2">Confirm your account</h2>
          <p className="text-sm text-slate-600 mb-4">Almost there! Enter the 6-digit code we sent to confirm it's you and finish setting up your account.</p>
        </>
      )}

      <div className="text-sm font-medium text-slate-800">Sent to <strong className="text-slate-800">{
        (flow === 'signup' && email)
          ? maskEmail(email)
          : (phone ? maskPhone(phone) : maskEmail(email))
      }</strong></div>
      <div className="text-xs text-slate-400 mb-6 mt-2">The code expires in 5 minutes.</div>

      {info && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm mb-3 max-w-md mx-auto">
          {info}
        </div>
      )}

      <div className="mb-6">
        <div className="overflow-visible">
          <OtpInput value={code} onChange={setCode} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-3 animate-shake flex items-start gap-2 max-w-md mx-auto">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 max-w-md mx-auto">
        <button disabled={loading || !/^\d{6}$/.test(code)} onClick={handleVerify} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {loading ? 'Verifying…' : 'Continue'}
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 text-sm">
        <button disabled={resendTimer > 0} onClick={handleResend} className="text-emerald-600 hover:underline disabled:opacity-50">{resendTimer > 0 ? `Resend code (available in ${resendTimer}s)` : 'Resend code'}</button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  )
}
