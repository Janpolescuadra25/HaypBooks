"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const roleParam = searchParams?.get('role') || null

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      if (!authService.isAuthenticated()) return

      try {
        // Confirm server session is valid
        await authService.getCurrentUser()
        
        if (!mounted) return
        router.replace('/')
      } catch (e) {
        // If stored user is stale, clear it and allow signup
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
        }
      }
    }

    // Persist any role query parameter for downstream onboarding or backend use
    if (roleParam && typeof window !== 'undefined') {
      localStorage.setItem('preferred_role', roleParam)
    }

    checkSession()

    return () => { mounted = false }
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [selectedRole, setSelectedRole] = useState<string | null>(() => {
    if (typeof window === 'undefined') return roleParam
    return roleParam || localStorage.getItem('preferred_role')
  })

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
        role: selectedRole || undefined
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg animate-scale-in">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Create your account</h1>
          <p className="text-slate-600">Start your free 30-day trial. No credit card required.</p>

          {selectedRole && (
            <div className="mt-4 inline-block px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
              Signing up as <strong className="ml-1 capitalize">{selectedRole}</strong>. You can change this later in your profile.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                {...register('firstName')}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50 hover:bg-white"
                placeholder="Juan"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                {...register('lastName')}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50 hover:bg-white"
                placeholder="Dela Cruz"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
              Company name
            </label>
            <input
              id="companyName"
              type="text"
              {...register('companyName')}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50 hover:bg-white"
              placeholder="ACME Corp"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50 hover:bg-white"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register('password')}
                className="w-full px-4 py-3 pr-11 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50 hover:bg-white"
                placeholder="Create a strong password"
                required
                minLength={8}
              />
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
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register('confirmPassword')}
                className="w-full px-4 py-3 pr-11 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50 hover:bg-white"
                placeholder="Re-enter your password"
                required
              />
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
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 animate-shake">{String(errors.confirmPassword?.message)}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-slide-down flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98]"
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : 'Create account'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            By signing up, you agree to our{' '}
            <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
          </p>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <a href="/landing" className="text-sm text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-30px, 30px) rotate(-5deg); }
          66% { transform: translate(20px, -20px) rotate(5deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.2s; opacity: 0; }
        .animate-slide-down { animation: slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  )
}
