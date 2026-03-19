"use client"

import { useRouter } from 'next/navigation'

export default function PracticeCompletePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50/30 to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full mb-6">
          <svg className="w-10 h-10 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Your subscription is active!</h1>
        <p className="text-slate-600 mb-1">Welcome to HaypBooks — full access to all features.</p>
        <p className="text-slate-500 text-sm mb-6">Your card has been charged for your plan today. You can cancel anytime in your account settings.</p>

        <div className="bg-teal-50 rounded-xl p-6 text-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Ready to get started?</h2>
          <p className="text-sm text-slate-600 mb-4">Your practice setup is complete. Let&apos;s manage your clients with clarity.</p>
          <button
            type="button"
            onClick={() => router.push('/practice-hub')}
            className="w-full px-8 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 shadow-lg transition"
          >
            Go to Dashboard
          </button>
        </div>

        <p className="text-sm text-slate-500">Need help? Our support team is here — <a href="/support" className="text-teal-600 hover:underline">chat with us</a>.</p>
      </div>
    </div>
  )
}
