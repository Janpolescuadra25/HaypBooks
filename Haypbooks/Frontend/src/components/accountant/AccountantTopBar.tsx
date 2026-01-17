'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'

type Props = {
  onSwitchToOwner?: () => void
}

export default function AccountantTopBar({ onSwitchToOwner }: Props) {
  const [active, setActive] = useState<'clients' | 'invitations'>('clients')
  const [user, setUser] = useState<any | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const userMenuRef = useRef<HTMLButtonElement | null>(null)
  const logoutConfirmRef = useRef<HTMLButtonElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    authService.getCurrentUser().then((u) => { if (mounted) setUser(u) }).catch(() => { if (mounted) setUser(null) })
    return () => { mounted = false }
  }, [])

  async function handleSwitchToOwner() {
    try {
      if (onSwitchToOwner) {
        onSwitchToOwner()
      } else {
        router.push('/hub/selection')
      }
    } catch (e) {}
  }

  function openLogoutConfirm() {
    setShowLogoutConfirm(true)
    setShowUserMenu(false)
  }

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

  useEffect(() => {
    if (showLogoutConfirm) {
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

  useEffect(() => {
    if (userMenuRef.current) userMenuRef.current.setAttribute('aria-expanded', showUserMenu ? 'true' : 'false')
  }, [showUserMenu])

  return (
    <>
      <header className="w-full fixed top-0 left-0 right-0 z-50 bg-transparent py-1">
        <div className="max-w-[1800px] mx-auto px-16">
          <div className="bg-white rounded-3xl relative shadow-[0_6px_18px_rgba(2,6,23,0.04)] border border-emerald-100 px-6 py-1">
            {/* Top row: Logo, Navigation and User */}
            <div className="flex items-center justify-between">
              {/* Left: Logo + Navigation */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-slate-800">HAYPBOOKS</h1>
                    <p className="text-[10px] text-slate-500">ACCOUNTANT HUB</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex items-center gap-3 ml-3">
                  <button
                    onClick={() => setActive('clients')}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded-full font-semibold ${
                      active === 'clients'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>CLIENTS</span>
                  </button>

                  <button
                    onClick={() => setActive('invitations')}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded-full font-medium ${
                      active === 'invitations'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>INVITATIONS</span>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                {/* User menu (avatar + dropdown) */}
                <div className="relative">
                  <button aria-haspopup="true" onClick={() => setShowUserMenu((s) => !s)} ref={userMenuRef as any} className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-xs">{user?.name ? (user.name.split(' ').map((p:any)=>p[0]).join('').slice(0,2)) : 'DU'}</div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-medium text-slate-700">{user?.name || 'Demo User'}</p>
                      <p className="text-[9px] text-slate-500">{(user?.role || 'ADMIN').toString().toUpperCase()}</p>
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
                            ACCOUNTANT PROFILE
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center gap-3 text-slate-700 hover:text-slate-900">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            FIRM SETTINGS
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center gap-3 text-slate-700 hover:text-slate-900">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            TEAM MEMBERS
                          </a>
                        </li>
                      </ul>

                      <div className="border-t border-slate-100 -mx-4 mt-3 mb-2"></div>

                      <div className="mb-2">
                        <button onClick={handleSwitchToOwner} disabled={isLoggingOut} className="w-full text-left flex items-center gap-3 text-sm font-semibold text-sky-700 hover:text-sky-800">
                          <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                          <span>SWITCH HUB</span>
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

      {/* Logout confirmation modal */}
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
      <div className="h-12"></div>
    </>
  )
}
