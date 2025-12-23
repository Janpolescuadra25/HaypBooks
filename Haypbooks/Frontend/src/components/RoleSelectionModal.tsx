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
          <div className="border rounded-lg p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-md font-semibold">My Business</h3>
              <p className="text-sm text-slate-600 mt-2">I'm the owner running and managing my business.</p>
            </div>
            <div className="mt-4">
              <button disabled={loading} onClick={() => choose('business')} className="w-full bg-emerald-600 text-white px-4 py-2 rounded">My Business</button>
            </div>
          </div>

          <div className="border rounded-lg p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-md font-semibold">Accountant</h3>
              <p className="text-sm text-slate-600 mt-2">I support clients by managing their accounts.</p>
            </div>
            <div className="mt-4">
              <button disabled={loading} onClick={() => choose('accountant')} className="w-full border border-slate-300 text-slate-800 px-4 py-2 rounded">Accountant</button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500">You can switch roles anytime during signup if needed.</div>
      </div>
    </div>
  )
}
