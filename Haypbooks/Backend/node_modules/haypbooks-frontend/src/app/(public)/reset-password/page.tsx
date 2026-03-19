"use client"
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { authService } from '@/services/auth.service'
import AuthLayout from '@/components/auth/AuthLayout'

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
      <AuthLayout>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg animate-scale-in">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Password reset successful</h2>
          <p className="text-sm text-slate-600 mb-4">You can now sign in with your new password.</p>
          <div className="flex gap-2 justify-center">
            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" onClick={() => router.push('/login?showLogin=1')}>Sign in</button>
            <button className="px-6 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all" onClick={() => router.push('/landing')}>Back to home</button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset password</h2>
          <p className="text-slate-500">Provide a new password for your account.</p>
        </div>

        <div>
          <ResetPasswordForm token={token} email={email ?? undefined} otp={otp ?? undefined} onSuccess={onResetSuccess} />
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <a href="/login?showLogin=1" className="text-sm text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign in
          </a>
        </div>
      </AuthLayout>
  )
}
