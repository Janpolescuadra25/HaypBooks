"use client"
import { useEffect, useState } from 'react'

import AuthLayout from '@/components/auth/AuthLayout'

export default function TrialIntroPage() {
  const [formatted, setFormatted] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/trials/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
        if (!res.ok) throw new Error('failed')
        const json = await res.json()
        if (mounted && json?.formatted) setFormatted(json.formatted)
      } catch {
        // Fallback to client-side compute if API fails
        const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        setFormatted(expiry.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <AuthLayout innerClassName="max-w-xl w-full text-center bg-white rounded-3xl shadow-2xl p-8">
      <div>
        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-8">
          <svg className="w-12 h-12 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-6">Your 30-day free trial has started! 🎉</h1>

        <p className="text-xl text-slate-600 mb-4">Welcome to HaypBooks — full access to all features.</p>
        <p className="text-lg text-slate-600 mb-10">No credit card required. Your trial ends on <strong>{formatted ?? '...'}</strong>. Cancel or upgrade anytime.</p>

        <div className="bg-emerald-50 rounded-2xl p-6 mb-10">
          <p className="text-lg font-medium text-slate-900">Ready to set up your company?</p>
          <p className="text-slate-600">Let's get your books organized in minutes.</p>
        </div>

        <a href="/onboarding" className="inline-block px-12 py-7 bg-emerald-600 text-white text-2xl font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-2xl">Complete Quick Setup</a>

        <p className="text-sm text-slate-500 mt-12">Need help? Our support team is here — <a href="/support" className="text-emerald-600 hover:underline">chat with us</a>.</p>
      </div>
    </AuthLayout>
  )
}
