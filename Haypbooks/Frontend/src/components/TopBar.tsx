'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import useViewportZoom from '@/hooks/useViewportZoom'

type Props = {
  searchValue?: string
  onSearchChange?: (v: string) => void
  companyCount?: number
  onRegister?: () => void
}

export default function TopBar({ searchValue = '', onSearchChange, companyCount = 0, onRegister }: Props) {
  // Permanent horizontal padding (px)
  const horizontalPadding = 63

  // User menu state and outside click handling
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const userMenuRef = useRef<HTMLButtonElement | null>(null)
  const router = useRouter()

  async function handleSwitchHub() {
    // Navigate to the hub selection page
    try { router.push('/hub/selection') } catch (e) {}
  }

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const logoutConfirmRef = useRef<HTMLButtonElement | null>(null)

  async function confirmLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    setShowLogoutConfirm(false)
    try {
      await authService.logout()
    } catch (e) {
      // ignore and proceed to redirect to login
    } finally {
      setIsLoggingOut(false)
      try { router.replace('/login') } catch (e) {}
    }
  }

  function openLogoutConfirm() {
    setShowLogoutConfirm(true)
    setShowUserMenu(false)
  }

  useEffect(() => {
    if (showLogoutConfirm) {
      // focus the confirm button when modal opens
      setTimeout(() => logoutConfirmRef.current?.focus(), 0)
    }
  }, [showLogoutConfirm])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = userMenuRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowUserMenu(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  // keep DOM aria-expanded synced (eslint wants literal JSX; update via DOM)
  useEffect(() => {
    if (userMenuRef.current) userMenuRef.current.setAttribute('aria-expanded', showUserMenu ? 'true' : 'false')
  }, [showUserMenu])

  // use hook to determine compact and wide states
  const { isCompact, isWide } = useViewportZoom()

  const logoSizeClass = isCompact ? 'w-7 h-7' : 'w-8 h-8'
  const titleClass = isCompact ? 'text-xs font-semibold' : 'text-sm font-bold'
  const subtitleClass = isCompact ? 'text-[9px]' : 'text-[10px]'
  const navButtonClass = isCompact ? 'flex items-center gap-1 px-1 py-0.5 text-xs' : 'flex items-center gap-2 px-2 py-1 text-xs'

  return (
    <>
      <header className="w-full fixed top-0 left-0 right-0 z-50 bg-transparent py-1">
        <div className={`${isWide ? 'w-full px-0' : 'max-w-[1800px] mx-auto'} ${isCompact ? 'px-4' : 'px-16'}`}>
          <div className={`bg-white rounded-3xl relative shadow-[0_6px_18px_rgba(2,6,23,0.04)] border border-emerald-100 ${isWide ? 'mx-4 lg:mx-8' : ''} px-6 py-1`} ref={null}>
            {/* Top row: Logo, Navigation and User */}
            <div className="flex items-center justify-between">
{/* Left: Logo + Navigation */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className={`${logoSizeClass} bg-emerald-600 rounded-lg flex items-center justify-center`}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className={`${titleClass} text-slate-800`}>HAYPBOOKS</h1>
                  <p className={`${subtitleClass} text-slate-500`}>OWNER HUB</p>
                </div>
              </div>

              {/* Navigation (left) */}
              <nav className="flex items-center gap-3 ml-3">
                <button className={`${navButtonClass} bg-emerald-600 text-white rounded-full font-semibold shadow-sm`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span className={`${isCompact ? 'sr-only' : ''}`}>PORTFOLIO</span>
                </button>

                <button className={`${navButtonClass} text-slate-600 hover:text-slate-800 font-medium`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <span className={`${isCompact ? 'sr-only' : ''}`}>TASK REMINDER</span>
                </button>

                <button className={`${navButtonClass} text-slate-600 hover:text-slate-800 font-medium`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span className={`${isCompact ? 'sr-only' : ''}`}>RECONCILE ACCOUNTS</span>
                </button>
              </nav>
              </div>

              {/* Right: User */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">


                <button title="Help" aria-label="help" className="p-2 rounded hover:bg-slate-100 transition-colors relative">
                  <div className="w-4 h-4 text-slate-600 flex items-center justify-center text-sm font-semibold">?</div>
                </button>
                <button className="p-2 rounded hover:bg-slate-100 transition-colors relative" aria-label="notifications">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                </button>
                {/* User menu (avatar + dropdown) */}
                <div className="relative">
                  <button aria-haspopup="true" onClick={() => setShowUserMenu((s) => !s)} ref={userMenuRef as any} className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-xs">DU</div>
                    <div className={`${isCompact ? 'hidden' : 'hidden sm:block'} text-left`}>
                      <p className="text-xs font-medium text-slate-700">Demo User</p>
                      <p className="text-[9px] text-slate-500">ADMIN ACCESS</p>
                    </div>
                    {/* Dropdown indicator */}
                    <svg className={`w-3 h-3 text-slate-500 ml-1 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8l4 4 4-4" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-md border border-slate-100 p-4 z-50">
                      <div className="mb-3 text-[11px] font-medium tracking-widest text-slate-400">SESSION IDENTITY</div>
                      <div className="mb-3 text-sm font-semibold text-slate-700">demo@haypbooks.com</div>
                      <div className="border-t border-slate-100 -mx-4 mb-3"></div>

                      <ul className="space-y-2 text-sm">
                        <li>
                          <a href="#" className="flex items-center gap-3 text-slate-700 hover:text-slate-900">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            OWNER PROFILE
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center gap-3 text-slate-700 hover:text-slate-900">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" /></svg>
                            BILLING & USAGE
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center gap-3 text-slate-700 hover:text-slate-900">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v6l4 2 4-2V7" /></svg>
                            TEAM MANAGEMENT
                          </a>
                        </li>

                        <li>
                          <a href="#" className="flex items-center gap-3 text-slate-700 hover:text-slate-900">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4s-3 1.567-3 3.5S10.343 11 12 11z" /></svg>
                            SECURITY VAULT
                          </a>
                        </li>
                      </ul>

                      <div className="border-t border-slate-100 -mx-4 mt-3 mb-2"></div>

                      <div className="mb-2">
                        <button onClick={handleSwitchHub} disabled={isLoggingOut} className="w-full text-left flex items-center gap-3 text-sm font-semibold text-sky-700 hover:text-sky-800">
                          <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9h6l-2 4h8l-2 4h6" /></svg>
                          <span>{isLoggingOut ? 'Signing out…' : 'SWITCH HUB'}</span>
                        </button>
                      </div>

                      <div>
                        <button onClick={openLogoutConfirm} disabled={isLoggingOut} className="flex items-center gap-3 text-sm font-semibold text-rose-600 hover:text-rose-700">
                          {isLoggingOut ? (
                            <svg className="w-4 h-4 animate-spin text-rose-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2"></circle><path d="M22 12a10 10 0 10-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path></svg>
                          ) : (
                            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                          )}
                          <span>{isLoggingOut ? 'Signing out…' : 'Log out'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Logout confirmation modal (mounted outside the user menu so it can't be unmounted when the menu closes) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogoutConfirm(false)} aria-hidden="true"></div>
          <div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 id="logout-title" className="text-lg font-semibold text-slate-800">Confirm sign out</h3>
            <p className="text-sm text-slate-600 mt-2">Are you sure you want to sign out? You will be returned to the sign in page.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-3 py-1.5 rounded-md text-sm text-slate-600 bg-slate-50 hover:bg-slate-100">Cancel</button>
              <button ref={logoutConfirmRef} onClick={confirmLogout} className="px-3 py-1.5 rounded-md text-sm text-white bg-rose-600 hover:bg-rose-700">Sign out</button>
            </div>
          </div>
        </div>
      )}
      <div className={isCompact ? 'h-10' : 'h-12'}></div>
    </>
  )
}
