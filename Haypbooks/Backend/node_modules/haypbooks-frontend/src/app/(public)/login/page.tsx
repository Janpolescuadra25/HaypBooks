"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dynamic from 'next/dynamic'
const HubSelectionModal = dynamic(() => import('@/components/HubSelectionModal'), { ssr: false })
import AuthLayout from '@/components/auth/AuthLayout' 

export default function LoginPage() {
  // If the user is already signed in, don't allow visiting login page
  const router = useRouter()
  
  useEffect(() => {
    let mounted = true

    const paramsEarly = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    // If the user explicitly asked to see the login form (showLogin=1) or just logged out,
    // skip the immediate redirect even if we detect an existing session/cookie. This allows
    // UX flows like clicking the header "Sign In" to show the form first.
    if (paramsEarly?.get('showLogin') === '1' || paramsEarly?.get('loggedOut') === '1') return

    const checkSession = async () => {
      if (!authService.isAuthenticated()) return

      try {
        // Confirm server session is valid by fetching the current user
        await authService.getCurrentUser()

        if (!mounted) return
        const params = new URLSearchParams(window.location.search)
        const next = params.get('next') || '/companies'
        router.replace(next)
      } catch (e) {
        // If the stored user is stale or session expired, clear it and allow login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
        }
      }
    }

    checkSession()

    return () => { mounted = false }
  }, [router])
  const schema = z.object({ email: z.string().email('Invalid email'), password: z.string().min(1, 'Password required') })
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const email = params?.get('email')
    if (email) setValue('email', email)
  }, [setValue])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showHubSelection, setShowHubSelection] = useState(false)
  const [hubSelectionUser, setHubSelectionUser] = useState<any | null>(null)
  // Support helpful resend flow when login fails due to unverified account
  const [unverifiedEmail, setUnverifiedEmail] = useState(false)
  const [lastTriedEmail, setLastTriedEmail] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendInfo, setResendInfo] = useState<string | null>(null)
  // Login page no longer allows choosing Accountant/Owner — default to Owner flow here.
  const loginAsAccountant = false

  async function onSubmit(values: any) {
    setLoading(true)
    setError(null)
    
    let timeoutId: NodeJS.Timeout | undefined
    const controller = new AbortController()
    let didTimeout = false
    
    try {
      timeoutId = setTimeout(() => {
        didTimeout = true
        controller.abort()
      }, 10000)
      
      const response = await authService.login(
        { email: String(values.email || '').trim().toLowerCase(), password: values.password, loginAsAccountant }, 
        { signal: controller.signal }
      )
      
      // Validate and save user data
      if (typeof window !== 'undefined' && response?.user) {
        if (response.user.id && response.user.email && 
            typeof response.user.onboardingCompleted === 'boolean') {
          localStorage.setItem('user', JSON.stringify(response.user))
        } else {
          console.error('Invalid user object received from server')
          throw new Error('Invalid response from server')
        }
      }

      // Lightweight, non-sensitive logging to aid debugging in environments where
      // the verification redirect does not occur as expected. We intentionally
      // avoid logging tokens or full objects – only essential flags and identifiers.
      try {
        const summary = {
          mfaRequired: !!(response as any)?.mfaRequired,
          requiresVerification: !!(response?.user as any)?.requiresVerification,
          requiresPinSetup: !!(response?.user as any)?.requiresPinSetup,
          requiresHubSelection: !!(response?.user as any)?.requiresHubSelection,
          email: (response?.user as any)?.email || String(values.email || ''),
          userId: (response?.user as any)?.id || null
        }
        // eslint-disable-next-line no-console
        console.info('[login] response summary', summary)
      } catch (e) { /* swallow logging errors */ }
      
      const params = new URLSearchParams(window.location.search)
  const next = params.get('next') || '/dashboard'
      // If server indicates MFA/verification is required, redirect to verification flow
      if ((response as any)?.mfaRequired || (response.user as any)?.requiresVerification) {
        // pass email in query so email code form can default to it; include origin
        const q = new URLSearchParams({ email: response.user.email })
        q.set('from', 'signin')
        router.replace(`/verification?${q.toString()}`)
        setLoading(false)
        return
      }

      // If server indicates the user needs to set up a PIN explicitly, send them to the verification screen
      // but do NOT force the setup view - show the options first and let the user choose.
      if ((response.user as any)?.requiresPinSetup) {
        const q = new URLSearchParams({ email: response.user.email })
        q.set('from', 'signin')
        router.replace(`/verification?${q.toString()}`)
        setLoading(false)
        return
      }

      // If server indicates the user needs to select a hub (multi-role, no preferredHub), show the Workspace selection page
      if ((response.user as any)?.requiresHubSelection) {
        // Redirect to dedicated Workspace selection page to allow an explicit choice after sign-in
        router.replace('/workspace')
        setLoading(false)
        return
      }

      // Dev-only forced redirect: when running locally you can set
      // NEXT_PUBLIC_FORCE_VERIFY_AFTER_SIGNIN=1 to always land on the verification
      // selection screen after sign-in for easy testing.
      const forceRedirect = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_FORCE_VERIFY_AFTER_SIGNIN === '1' || process.env.NEXT_PUBLIC_FORCE_VERIFY_AFTER_SIGNIN === 'true')
      if (forceRedirect) {
        const q = new URLSearchParams({ email: response.user?.email || String(values.email || '') })
        q.set('from', 'signin')
        // eslint-disable-next-line no-console
        console.warn('[login] DEV FORCE: redirecting to verification due to NEXT_PUBLIC_FORCE_VERIFY_AFTER_SIGNIN')
        router.replace(`/verification?${q.toString()}`)
        setLoading(false)
        return
      }

      // Before redirecting to hub selection, confirm server-side verification state.
      // Some servers may not include mfaRequires/requiresVerification in the login response,
      // so probe /api/users/me for authoritative state and redirect to verification if needed.
      try {
        const me = await authService.getCurrentUser()
        // Consider the user needing verification if either channel is unverified or unknown.
        // We only skip redirect when both email and phone are explicitly verified.
        const bothVerified = !!me && ((me as any).isEmailVerified === true && (me as any).isPhoneVerified === true)
        const needsVerification = !!(me && !bothVerified)
        if (needsVerification) {
          const q = new URLSearchParams({ email: me.email || response.user.email || '' })
          q.set('from', 'signin')
          router.replace(`/verification?${q.toString()}`)
          setLoading(false)
          return
        }
      } catch (e) {
        // If the getCurrentUser probe fails, redirect to verification selection.
        // This is a safer default than proceeding to hub selection because it
        // ensures users who may be missing verification steps (or have cookie
        // scoping issues) are not silently sent to the hub where they may be
        // unable to proceed. Log the failure for diagnostics as well.
        // eslint-disable-next-line no-console
        console.warn('[login] getCurrentUser probe failed; redirecting to verification for diagnostics')
        const q = new URLSearchParams({ email: response.user?.email || String(values.email || '') })
        q.set('from', 'signin')
        router.replace(`/verification?${q.toString()}`)
        setLoading(false)
        return
      }

      // Always show the Workspace selection first so users explicitly choose or create a workspace
      // (Do not auto-redirect to a preferred workspace immediately after login.)
      router.replace('/workspace')
    } catch (e: any) {
      // If aborted (either by our timeout or user navigation), show a consistent message
      if (e?.name === 'CanceledError' || e?.name === 'AbortError') {
        setLoading(false)
        if (didTimeout) setError('Request timed out. Please check your connection and try again.')
        return
      }

      setLoading(false)
      
      // Map backend error codes to user-friendly messages
      const errorCode = e?.response?.data?.code
      // Prefer a message from the response but also fallback to error.message; make a combined string to robustly detect verification responses
      const responseMessage = e?.response?.data?.message || e?.response?.data?.error
      const errorMsg = responseMessage || e?.message
      const backendMsgFull = String(responseMessage || e?.message || '')
      
      const errorMessages: Record<string, string> = {
        'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
        'account_locked': 'Your account has been temporarily locked for security. Please contact support or try again later.',
        'mfa_required': 'Two-factor authentication is required for your account.',
        'mfa_invalid': 'The authentication code you entered is invalid or has expired.',
        'rate_limit': 'Too many login attempts. Please wait a few minutes before trying again.',
        'session_expired': 'Your session has expired for security. Please sign in again.'
      }

      // Detect explicit "Please verify your account before logging in" message from backend
      const backendMsg: string | undefined = e?.response?.data?.message
      // Broaden detection of "unverified" responses so we reliably redirect to the
      // verification selection screen when the backend indicates the account needs
      // verification. Match message shapes like 'Please verify', 'not verified', or
      // 'account not verified' in a case-insensitive manner.
      // Match 'verify', 'confirm', 'unverified', or 'not verified' to be robust to server message variations
      const unverifiedRegex = /verify|confirm|unverif|not verif/i
      // Consider either an explicit 401 *or* a plain Error with matching message as
      // indicators that the account is unverified. This lets us handle different
      // server/client transport layers that surface errors differently.
      const has401 = e?.response?.status === 401
      const hasMatchingMessage = unverifiedRegex.test(backendMsgFull || '') || unverifiedRegex.test(backendMsg || '') || unverifiedRegex.test(String(e?.message || ''))
      const isUnverifiedResp = (has401 || !!String(e?.message || '').length) && hasMatchingMessage
      if (isUnverifiedResp) {
        const attemptedEmail = String(values.email || '').trim().toLowerCase()
        // Log so we can diagnose message shapes in prod/dev quickly
        // eslint-disable-next-line no-console
        console.warn(`[login] detected unverified response; redirecting to verification for ${attemptedEmail}. message="${String(backendMsgFull).slice(0,200)}"`)
        // pass email and origin so verification page can show a contextual banner
        const q = new URLSearchParams({ email: attemptedEmail })
        q.set('from', 'signin')
        router.replace(`/verification?${q.toString()}`)
        setLoading(false)
        return
      }
      
      if (errorCode && errorMessages[errorCode]) {
        setError(errorMessages[errorCode])
      } else if (e?.response?.status === 404) {
        setError('We could not find an account with that email.')
      } else if (e?.response?.status === 401) {
        setError(errorMessages['invalid_credentials'])
      } else if (e?.response?.status === 429) {
        setError(errorMessages['rate_limit'])
      } else if (e?.response?.status >= 500) {
        setError('Our servers are experiencing issues. Please try again in a moment.')
      } else if (e?.message === 'Invalid response from server') {
        setError('Received invalid data from server. Please try again or contact support.')
      } else {
        setError(errorMsg || 'Sign in failed. Please check your connection and try again.')
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  return (
    <AuthLayout>
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500">Please enter your details to sign in to your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Hub selection modal (shown to multi-role users without preferredHub) */}
          {showHubSelection && hubSelectionUser ? (
            <HubSelectionModal user={hubSelectionUser} onClose={() => setShowHubSelection(false)} />
          ) : null}
          <div className="relative group">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2 transition-colors group-focus-within:text-emerald-600">
              Email address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                placeholder="name@company.com"
                required
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            {errors.email && <p className="text-sm text-red-600 mt-1 animate-shake">{String(errors.email?.message)}</p>}
          </div>

          <div className="relative group">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2 transition-colors group-focus-within:text-emerald-600">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register('password')}
                className="w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                placeholder="••••••••"
                required
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
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
            {errors.password && <p className="text-sm text-red-600 mt-1 animate-shake">{String(errors.password?.message)}</p>}
          </div>

          <div className="flex justify-end">
            <a href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              Forgot password?
            </a>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-slide-down flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Show resend verification action when the backend indicates account is unverified */}
          {unverifiedEmail && lastTriedEmail && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm mt-3 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4.5M21 14h-4.5M7 10l5-6 5 6"/></svg>
                <div className="flex-1">
                  <div className="font-medium">Account not verified</div>
                  <div className="text-xs text-amber-800">We can resend a verification code to <strong>{lastTriedEmail}</strong>.</div>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-2 bg-emerald-600 text-white rounded-md disabled:opacity-50"
                  onClick={async () => {
                    setResendLoading(true)
                    setResendInfo(null)
                    try {
                      const resp: any = await authService.sendVerification(lastTriedEmail)
                      const devOtp = resp?.otp || resp?.otpCode || resp?.code || resp?.otp?.otpCode
                      if (devOtp) {
                        setResendInfo(`Verification sent. Dev code: ${String(devOtp).padStart(6,'0')}`)
                        // navigate to verification UI (sign-in flow) and pre-fill code for convenience
                        router.push(`/verification?email=${encodeURIComponent(lastTriedEmail)}&code=${encodeURIComponent(String(devOtp).padStart(6,'0'))}`)
                        return
                      }
                      setResendInfo('Verification sent. Check your email or phone for the code.')
                      router.push(`/verification?email=${encodeURIComponent(lastTriedEmail)}`)
                    } catch (err) {
                      setResendInfo('Unable to send verification now. Please try again later.')
                    } finally { setResendLoading(false) }
                  }}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Sending…' : 'Resend verification'}
                </button>

                <button className="px-3 py-2 bg-white border border-slate-200 rounded-md" onClick={() => { setUnverifiedEmail(false); setResendInfo(null) }}>Dismiss</button>
              </div>

              {resendInfo ? <div className="text-xs text-slate-700 mt-2">{resendInfo}</div> : null}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            disabled={loading}
          >
            {loading || isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (<><span>Sign In</span><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>)}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <a href="/signup?showSignup=1" onClick={() => { if (typeof window !== 'undefined') { localStorage.setItem('hasSeenIntro','true'); window.dispatchEvent(new Event('suppressIntro')) } }} className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
              Sign up for free
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
