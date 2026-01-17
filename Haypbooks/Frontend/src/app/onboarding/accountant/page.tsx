"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import apiClient from '@/lib/api-client'
import AuthLayout from '@/components/auth/AuthLayout'

export default function AccountantOnboarding() {
  const router = useRouter()
  const [firm, setFirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function complete() {
    if (!firm.trim()) { setError('Firm name is required'); return }
    setError('')
    setLoading(true)
    try {
      // Persist firm name to user profile (best-effort)
      try {
        await apiClient.patch('/api/users/profile', { firmName: firm })
      } catch (e) {
        console.warn('Failed to persist firm name', e)
      }

      // Save a business step for the accountant hub if needed
      await apiClient.post('/api/onboarding/save', { step: 'accountant_firm', data: { firmName: firm } })
      const res = await apiClient.post('/api/onboarding/complete', { type: 'full', hub: 'ACCOUNTANT' })
      if (!(res.status >= 200 && res.status < 300)) throw new Error('complete failed')
      router.push('/hub/accountant')
    } catch (err) {
      console.error(err)
      try { document.cookie = 'onboardingAccountantComplete=true; path=/' } catch (e) {}
      alert('Failed to persist onboarding server-side — marking complete locally and continuing')
      try { router.push('/hub/accountant') } catch (e) {}
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout innerClassName="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative z-10 animate-slide-up">
      <div>        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-3 shadow-lg animate-scale-in">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="mb-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Haypbooks</span>
          </div>
        </div>        <h1 className="text-2xl font-bold mb-4">Welcome — let’s set up your firm</h1>
        <p className="text-sm text-slate-600 mb-4">Let’s start by naming your firm. This gives you access to your Accountant Hub and is how your clients will see your practice.</p>
        <form onSubmit={(e) => { e.preventDefault(); complete() }}>
          <label htmlFor="firmName" className="block mb-2 text-sm">Firm name</label>
          <input id="firmName" aria-required="true" value={firm} onChange={(e) => { setFirm(e.target.value); setError('') }} onBlur={() => { if (!firm.trim()) setError('Firm name is required') }} placeholder="Your firm's name" className={`w-full px-3 py-2 border rounded mb-2 ${error ? 'border-red-500' : 'border-slate-200'}`} />
          <p className="text-xs text-slate-400 mb-3">This name will be visible to your clients and on transaction documents.</p>
          {error && <p className="text-sm text-red-600 mb-2">{error}</p> }
          <div>
            <button aria-label="create firm" className="btn-primary w-full" type="submit" disabled={loading || !firm.trim()}>{loading ? 'Creating…' : 'Create firm'}</button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
