import Link from 'next/link'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          Market-leading features for Philippine businesses
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
          Accounting Made Simple
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Professional accounting software with BIR compliance built-in. 
          Track invoices, bills, inventory, and taxes with enterprise-grade features at a fraction of the cost.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            href="/signup?showSignup=1&role=business"
            onClick={async (e) => {
              // If authenticated, confirm signout first so signup can proceed
              try {
                const auth = await import('@/services/auth.service')
                const isAuth = auth?.authService?.isAuthenticated?.() || false
                if (isAuth) {
                  e.preventDefault()
                  const ok = confirm('You are currently signed in. Sign out to create a new account?')
                  if (!ok) return
                  try { await auth.authService.logout() } catch (e) {}
                  try { localStorage.setItem('hasSeenIntro','true'); window.dispatchEvent(new Event('suppressIntro')) } catch (e) {}
                  try { window.location.href = '/signup?showSignup=1&role=business' } catch (e) {}
                  return
                }
              } catch (e) {}

              if (typeof window !== 'undefined') { localStorage.setItem('hasSeenIntro','true'); window.dispatchEvent(new Event('suppressIntro')) }
            }}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Start Subscription
          </Link>
          <Link 
            href="/login?showLogin=1" 
            className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all border-2 border-blue-600"
          >
            Sign In
          </Link>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No credit card required
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Full access for 30 days
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Cancel anytime
          </div>
        </div>
      </div>
    </section>
  )
}
