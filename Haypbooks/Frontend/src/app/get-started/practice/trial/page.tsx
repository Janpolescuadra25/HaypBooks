"use client"

import { useRouter } from 'next/navigation'

export default function PracticeTrialPage() {
  const router = useRouter()

  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 30)
  const formattedDate = trialEndDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50/30 to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full mb-6">
          <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Your 30-day free trial has started!</h1>
        <p className="text-slate-600 mb-4">Welcome to HaypBooks — full access to all features.</p>

        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 space-y-1 text-sm text-teal-800">
          <p className="font-semibold">No credit card required</p>
          <p>Your trial ends on <span className="font-semibold">{formattedDate}</span></p>
          <p className="text-teal-600">Cancel or upgrade anytime</p>
        </div>

        <div className="bg-emerald-50 rounded-xl p-6 text-center mb-6">
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
