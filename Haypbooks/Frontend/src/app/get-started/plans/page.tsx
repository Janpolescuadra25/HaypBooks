"use client"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import apiClient from '@/lib/api-client'

export default function GetStartedPlansPage() {
  const router = useRouter()
  const [workspaceName, setWorkspaceName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function persistCompanyAndNavigate(next: string) {
    setError('')
    if (!workspaceName.trim()) { setError('Owner Workspace name is required'); return }
    setLoading(true)
    try {
      // Persist Owner Workspace name to backend for current user (best-effort)
      try {
        await apiClient.patch('/api/users/profile', { companyName: workspaceName.trim() })
      } catch (e) {
        console.warn('Failed to persist Owner Workspace name to backend', e)
      }

      // NOTE: We no longer attempt to create a company here to avoid duplicate creation.
      // The onboarding flow on the server will create the Company during completion and persist it,
      // so here we only persist the Workspace name to the user's profile and continue the flow.

      router.push(next)
    } finally {
      setLoading(false)
    }
  }

  function handleGetStarted() {
    // proceed into the 3-step subscribe flow
    persistCompanyAndNavigate('/get-started/subscribe')
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-10 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-xl w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Welcome to HaypBooks 👋</h1>
          <p className="text-base text-slate-700">We’re glad you’re here. HaypBooks helps you manage accounting with clarity and confidence.</p>
        </div>



        <div className="bg-white rounded-2xl shadow p-6 border border-white/40">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">Let's get started</h2>
          <p className="text-slate-600 mb-6">Tell us the name of your Owner Workspace to personalize your experience.</p>

          <div className="max-w-md mx-auto">
            <label htmlFor="workspace-name" className="block text-sm font-medium text-slate-700 mb-2">Owner Workspace name</label>
            <input id="workspace-name" value={workspaceName} onChange={(e)=>{ setWorkspaceName(e.target.value); setError('') }} type="text" placeholder="e.g., Acme Widgets LLC" className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/90 ${error ? 'border-red-500' : 'border-slate-300'}`} required aria-required="true" />
            {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : <p className="mt-2 text-xs text-slate-500">Your Owner Workspace is the central home for your business in HaypBooks. It can contain one company or multiple—all managed in one place.</p>}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-center gap-3 flex-col sm:flex-row">
              {/* Primary: Start Free Trial (solid) */}
              <button onClick={() => persistCompanyAndNavigate('/get-started/trial')} aria-label="Start free trial" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow">{loading ? 'Saving…' : 'Start Free Trial'}</button>

              {/* Secondary: Get Started with Plans (outlined) */}
              <button onClick={handleGetStarted} className="w-full sm:w-auto px-5 py-3 border border-emerald-600 text-emerald-600 rounded-lg text-sm font-semibold bg-white hover:bg-emerald-50">Get Started with Plans</button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-600 mb-4">Need help? Our support team is always ready to assist.</p>
        </div>

        {/* Mobile sticky CTA for trial */}
        <div className="fixed left-4 right-4 bottom-6 sm:hidden z-50">
          <a href="/trial" aria-label="Start free trial" className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold shadow-lg">Start Free Trial</a>
        </div>
      </div>

      {/* Animations */}
      <style>{`
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
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
