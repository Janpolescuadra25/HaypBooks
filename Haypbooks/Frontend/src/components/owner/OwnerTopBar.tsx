'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Bell, HelpCircle, ChevronDown, LayoutGrid } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useCompany } from '@/hooks/use-company'

export default function OwnerTopBar() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(() => authService.getStoredUser() ?? null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // company context for header label
  const { company, loading: companyLoading } = useCompany()

  // user-menu state (dropdown)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    let mounted = true
    authService.getCurrentUser()
      .then((u) => { if (mounted) setUser(u) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const displayName = (user?.name ?? user?.fullName ?? 'User') as string
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  async function confirmLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    setShowLogoutConfirm(false)
    setShowUserMenu(false)
    try { await authService.logout() } catch {}
    finally {
      setIsLoggingOut(false)
      try { router.replace('/login') } catch {}
    }
  }

  function handleSwitchHub() {
    setShowUserMenu(false)
    router.push('/workspace')
  }

  // close menu when clicking outside or pressing Escape
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

  return (
    <>
      <header className="h-14 bg-emerald-950 flex items-center justify-between px-6 z-50 text-white border-b border-white/10 shadow-xl shrink-0">
        {/* Left: Logo + Company Switcher */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 pr-6 border-r border-white/10">
            <div className="relative group cursor-pointer">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-transform">
                <span>HB</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter uppercase leading-none">Haypbooks</span>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-emerald-900/40 px-4 py-2 rounded-xl border border-white/10 hover:bg-emerald-900/60 transition-all cursor-pointer group">
            <LayoutGrid size={16} className="text-emerald-400 mr-2.5 group-hover:rotate-90 transition-transform duration-500" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              {companyLoading ? 'My Company' : (company?.name || company?.id || 'My Company')} <ChevronDown size={12} className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl mx-12 hidden lg:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search transactions, reports, or help..."
              className="w-full bg-white border-none rounded-full py-2 pl-12 pr-4 focus:ring-4 focus:ring-emerald-500/20 transition-all text-sm text-black placeholder:text-slate-400 font-medium shadow-inner outline-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-emerald-50 text-emerald-400 rounded text-[10px] font-bold border border-emerald-100">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-emerald-50 text-emerald-400 rounded text-[10px] font-bold border border-emerald-100">K</kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions + User */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button className="p-2.5 text-emerald-300 hover:bg-white/10 hover:text-white rounded-xl transition-all group">
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            </button>
            <button className="p-2.5 text-emerald-300 hover:bg-white/10 hover:text-white rounded-xl relative transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-emerald-950 shadow-sm animate-pulse">3</span>
            </button>
            <button className="p-2.5 text-emerald-300 hover:bg-white/10 hover:text-white rounded-xl transition-all">
              <HelpCircle size={20} />
            </button>
          </div>

          <div className="h-8 w-px bg-white/10 mx-1" />

          <div className="relative">
            <button
              aria-haspopup="true"
              aria-expanded={showUserMenu}
              ref={userMenuRef as any}
              onClick={() => setShowUserMenu((s) => !s)}
              className="flex items-center gap-3 p-1 pl-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl transition-all group"
            >
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-white group-hover:text-emerald-300 transition-colors truncate max-w-[80px]">
                  {displayName}
                </span>
                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Admin</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-emerald-950 font-black text-xs shadow-lg shadow-emerald-500/20">
                {initials}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50 p-2 text-sm text-slate-700">
                <button onClick={handleSwitchHub} className="w-full text-left px-2 py-1 hover:bg-slate-50">Switch hub</button>
                <button onClick={() => { setShowLogoutConfirm(true); setShowUserMenu(false); }} className="w-full text-left px-2 py-1 hover:bg-slate-50">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-black text-emerald-950 mb-1">Sign out?</h3>
            <p className="text-sm text-emerald-600/80 mb-6">You will be redirected to the login page.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                {isLoggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
