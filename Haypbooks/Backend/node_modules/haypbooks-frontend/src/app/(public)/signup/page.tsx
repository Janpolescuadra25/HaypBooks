"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export default function SignupPage() {
  const router = useRouter()
  useEffect(() => {
    try {
      if (authService.isAuthenticated()) {
        router.replace('/')
      }
    } catch {}
  }, [router])
  const signupSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    companyName: z.string().min(1, 'Company name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/(?=.*[A-Z])(?=.*\d)/, 'Include an uppercase letter and a number'),
    confirmPassword: z.string().min(1)
  }).refine((data) => data.password === data.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] })

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({ resolver: zodResolver(signupSchema) })
  const passwordValue = watch('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' }
    if (password.length < 8) return { strength: 1, label: 'Weak', color: 'bg-red-500' }
    if (password.length < 12) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { strength: 2, label: 'Fair', color: 'bg-yellow-500' }
    }
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
        companyName: data.companyName,
        email: data.email,
        password: data.password,
      })

      // request a verification OTP explicitly (backend also triggers this)
      // Backend triggers a verification OTP automatically; call sendVerification for extra safety
      try {
        const sendResp = await authService.sendVerification(data.email)
        // If server returned the OTP in dev, forward into verify with code prefilled
        const devOtp = (sendResp as any)?.otp || (signupResp as any)?._devOtp
        if (devOtp) {
          location.href = `/verify-otp?email=${encodeURIComponent(data.email)}&flow=signup&code=${encodeURIComponent(devOtp)}`
          return
        }
      } catch (e) {}

      // redirect to verification
      location.href = `/verify-otp?email=${encodeURIComponent(data.email)}&flow=signup`
    } catch (e: any) {
      setError(e.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Start your free 30-day trial. No credit card required.</p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                {...register('firstName')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Juan"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                {...register('lastName')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Dela Cruz"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company name
            </label>
            <input
              id="companyName"
              type="text"
              {...register('companyName')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="ACME Corp"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Create a strong password"
              required
              minLength={8}
            />
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
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Re-enter your password"
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{String(errors.confirmPassword?.message)}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By signing up, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <a href="/landing" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
