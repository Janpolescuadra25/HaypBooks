"use client"
import React, { useEffect, useState } from 'react'
import OtpInput from './OtpInput'
import { authService } from '@/services/auth.service'
import { useRouter } from 'next/navigation'

type Props = {
  email?: string
  phone?: string
  flow?: 'signup' | 'reset' | string
  role?: 'business' | 'accountant' | string
  initialCode?: string
}

export default function VerifyOtpForm({ email, phone, flow = 'reset', role, initialCode = '' }: Props) {
  const router = useRouter()
  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState<number>(0)

  useEffect(() => {
    if (initialCode) setCode(initialCode)
    const t = setInterval(() => setResendTimer(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [initialCode])

  async function handleVerify() {
    setLoading(true)
    setError(null)
    try {
      let res
      if (phone) {
        // verify by phone
        const verification = require('@/services/verification.service').default
        res = await verification.prototype.verifyPhoneCode(phone, code)
      } else {
        res = await authService.verifyOtp(email || '', code)
      }
      if (res.success) {
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
      if (phone) {
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
    <div>
      <div className="mb-4">
        <OtpInput value={code} onChange={setCode} />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-3 animate-shake flex items-start gap-2">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      <div className="flex gap-2">
        <button disabled={loading || !/^\d{6}$/.test(code)} onClick={handleVerify} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98]">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying…
            </span>
          ) : 'Verify OTP'}
        </button>
        <button disabled={resendTimer > 0} onClick={handleResend} className="px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {resendTimer > 0 ? `Resend Code (available in ${resendTimer}s)` : 'Resend Code'}
        </button>
      </div>

      <div className="mt-3 text-sm text-slate-600">
        <p className="mb-1">• The OTP is valid for <strong>5 minutes</strong>.</p>
        <p className="mb-1">• Do not share your code with anyone.</p>
        <p className="mt-2 text-sm text-slate-500">📩 <em>Didn’t receive the code?</em> Check your spam folder or try <strong>Resend Code</strong>.</p>
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
