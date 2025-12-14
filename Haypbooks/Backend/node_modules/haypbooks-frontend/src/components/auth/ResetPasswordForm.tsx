"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/auth.service'

type Props = {
  token?: string | null
  email?: string | null
  otp?: string | null
  onSuccess?: () => void
}

export default function ResetPasswordForm({ token, email, otp, onSuccess }: Props) {
  const schema = z.object({
    email: z.string().email().optional(),
    otp: z.string().regex(/^[0-9]{6}$/).optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string().min(1)
  }).refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' })

  type ResetSchema = z.infer<typeof schema>
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ResetSchema>({ resolver: zodResolver(schema), defaultValues: { email: email ?? '', otp: otp ?? '' } })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(values: any) {
    setError(null)
    try {
      if (token) {
        await authService.resetPassword(token, values.password)
      } else {
        await authService.resetPassword(values.email, values.password, values.otp)
      }
      setSuccess(true)
      onSuccess?.()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Reset failed')
    }
  }

  if (success) return (
    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded text-sm text-center">Password reset successful — you can now sign in</div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {!token && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input {...register('email')} id="email" type="email" className="w-full px-4 py-3 border rounded-lg" />
          {errors.email && <p className="text-sm text-red-600 mt-1">{String(errors.email?.message)}</p>}

          <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">Reset code</label>
          <input {...register('otp')} id="otp" className="w-full px-4 py-3 border rounded-lg" />
          {errors.otp && <p className="text-sm text-red-600 mt-1">{String(errors.otp?.message)}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
        <input {...register('password')} id="password" type="password" className="w-full px-4 py-3 border rounded-lg" />
        {errors.password && <p className="text-sm text-red-600 mt-1">{String(errors.password?.message)}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
        <input {...register('confirm')} id="confirm" type="password" className="w-full px-4 py-3 border rounded-lg" />
        {errors.confirm && <p className="text-sm text-red-600 mt-1">{String(errors.confirm?.message)}</p>}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">{error}</div>}

      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700" disabled={isSubmitting}>{isSubmitting ? 'Resetting…' : 'Reset password'}</button>
    </form>
  )
}
