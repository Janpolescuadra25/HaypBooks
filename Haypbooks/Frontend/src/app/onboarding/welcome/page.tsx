export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-8">
            <svg className="w-12 h-12 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-6">Welcome aboard! You're all set 🎉</h1>

          <p className="text-xl text-slate-600 mb-4">Your subscription is active.</p>
          <p className="text-lg text-slate-600 mb-10">You've been charged for your plan today. You can cancel anytime in your account settings.</p>

          <div className="bg-emerald-50 rounded-2xl p-6 mb-10">
            <p className="text-lg font-medium text-slate-900">Ready to get started?</p>
            <p className="text-slate-600">Let's get your books organized in minutes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 mb-12">
            <a href="/onboarding" className="block px-8 py-6 bg-emerald-600 text-white text-xl font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl w-full">Complete Quick Setup</a>
          </div>

          <p className="text-sm text-slate-500 mt-12">Need help? Our support team is here — <a href="/support" className="text-emerald-600 hover:underline">chat with us</a>.</p>
        </div>
      </div>
    </div>
  )
}
