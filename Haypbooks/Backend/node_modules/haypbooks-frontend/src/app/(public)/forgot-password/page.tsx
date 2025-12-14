"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { authService } from '@/services/auth.service'

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
          <p className="text-gray-600 text-sm">Enter the email associated with your account and we'll send you instructions to reset your password.</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded text-sm text-center">
            If that email exists in our system, a password reset token has been generated (dev: token may be returned in response). Check your email or continue to verification.
          </div>
        ) : (
          <div>
            <ForgotPasswordForm onSuccess={handleSuccess} />
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">← Back to sign in</a>
        </div>
      </div>
    </div>
  )
}
