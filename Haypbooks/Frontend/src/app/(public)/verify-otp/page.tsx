"use client"
import { useEffect, useState } from 'react'
import { authService } from '@/services/auth.service'
import { useSearchParams, useRouter } from 'next/navigation'
import VerifyOtpForm from '@/components/auth/VerifyOtpForm'

function maskEmail(email: string | null) {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!local) return email
  if (local.length <= 2) return `*@${domain}`
  return `${local[0]}${'*'.repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}@${domain}`
}

export default function VerifyOtpPage() {
  const search = useSearchParams()
  const router = useRouter()
  const email = search?.get('email') || ''
  // Only set flow if present — don't default to 'reset' so the guard can
  // detect whether this page is being used as part of a flow.
  const flow = search?.get('flow') || undefined // 'signup' | 'reset' | undefined

  const initialCode = search?.get('code') || search?.get('otp') || ''

  function onVerified(success: boolean) {
    if (!success) return
    if (flow === 'signup') router.push('/onboarding')
    else if (flow === 'reset') router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(initialCode)}`)
    else router.push('/')
  }

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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter the 6-digit code</h1>
          <p className="text-sm text-gray-600">We sent a 6-digit code to <strong>{maskEmail(email)}</strong></p>
        </div>

        <div className="mb-4">
          <VerifyOtpForm email={email} flow={flow as any} initialCode={initialCode} onVerified={onVerified} />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">← Back to sign in</a>
        </div>
      </div>
    </div>
  )
}
