"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import apiClient from '@/lib/api-client'

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
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Accountant: Set up your firm</h1>
        <p className="text-sm text-slate-600 mb-4">Provide a name for your practice and finish setup to access the Accountant Hub.</p>
        <label className="block mb-2 text-sm">Firm name <span className="text-xs text-slate-500">(required)</span></label>
        <input id="firmName" aria-required="true" value={firm} onChange={(e) => { setFirm(e.target.value); setError('') }} onBlur={() => { if (!firm.trim()) setError('Firm name is required') }} placeholder="Your firm name (required)" className={`w-full px-3 py-2 border rounded mb-2 ${error ? 'border-red-500' : 'border-slate-200'}`} />
        {error && <p className="text-sm text-red-600 mb-2">{error}</p> }
        <div>
          <button className="btn-primary w-full" onClick={complete} disabled={loading || !firm.trim()}>{loading ? 'Finishing…' : 'Finish setup'}</button>
        </div>
      </div>
    </div>
  )
}
