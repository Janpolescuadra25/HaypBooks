import AuthLayout from '@/components/auth/AuthLayout'

export default function WelcomePage() {
  return (
    <AuthLayout innerClassName="max-w-md w-full text-center bg-white rounded-3xl shadow-lg p-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 className="text-3xl font-semibold text-slate-900 mb-4">Welcome aboard! You&#39;re all set 🎉</h1>

          <p className="text-lg text-slate-600 mb-3">Your subscription is active.</p>
          <p className="text-base text-slate-600 mb-8">You&#39;ve been charged for your plan today. You can cancel anytime in your account settings.</p>

          <div className="mt-6 bg-emerald-50 rounded-xl p-6 text-center mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Ready to get started?</h2>
            <p className="text-sm text-slate-600 mb-4">Let&#39;s get your books organized in minutes.</p>
            <a href="/onboarding" aria-label="Complete Quick Setup" className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white rounded-full text-lg font-semibold hover:bg-emerald-700 shadow-lg mx-auto">Complete Quick Setup</a>
          </div>

          <p className="text-sm text-slate-500 mt-8">Need help? Our support team is here — <a href="/support" className="text-emerald-600 hover:underline">chat with us</a>.</p>
      </AuthLayout>
  )
}
