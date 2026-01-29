"use client"

import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import apiClient from '@/lib/api-client'
import AuthLayout from '@/components/auth/AuthLayout'
import { useToast } from '@/components/ToastProvider'

export default function AccountantOnboarding() {
  const router = useRouter()
  const [firm, setFirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const lastSavedRef = useRef<string | null>(null)
  const { push } = useToast()

  async function complete() {
    if (!firm.trim()) { setError('Accountant Workspace name is required'); return }
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
      await saveFirm({ showToast: true })

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

  async function saveFirm({ showToast = false } = {}) {
    const toSave = String(firm || '').trim()
    if (!toSave) return null
    // Avoid saving if unchanged
    if (lastSavedRef.current === toSave) {
      if (showToast) push({ type: 'success', message: 'Accountant Workspace name saved' })
      return null
    }

    try {
      setIsSaving(true)
      await apiClient.post('/api/onboarding/save', { step: 'accountant_firm', data: { firmName: toSave } })
      lastSavedRef.current = toSave
      // Analytics event (best-effort)
      try { (await import('@/lib/analytics')).trackEvent('accountant_workspace_saved', { source: 'onboarding' }) } catch (e) {}
      if (showToast) push({ type: 'success', message: 'Accountant Workspace name saved' })
      return true
    } catch (e) {
      console.warn('Failed to save accountant firm step', e)
      if (showToast) push({ type: 'error', message: 'Failed to save Accountant Workspace name' })
      return false
    } finally { setIsSaving(false) }
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
        </div>        <h1 className="text-2xl font-bold mb-4 text-center">Welcome! Let’s set up your Accountant Workspace.</h1>
        <form onSubmit={(e) => { e.preventDefault(); complete() }}>
          <label htmlFor="firmName" className="block mb-2 text-sm">Accountant Workspace name</label>
          <input id="firmName" aria-required="true" value={firm} onChange={(e) => {
            setFirm(e.target.value); setError('')
          }} onBlur={async () => {
            if (!firm.trim()) { setError('Accountant Workspace name is required'); return }
            setIsSaving(true)
            try { await saveFirm({ showToast: true }) } finally { setIsSaving(false) }
          }} placeholder="e.g., “Maria Santos Accounting”" className={`w-full px-3 py-2 border rounded mb-2 ${error ? 'border-red-500' : 'border-slate-200'}`} />
          <div className="flex items-center gap-2 mb-3">
            {isSaving && (
              <span className="text-xs text-slate-500 inline-flex items-center">
                <svg className={`w-3 h-3 mr-2 animate-spin text-slate-400`} viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                <span>Saving…</span>
              </span>
            )}
            {(!isSaving && lastSavedRef.current) && <span className="text-xs text-slate-400">Saved</span>}
          </div>
          <p className="text-xs text-slate-500 mb-3">You can use your personal name, practice name, or firm name — whatever fits your style.</p>
          {error && <p className="text-sm text-red-600 mb-2">{error}</p> }
          <div>
            <button aria-label="create accountant workspace" className="btn-primary w-full" type="submit" disabled={loading || !firm.trim()}>{loading ? 'Creating…' : 'Create Accountant Workspace'}</button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
