"use client"
"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import AuthLayout from '@/components/auth/AuthLayout' 
import { useForm } from 'react-hook-form'
import { normalizePhoneOrThrow } from '@/utils/phone.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export default function SignupPage() {
  const router = useRouter()

  // If navigated to signup with explicit showSignup=1, opt out of the cinematic intro immediately
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const p = new URLSearchParams(window.location.search)
        if (p.get('showSignup') === '1') {
          try { localStorage.setItem('hasSeenIntro', 'true') } catch {}
        }
      }
    } catch (e) {}
  }, [])

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

    checkSession()

    // If a `role` query param is present, pre-select the role and show form
    try {
      const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      if (sp) {
        const r = sp.get('role')
        if (r === 'accountant') { setRole('accountant'); setStep('form') }
        if (r === 'business') { setRole('business'); setStep('form') }
      }
    } catch (e) {}

    return () => { mounted = false }
  }, [router])
  // Basic shape validation with zod; companyName is validated dynamically based on selected role
  const signupSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    companyName: z.string().optional(), // role-specific validation done at submit
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    phoneCountry: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/(?=.*[A-Z])(?=.*\d)/, 'Include an uppercase letter and a number'),
    confirmPassword: z.string().min(1)
  }).refine((data) => data.password === data.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] })

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid }, watch, setError } = useForm({ resolver: zodResolver(signupSchema), mode: 'onChange' })
  const passwordValue = watch('password')
  const confirmValue = watch('confirmPassword')
  const emailValue = watch('email')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // roleSelectionStep: 'role' shows the initial choice UI; 'form' shows the signup form
  const [step, setStep] = useState<'role'|'form'>('role')
  const [role, setRole] = useState<'business'|'accountant'>('business')

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
    setFormError(null)
    setLoading(true)
    try {


      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }
      if (data.companyName && String(data.companyName).trim()) payload.companyName = data.companyName
      if (data.phone && String(data.phone).trim()) {
        try {
          payload.phone = normalizePhoneOrThrow(String(data.phone).trim(), data.phoneCountry)
        } catch (err: any) {
          setError('phone', { type: 'manual', message: err?.message || 'Please provide a valid phone number' })
          setLoading(false)
          return
        }
      }
      if (role === 'accountant') payload.role = 'accountant'

      // Use pre-signup to avoid creating a DB user until OTP verified
      const pre = await authService.preSignup(payload)

      // Navigate to verify OTP UI with the signup token
      const emailParam = encodeURIComponent(payload.email)
      const roleParam = role ? `&role=${encodeURIComponent(role)}` : ''
      const codeParam = pre?.otp ? `&code=${encodeURIComponent(pre.otp)}` : ''
      const phoneParam = payload.phone ? `&phone=${encodeURIComponent(payload.phone)}` : ''
      const tokenParam = `&signupToken=${encodeURIComponent(pre.signupToken)}`
      location.href = `/verify-otp?email=${emailParam}&flow=signup${roleParam}${phoneParam}${codeParam}${tokenParam}`
      return
    } catch (e: any) {
      const status = e?.response?.status
      if (status === 409) {
        // Account already exists: guide user to login instead of creating duplicate
        setFormError('An account already exists for that email. Please sign in or reset your password.')
      } else {
        setFormError(e.response?.data?.message || 'Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout innerClassName="max-w-sm w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 relative z-10 animate-slide-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-3 shadow-lg animate-scale-in">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Create your account</h1>
          <p className="text-sm text-slate-600 mt-1">Manage your accounting with clarity and confidence using HaypBooks.</p>

          {/* Role selection step */}
          {step === 'role' ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Which best describes your role?</h3>
              <div className="flex flex-col gap-3">
                <style>{`@keyframes breatheRole { 0%,100% { transform: translateY(-4px) scale(1.02); } 50% { transform: translateY(-6px) scale(1.03); } } @media (prefers-reduced-motion: reduce) { .breatheRole { animation: none !important; } }`}</style>

                <button
                  type="button"
                  data-testid="signup-role-business"
                  aria-pressed={role === 'business'}
                  onClick={() => { setRole('business'); setStep('form') }}
                  className={`option-card text-left p-3 rounded-2xl border-2 border-slate-200 bg-white shadow-sm transform-gpu transition-transform duration-200 ease-out hover:scale-102 hover:-translate-y-0.5 hover:shadow-sm hover:border-emerald-600 hover:ring-0 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${role === 'business' ? 'bg-emerald-50 shadow-sm breatheRole border-emerald-500' : ''}`}
                >
                  <div className="font-medium">My Business</div>
                  <div className="text-sm text-slate-500">I’m the owner running and managing my business</div>
                </button>

                <button
                  type="button"
                  data-testid="signup-role-accountant"
                  aria-pressed={role === 'accountant'}
                  onClick={() => { setRole('accountant'); setStep('form') }}
                  className={`option-card text-left p-4 rounded-2xl border-2 border-slate-200 bg-white shadow-sm transform-gpu transition-transform duration-200 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:border-emerald-600 hover:ring-4 hover:ring-emerald-100 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${role === 'accountant' ? 'bg-teal-50 shadow-md breatheRole border-emerald-500' : ''}`}
                >
                  <div className="font-medium">Accountant</div>
                  <div className="text-sm text-slate-500">I support clients by managing their accounts</div>
                </button>
              </div>
            </div>
          ) : null}

        </div>

        {/* Add small style block to ensure hover border/shadow match other option-cards */}
        <style>{`.option-card:hover { transform: translateY(-2px); box-shadow: 0 12px 18px -4px rgba(0,0,0,0.08), 0 6px 8px -4px rgba(0,0,0,0.03); border-color: #10b981; }
          .option-card:focus-visible { box-shadow: 0 0 0 4px rgba(16,185,129,0.08); }
        `}</style>

        {step === 'form' ? (
          <>
            <div className="mb-4 flex items-center justify-start">
              <button data-testid="signup-back-to-role" type="button" onClick={() => setStep('role')} aria-label="Back to role selection" className="text-sm text-slate-600 hover:text-slate-800 inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                Back
              </button>
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
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="truncate w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50 hover:bg-white pr-12"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                Phone number
              </label>
              <div className="flex gap-0 items-stretch">
                <select {...register('phoneCountry')} defaultValue="PH" aria-label="Country code" className="w-20 h-10 px-2 pr-6 py-2 border border-slate-700 rounded-l-lg bg-white text-sm text-slate-900 text-left" title="+63 Philippines">
                  <option value="PH">+63 Philippines</option>
                  <option value="US">+1 United States</option>
                  <option value="GB">+44 United Kingdom</option>
                  <option value="AU">+61 Australia</option>
                  <option value="IN">+91 India</option>
                  <option value="SG">+65 Singapore</option>
                </select>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  required
                  aria-required="true"
                  className="flex-1 min-w-0 h-10 px-3 py-2 border border-slate-700 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white placeholder-slate-400 text-sm text-slate-900"
                  placeholder="0916 123 4567"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">We’ll send a verification code by SMS if required. Message & data rates may apply.</p>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{String(errors.phone?.message)}</p>
              )}
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
                aria-describedby="confirmStatus"
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

            {/* Live confirm status for accessibility */}
            {(confirmValue && confirmValue.length > 0) ? (
              <div id="confirmStatus" role="status" aria-live="polite" className={`${confirmValue === passwordValue ? 'text-emerald-600' : 'text-red-600'} mt-2 text-sm`}>{confirmValue === passwordValue ? 'Passwords match' : 'Passwords do not match'}</div>
            ) : null}

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 animate-shake">{String(errors.confirmPassword?.message)}</p>
            )}
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-slide-down flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98]"
            disabled={loading || isSubmitting || !isValid}
            aria-disabled={loading || isSubmitting || !isValid}
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
          </>
        ) : null}

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <a href="/login?showLogin=1" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
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
      </AuthLayout>
  )
}
