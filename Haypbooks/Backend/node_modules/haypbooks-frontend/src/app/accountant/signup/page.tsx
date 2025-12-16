"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export default function AccountantSignupPage() {
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const checkSession = async () => {
      if (!authService.isAuthenticated()) return
      try {
        await authService.getCurrentUser()
        if (!mounted) return
        router.replace('/')
      } catch (e) {
        if (typeof window !== 'undefined') localStorage.removeItem('user')
      }
    }
    // Prefill preferred role
    if (typeof window !== 'undefined') localStorage.setItem('preferred_role', 'accountant')
    checkSession()
    return () => { mounted = false }
  }, [router])

  const signupSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    firmName: z.string().min(1, 'Firm or company name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/(?=.*[A-Z])(?=.*\d)/, 'Include an uppercase letter and a number'),
    confirmPassword: z.string().min(1)
  }).refine((data) => data.password === data.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] })

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({ resolver: zodResolver(signupSchema) })
  const passwordValue = watch('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const passwordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' }
    if (password.length < 8) return { strength: 1, label: 'Weak', color: 'bg-red-500' }
    if (password.length < 12) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' }
    return { strength: 3, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = passwordStrength(passwordValue || '')

  async function handleFormSubmit(data: any) {
    setError(null)
    setLoading(true)
    try {
      const signupResp = await authService.signup({
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.firmName,
        email: data.email,
        password: data.password,
        role: 'accountant'
      })

      try {
        const sendResp = await authService.sendVerification(data.email)
        const devOtp = (sendResp as any)?.otp || (signupResp as any)?._devOtp
        if (devOtp) {
          location.href = `/verify-otp?email=${encodeURIComponent(data.email)}&flow=signup&code=${encodeURIComponent(devOtp)}`
          return
        }
      } catch (e) {}

      location.href = `/verify-otp?email=${encodeURIComponent(data.email)}&flow=signup`
    } catch (e: any) {
      setError(e.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white relative overflow-hidden">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative z-10 animate-slide-up">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Hayp Accountant — Sign up</h1>
          <p className="text-slate-600">Create your Hayp Accountant account to manage multiple client companies.</p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">First name</label>
              <input {...register('firstName')} className="w-full px-4 py-3 border rounded-xl" placeholder="First" />
              {errors.firstName && <p className="text-sm text-red-600">{String(errors.firstName?.message)}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Last name</label>
              <input {...register('lastName')} className="w-full px-4 py-3 border rounded-xl" placeholder="Last" />
              {errors.lastName && <p className="text-sm text-red-600">{String(errors.lastName?.message)}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Firm or company</label>
            <input {...register('firmName')} className="w-full px-4 py-3 border rounded-xl" placeholder="Your firm name" />
            {errors.firmName && <p className="text-sm text-red-600">{String(errors.firmName?.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input {...register('email')} type="email" className="w-full px-4 py-3 border rounded-xl" placeholder="you@firm.com" />
            {errors.email && <p className="text-sm text-red-600">{String(errors.email?.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPassword ? 'text' : 'password'} className="w-full px-4 py-3 border rounded-xl" placeholder="Create a password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            {errors.password && <p className="text-sm text-red-600">{String(errors.password?.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm password</label>
            <input {...register('confirmPassword')} type="password" className="w-full px-4 py-3 border rounded-xl" placeholder="Confirm" />
            {errors.confirmPassword && <p className="text-sm text-red-600">{String(errors.confirmPassword?.message)}</p>}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>}

          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl" disabled={loading}>{loading ? 'Signing up...' : 'Sign up — Free'}</button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm">Already have an accountant account? <a href="/accountant/login" className="text-emerald-600">Sign in</a></p>
        </div>
      </div>
    </div>
  )
}
