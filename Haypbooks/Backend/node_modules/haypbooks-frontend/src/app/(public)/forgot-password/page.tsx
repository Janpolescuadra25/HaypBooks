"use client"
"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { authService } from '@/services/auth.service'
import AuthLayout from '@/components/auth/AuthLayout'

export default function ForgotPasswordPage() {
  const router = useRouter()
  useEffect(() => {
    try {
      if (authService.isAuthenticated()) router.replace('/')
    } catch {}
  }, [router])
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)

  function handleSuccess(e: string, otp?: string) {
    setEmail(e)
    setSuccess(true)
    if (otp) {
      // if server returned OTP in dev, prefill next screen
      window.location.href = `/verify-otp?email=${encodeURIComponent(e)}&flow=reset&code=${encodeURIComponent(otp)}`
    } else {
      window.location.href = `/verify-otp?email=${encodeURIComponent(e)}&flow=reset`
    }
  }

  return (
    <AuthLayout>
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Forgot your password?</h2>
          <p className="text-slate-500">Enter the email associated with your account and we'll send you instructions to reset your password.</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm text-center animate-slide-down flex items-start gap-2">
            <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>If that email exists in our system, a password reset token has been generated (dev: token may be returned in response). Check your email or continue to verification.</span>
          </div>
        ) : (
          <div>
            <ForgotPasswordForm onSuccess={handleSuccess} />
          </div>
        )}

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
