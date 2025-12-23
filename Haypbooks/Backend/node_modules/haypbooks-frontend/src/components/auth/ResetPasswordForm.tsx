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
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/(?=.*[A-Z])(?=.*\d)/, 'Include an uppercase letter and a number'),
    confirm: z.string().min(1)
  }).refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' })

  type ResetSchema = z.infer<typeof schema>
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<ResetSchema>({ resolver: zodResolver(schema), defaultValues: { email: email ?? '', otp: otp ?? '' } })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const passwordValue = watch('password')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordStrength = (password: string) => {
    if (!password || password.length === 0) return { strength: 0, label: '', color: '' }
    if (password.length < 8) return { strength: 1, label: 'Weak', color: 'bg-red-500' }
    if (password.length < 12) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { strength: 2, label: 'Fair', color: 'bg-yellow-500' }
    }
    return { strength: 3, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = passwordStrength(passwordValue || '')

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
    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm text-center animate-slide-down flex items-start gap-2">
      <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Password reset successful — you can now sign in</span>
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {!token && (
        <>
          {/* Hidden fields - values come from URL parameters */}
          <input {...register('email')} id="email" type="hidden" />
          <input {...register('otp')} id="otp" type="hidden" />
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">New password</label>
        <div className="relative">
          <input {...register('password')} id="password" type={showPassword ? "text" : "password"} className="w-full px-4 py-3 pr-11 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50 hover:bg-white" placeholder="Create a strong password" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {passwordValue && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: (strength.strength / 3) * 100 + '%' }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{strength.label}</span>
            </div>
            <p className="text-xs text-gray-500">
              Use at least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>
        )}
        {errors.password && <p className="text-sm text-red-600 mt-1 animate-shake">{String(errors.password?.message)}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm password</label>
        <div className="relative">
          <input {...register('confirm')} id="confirm" type={showConfirmPassword ? "text" : "password"} className="w-full px-4 py-3 pr-11 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50 hover:bg-white" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showConfirmPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.confirm && <p className="text-sm text-red-600 mt-1 animate-shake">{String(errors.confirm?.message)}</p>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-slide-down flex items-start gap-2">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98]" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Resetting…
          </span>
        ) : 'Reset password'}
      </button>

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-slide-down { animation: slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </form>
  )
}
