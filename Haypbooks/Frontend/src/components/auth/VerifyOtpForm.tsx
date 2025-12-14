"use client"
import React, { useEffect, useState } from 'react'
import OtpInput from './OtpInput'
import { authService } from '@/services/auth.service'

type Props = {
  email: string
  flow?: 'signup' | 'reset' | string
  initialCode?: string
  onVerified?: (success: boolean) => void
}

export default function VerifyOtpForm({ email, flow = 'reset', initialCode = '', onVerified }: Props) {
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
      const res = await authService.verifyOtp(email, code)
      if (res.success) onVerified?.(true)
      else setError('Code invalid or expired')
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Verification failed')
    } finally { setLoading(false) }
  }

  async function handleResend() {
    if (resendTimer > 0) return
    try {
      const resp = await authService.forgotPassword(email)
      const devOtp = (resp as any)?.otp
      if (devOtp) setCode(devOtp)
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
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm mb-3">{error}</div>}
      <div className="flex gap-2">
        <button disabled={loading || !/^\d{6}$/.test(code)} onClick={handleVerify} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50">{loading ? 'Verifying…' : 'Verify code'}</button>
        <button disabled={resendTimer > 0} onClick={handleResend} className="px-4 py-3 rounded-lg border text-sm disabled:opacity-50">{resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}</button>
      </div>
    </div>
  )
}
