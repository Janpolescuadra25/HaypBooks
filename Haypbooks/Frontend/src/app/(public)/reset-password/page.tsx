"use client"
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { authService } from '@/services/auth.service'

export default function ResetPasswordPage() {
  const search = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [otp, setOtp] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const t = search?.get('token') || null
    const e = search?.get('email') || null
    const otp = search?.get('otp') || null
    setToken(t)
    if (e) setEmail(e)
    if (otp) setOtp(otp)
  }, [search])

  function onResetSuccess() {
    setSuccess(true)
  }

  // router already declared above
  useEffect(() => {
    try {
      // If user is already signed-in and there is no token/email/otp in the
      // query, there's no reason to remain on the reset page. Allow token or
      // email+otp flows to proceed even when local user exists (e.g. odd dev
      // cases) so that valid flows aren't blocked.
      const hasResetParams = !!(token || email || otp)
      if (authService.isAuthenticated() && !hasResetParams) router.replace('/')
    } catch {}
  }, [router, token, email, otp])

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Password reset successful</h2>
          <p className="text-sm text-slate-600 mb-4">You can now sign in with your new password.</p>
          <div className="flex gap-2 justify-center">
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => router.push('/login')}>Sign in</button>
            <button className="px-4 py-2 rounded border" onClick={() => router.push('/')}>Back to home</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset password</h1>
          <p className="text-gray-600 text-sm">Provide a new password for your account.</p>
        </div>

        <div>
          <ResetPasswordForm token={token} email={email ?? undefined} otp={otp ?? undefined} onSuccess={onResetSuccess} />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">← Back to sign in</a>
        </div>
      </div>
    </div>
  )
}
