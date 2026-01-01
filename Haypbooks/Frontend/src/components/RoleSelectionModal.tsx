"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

export default function RoleSelectionModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  function choose(role: 'business' | 'accountant') {
    setLoading(true)
    // Mark that the user intentionally navigated to signup so we can suppress the cinematic intro
    if (typeof window !== 'undefined') { localStorage.setItem('hasSeenIntro', 'true'); window.dispatchEvent(new Event('suppressIntro')) }
    // Navigate to signup with role param and indicate we want to skip intro
    const target = `/signup?role=${role}&showSignup=1`
    // Use router.replace to avoid stacking history when opening modal from landing
    try { router.replace(target) } catch { window.location.href = target }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div role="dialog" aria-modal="true" aria-labelledby="role-select-title" className="bg-white rounded-xl shadow-lg max-w-xl w-full mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="role-select-title" className="text-lg font-bold">How will you use HaypBooks?</h2>
            <p className="text-sm text-slate-600 mt-1">Choose the role that best describes how you'll use HaypBooks.</p>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-slate-500 hover:text-slate-800">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button type="button" data-testid="role-business" aria-label="My Business" aria-describedby="role-business-desc" disabled={loading} onClick={() => choose('business')} className="option-card flex flex-col justify-between items-start p-6 w-full border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 transition transform duration-150 hover:-translate-y-1 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 motion-reduce:transition-none">
            <div>
              <h3 className="text-md font-semibold">My Business</h3>
              <p id="role-business-desc" className="text-sm text-slate-600 mt-2">I'm the owner running and managing my business.</p>
            </div>
          </button>

          <button type="button" data-testid="role-accountant" aria-label="Accountant" aria-describedby="role-accountant-desc" disabled={loading} onClick={() => choose('accountant')} className="option-card flex flex-col justify-between items-start p-6 w-full border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 transition transform duration-150 hover:-translate-y-1 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 motion-reduce:transition-none">
            <div>
              <h3 className="text-md font-semibold">Accountant</h3>
              <p id="role-accountant-desc" className="text-sm text-slate-600 mt-2">I support clients by managing their accounts.</p>
            </div>
          </button>
        </div>

        <div className="mt-4 text-xs text-slate-500">You can switch roles anytime during signup if needed.</div>
      </div>
      <style>{`.option-card:hover { transform: translateY(-2px); box-shadow: 0 12px 18px -4px rgba(0,0,0,0.08), 0 6px 8px -4px rgba(0,0,0,0.03); border-color: #10b981; }
        .option-card:focus-visible { box-shadow: 0 0 0 4px rgba(16,185,129,0.08); }
        `}</style>
    </div>
  )
}
