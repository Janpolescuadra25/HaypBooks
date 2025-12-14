"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export default function LoginPage() {
  // If the user is already signed in, don't allow visiting login page
  const router = useRouter()
  useEffect(() => {
    try {
      if (authService.isAuthenticated()) {
        // send them into the app (respect any `next=` param)
        const params = new URLSearchParams(window.location.search)
        const next = params.get('next') || '/'
        router.replace(next)
      }
    } catch {}
  }, [router])
  const schema = z.object({ email: z.string().email('Invalid email'), password: z.string().min(1, 'Password required') })
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(values: any) {
    setLoading(true)
    setError(null)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        setError('Request timed out. Please check your connection and try again.')
        setLoading(false)
      }, 10000)
      
      const response = await authService.login(
        { email: values.email, password: values.password }, 
        { signal: controller.signal }
      )
      
      clearTimeout(timeoutId)
      
      if (typeof window !== 'undefined' && response?.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next')
      
      if (response.user.onboardingCompleted) {
        router.replace(next || '/dashboard')
      } else {
        router.replace('/onboarding')
      }
    } catch (e: any) {
      // Skip if already aborted by timeout
      if (e?.name === 'CanceledError' || e?.name === 'AbortError') {
        return
      }
      
      setLoading(false)
      
      // Map backend error codes to user-friendly messages
      const errorCode = e?.response?.data?.code
      const errorMsg = e?.response?.data?.error || e?.response?.data?.message || e?.message
      
      const errorMessages: Record<string, string> = {
        'invalid_credentials': 'Invalid email or password.',
        'account_locked': 'Account temporarily locked due to suspicious activity.',
        'mfa_required': 'Two-factor authentication required.',
        'mfa_invalid': 'Invalid authentication code.',
        'rate_limit': 'Too many attempts. Please try again in a few minutes.',
        'session_expired': 'Your session has expired. Please log in again.'
      }
      
      if (errorCode && errorMessages[errorCode]) {
        setError(errorMessages[errorCode])
      } else if (e?.response?.status === 404) {
        setError('We could not find an account with that email.')
      } else if (e?.response?.status === 401) {
        setError(errorMessages['invalid_credentials'])
      } else if (e?.response?.status === 429) {
        setError(errorMessages['rate_limit'])
      } else {
        setError(errorMsg || 'Sign in failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your Haypbooks account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
            {errors.email && <p className="text-sm text-red-600 mt-1">{String(errors.email?.message)}</p>}
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
              placeholder="••••••••"
              required
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{String(errors.password?.message)}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </a>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading || isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign up for free
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
