"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordForm({ onSuccess }: { onSuccess?: (email: string, otp?: string) => void }) {
  const schema = z.object({ email: z.string().email('Invalid email') })
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(values: any) {
    setError(null)
    try {
      const res = await authService.forgotPassword(values.email)
      setSuccess(true)
      const otp = (res as any)?.otp
      if (onSuccess) onSuccess(values.email, otp)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to submit')
    }
  }

  return (
    <div>
      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded text-sm text-center">If that email exists, a reset code has been generated — check your email. (Dev: OTP might be returned in response)</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
            <input id="email" type="email" {...register('email')} required placeholder="name@company.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            {errors.email && <p className="text-sm text-red-600 mt-1">{String(errors.email?.message)}</p>}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">{error}</div>}

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send reset instructions'}</button>
        </form>
      )}
    </div>
  )
}
