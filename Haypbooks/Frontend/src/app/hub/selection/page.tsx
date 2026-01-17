"use client"
"use client"
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useToast } from '@/components/ToastProvider'
import HubSelectionModal from '@/components/HubSelectionModal'
import { getProfileCached } from '@/lib/profile-cache'

export default function HubSelectionPage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    getProfileCached().then((p) => { if (mounted) setUser(p) }).catch(() => { if (mounted) setUser(null) })
    return () => { mounted = false }
  }, [])

  // Keep a ref to the main card and ensure it's centered in the viewport on initial load.
  // If the page overflows (e.g., user zooms), this will position the card in the vertical center.
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { push } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    try {
      if (containerRef.current && typeof containerRef.current.scrollIntoView === 'function') {
        // First center the card, then nudge the viewport up slightly so the card sits
        // above the vertical center (gives a slightly top-leaning layout on desktop).
        containerRef.current.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' })
        // Small upward nudge (only has effect when the page is scrollable)
        try { window.scrollBy({ top: -80, left: 0 }) } catch (e) {}
      }
    } catch (e) {}
  }, [])

  async function handleSwitchAccount() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      try {
        await authService.logout()
        push({ type: 'success', message: 'Signed out' })
        // Give users a short moment to see the toast/spinner before navigating away
        await new Promise((res) => setTimeout(res, 450))
      } catch (e) {
        // Best-effort: show error but continue to sign-in page
        push({ type: 'error', message: 'Sign out failed — redirecting to Sign in' })
        // short delay to show error
        await new Promise((res) => setTimeout(res, 80))
      }
    } finally {
      setIsLoggingOut(false)
      // Navigate after attempts and short pause
      try { router.replace('/login') } catch (e) {}
    }
  }

  // Live counts (fetched from backend for near real-time reflection)
  const [ownerCount, setOwnerCount] = useState<number>((user && (user.companies || []).length) || 0)
  const [clientCount, setClientCount] = useState<number>((user && (user.clients || []).length) || 0)

  // Derived flags for CTA behavior
  const hasOwnerCompanies = ownerCount > 0
  const hasAccountantHub = !!(user && (user.accountantOnboardingCompleted || user.practiceName || (user.clients && user.clients.length > 0)))
  const userRole = (user && (user.role || (user.isAccountant ? 'accountant' : 'business'))) || null

  // Fetch fresh counts from server and poll every 15s
  useEffect(() => {
    let mounted = true
    let timer: ReturnType<typeof setInterval> | null = null

    async function fetchCounts() {
      try {
        // Owner companies
        const r1 = await fetch('/api/companies?filter=owned', { cache: 'no-store' })
        if (r1.ok) {
          const data = await r1.json()
          if (mounted) setOwnerCount(Array.isArray(data) ? data.length : 0)
        }

        // Clients (for accountants)
        const r2 = await fetch('/api/tenants/clients', { cache: 'no-store' })
        if (r2.ok) {
          const data2 = await r2.json()
          if (mounted) setClientCount(Array.isArray(data2) ? data2.length : 0)
        }
      } catch (e) {
        console.error('[HubSelection] Failed to fetch live counts', e)
      }
    }

    // initial fetch
    fetchCounts()
    // poll
    timer = setInterval(fetchCounts, 15_000)

    return () => {
      mounted = false
      if (timer) clearInterval(timer)
    }
  }, [])

  return (
    <main>
      <div ref={containerRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden transform -translate-y-16 md:-translate-y-20">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-white">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-emerald-600">HB</span>
            </div>
            <h1 className="text-2xl font-bold">HaypBooks</h1>
          </div>
          <h2 className="text-lg font-bold text-center mb-1">Welcome back{user?.name ? `, ${user.name}` : ''} 👋</h2>
          <p className="text-sm text-center opacity-90 mb-1">Choose how you'd like to use HaypBooks today.</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Owner Workspace Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-5 transform-gpu transition-transform duration-200 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-2xl border border-transparent hover:border-emerald-500 text-center animate-slide-up motion-reduce:animate-none" style={{ animationDelay: '0ms' }}>
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">My Companies</h3>
              <p className="text-sm text-slate-700 mb-4 leading-relaxed">Manage your businesses, subscriptions, teams, and accounting books.</p>
              <p aria-live="polite" className="text-sm font-medium text-emerald-700 mb-4">{ownerCount} active companies</p>
              {(!hasOwnerCompanies && userRole === 'accountant') ? (
                <a href="/companies?create=1" className="inline-block px-5 py-2 bg-amber-500 text-white text-sm font-bold rounded-2xl hover:bg-amber-600 transition transform-gpu duration-150 ease-out hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none">Create Company →</a>
              ) : (
                <a href="/hub/companies" className="inline-block px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-2xl shadow-sm hover:shadow-md hover:bg-emerald-700 transition transform-gpu duration-150 ease-out hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:shadow-md motion-reduce:transition-none">Enter Owner Workspace →</a>
              )} 
            </div> 

            {/* Accountant Hub Card */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-5 transform-gpu transition-transform duration-200 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-2xl border border-transparent hover:border-teal-500 text-center animate-slide-up motion-reduce:animate-none" style={{ animationDelay: '80ms' }}>
              <div className="w-14 h-14 bg-teal-600 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">My Practice</h3>
              <p className="text-sm text-slate-700 mb-4 leading-relaxed">Manage your clients, tasks, and accounting across multiple firms.</p>
              <p aria-live="polite" className="text-sm font-medium text-teal-700 mb-4">{clientCount} active clients</p>
              {(!hasAccountantHub && userRole === 'business') ? (
                <a href="/onboarding/accountant" className="inline-block px-5 py-2 bg-teal-600 text-white text-sm font-bold rounded-2xl hover:bg-teal-700 transition transform-gpu duration-150 ease-out hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 motion-reduce:transition-none">Create Accountant Hub →</a>
              ) : (
                <a href="/hub/accountant" className="inline-block px-5 py-2 bg-teal-600 text-white text-sm font-bold rounded-2xl shadow-sm hover:shadow-md hover:bg-teal-700 transition transform-gpu duration-150 ease-out hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:shadow-md motion-reduce:transition-none">Enter Accountant Hub →</a>
              )}
            </div> 
          </div>

          <div className="mt-6 text-center">
            <button data-testid="switch-account" disabled={isLoggingOut} onClick={handleSwitchAccount} className={`px-5 py-2 bg-slate-100 text-slate-700 rounded-xl transition-all flex items-center gap-2 mx-auto text-sm font-medium ${isLoggingOut ? 'opacity-70 cursor-wait' : 'hover:bg-slate-200'}`}>
              {isLoggingOut ? (
                <svg className="w-4 h-4 animate-spin text-slate-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2"/><path d="M22 12a10 10 0 10-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              )}
              <span>{isLoggingOut ? 'Signing out...' : 'Switch Account'}</span>
            </button>
            <p className="text-slate-600 mt-3 text-sm">You can switch hubs anytime from the top-right menu.</p>
          </div>

          <style>{`@keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-slide-up { animation: slideUp 320ms cubic-bezier(.16,1,.3,1) both; }
          @media (prefers-reduced-motion: reduce) { .animate-slide-up { animation: none !important; } }`}</style>
        </div>
      </div>
    </main>
  )
}