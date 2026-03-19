"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { authService } from '@/services/auth.service'
import AuthLayout from '@/components/auth/AuthLayout' 
import { useForm } from 'react-hook-form'
import { normalizePhoneOrThrow } from '@/utils/phone.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export default function SignupPage() {
  const router = useRouter()

  // Always suppress the cinematic intro when landing on the signup page
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('hasSeenIntro', 'true') } catch {}
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
        // Redirect to the main app, not '/' which may trigger the cinematic intro
        router.replace('/companies')
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
  
  // no default role otherwise – leave both buttons unselected until user chooses
  // (role stays null so neither button gets the selected styling)

  const signupSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    companyName: z.string().optional(), // role-specific validation done at submit
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
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
  // start with no role selected to avoid automatically highlighting Business Owner
  const [role, setRole] = useState<'business'|'accountant'|null>(null)

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
        email: String(data.email || '').trim().toLowerCase(),
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
      const firstOtp = (pre as any)?.otpEmail || (pre as any)?.otp
      const codeParam = firstOtp ? `&code=${encodeURIComponent(firstOtp)}` : ''
      const phoneParam = payload.phone ? `&phone=${encodeURIComponent(payload.phone)}` : ''
      const tokenParam = `&signupToken=${encodeURIComponent(pre.signupToken)}`
      // Use router.push so tests can mock navigation (avoids jsdom navigation errors)
      router.push(`/verify-otp?email=${emailParam}&flow=signup${roleParam}${phoneParam}${codeParam}${tokenParam}`)
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
    <AuthLayout>
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {step === 'role' ? 'Join Haypbooks' : 'Create your account'}
          </h2>
          <p className="text-slate-500">
            {step === 'role'
              ? 'Which best describes your role?'
              : `Setting up for ${role === 'accountant' ? 'My Practice' : 'My Business'}`}
          </p>
        </div>

          {/* Role selection step */}
          {step === 'role' ? (
            <div>
              <div className="flex flex-col gap-4">

                <button
                  type="button"
                  data-testid="signup-role-business"
                  onClick={() => { setRole('business'); setStep('form') }}
                  className={`flex items-start gap-4 p-5 border-2 rounded-2xl text-left transition-all hover:border-emerald-400 hover:bg-emerald-50/50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${role === 'business' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Business Owner</div>
                    <div className="text-sm text-slate-500 mt-0.5">I want to manage my company's finances and ledgers.</div>
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="signup-role-accountant"
                  onClick={() => { setRole('accountant'); setStep('form') }}
                  className={`flex items-start gap-4 p-5 border-2 rounded-2xl text-left transition-all hover:border-emerald-400 hover:bg-emerald-50/50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${role === 'accountant' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Accounting Professional</div>
                    <div className="text-sm text-slate-500 mt-0.5">I want to manage multiple client practices and advisory services.</div>
                  </div>
                </button>
              </div>
            </div>
          ) : null}

        {step === 'form' ? (
          <>
            <div className="mb-6 flex items-center justify-start">
              <button data-testid="signup-back-to-role" type="button" onClick={() => setStep('role')} aria-label="Change role" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                Change role
              </button>
            </div>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
              <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                  First name
                </label>
                <input aria-label="First name"
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  placeholder="Juan"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                  Last name
                </label>
                <input aria-label="Last name"
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
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
                  className="truncate w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all pr-12"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                Phone number <span className="text-xs text-slate-400">(optional)</span>
              </label>
              <div className="flex gap-0 items-stretch">
                <select {...register('phoneCountry')} defaultValue="PH" aria-label="Country code" className="w-20 h-10 px-2 pr-6 py-2 border border-slate-700 rounded-l-lg bg-white text-sm text-slate-900 text-left" title="+63 Philippines">
                  <option value="PH" title="+63 Philippines">+63</option>
                  <option value="US" title="+1 United States">+1</option>
                  <option value="GB" title="+44 United Kingdom">+44</option>
                  <option value="AU" title="+61 Australia">+61</option>
                  <option value="IN" title="+91 India">+91</option>
                  <option value="SG" title="+65 Singapore">+65</option>
                </select>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
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

            {/* Prefer form-level validation message when available; otherwise show positive match indicator */}
            {errors.confirmPassword ? (
              <p id="confirmStatus" role="status" aria-live="polite" className="mt-1 text-sm text-red-600 animate-shake">{String(errors.confirmPassword?.message)}</p>
            ) : (passwordValue && confirmValue) ? (
              <div id="confirmStatus" role="status" aria-live="polite" className="text-emerald-600 mt-2 text-sm">Passwords match</div>
            ) : null}
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
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
            ) : (<><span>Create account</span><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>)}
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
