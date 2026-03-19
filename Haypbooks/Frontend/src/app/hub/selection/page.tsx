"use client"
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useToast } from '@/components/ToastProvider'
import HubSelectionModal from '@/components/HubSelectionModal'
import { getProfileCached } from '@/lib/profile-cache'

export default function HubSelectionPage() {
  const router = useRouter()
  const toast = useToast()
  const [user, setUser] = useState<any | null>(null)

  // Redirect old hub selection path to the new Workspace selection page to centralize UX
  useEffect(() => {
    try { router.replace('/workspace') } catch (e) { /* ignore in tests */ }
  }, [router])

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



  return (
    <main className="min-h-screen bg-slate-50">
      <div ref={containerRef} className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-semibold">HB</div>
            <h1 className="text-xl font-semibold text-slate-900">HaypBooks</h1>
          </div>
          <p className="text-sm text-slate-500">Choose your hub to continue.</p>
        </div>

        <div className="text-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">HaypBooks Hubs consolidated</h2>
            <p className="text-sm text-slate-600 mt-2">We've consolidated the Owner Workspace and Accountant Hub into one unified Dashboard for a simpler experience. Click below to continue.</p>

            <div className="mt-6">
              <a href="/dashboard" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-emerald-700">Continue to Dashboard</a>
            </div>
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
      </div>
    </main>
  )
}
