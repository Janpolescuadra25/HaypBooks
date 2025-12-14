"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BusinessStepComponent from '@/components/Onboarding/BusinessStep'
import apiClient from '@/lib/api-client'

export default function QuickBusinessOnboarding() {
  const [loading, setLoading] = useState(false)
  const [initial, setInitial] = useState<any>(null)
  const router = useRouter()
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
  const API_BASE = USE_MOCK ? '' : (process.env.NEXT_PUBLIC_API_BASE || '')

  useEffect(() => {
    async function load() {
      try {
        if (USE_MOCK) {
          const r = await fetch('/api/onboarding/save')
          if (!r.ok) return
          const json = await r.json()
          setInitial(json.business || null)
        } else {
          const r = await apiClient.get('/api/onboarding/save')
          setInitial(r.data?.steps?.business || null)
        }
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  async function handleSave(d: any) {
    setLoading(true)
    try {
      if (USE_MOCK) {
        const r = await fetch('/api/onboarding/save', { method: 'POST', body: JSON.stringify({ step: 'business', data: d }), headers: { 'Content-Type': 'application/json' } })
        if (!r.ok) throw new Error('save failed')
      } else {
        const r = await apiClient.post('/api/onboarding/save', { step: 'business', data: d })
        if (!(r.status >= 200 && r.status < 300)) throw new Error('save failed')
      }
      alert('Business details saved')
    } catch (err) {
      console.error(err)
      alert('Save failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDone() {
    setLoading(true)
    try {
      // best-effort: we could attempt to save here if needed
      if (USE_MOCK) {
        const r = await fetch('/api/onboarding/complete', { method: 'POST', body: JSON.stringify({ type: 'quick' }), headers: { 'Content-Type': 'application/json' } })
        if (!r.ok) throw new Error('complete failed')
      } else {
        const r = await apiClient.post('/api/onboarding/complete', { type: 'quick' })
        if (!(r.status >= 200 && r.status < 300)) throw new Error('complete failed')
      }
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-3xl w-full mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative z-10 animate-slide-up">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Quick Setup</h1>
              <p className="text-sm text-slate-600 mt-1">Get started with just your business details</p>
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg animate-scale-in">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <BusinessStepComponent initial={initial} onSave={handleSave} />

        <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center">
          <a className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors inline-flex items-center gap-1" href="/onboarding">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            Full onboarding
          </a>
          <button 
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98]" 
            onClick={handleDone} 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Go to Dashboard
              </span>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-30px, 30px) rotate(-5deg); }
          66% { transform: translate(20px, -20px) rotate(5deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.2s; opacity: 0; }
      `}</style>
    </div>
  )
}
