"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function HubSidebar() {
  const pathname = usePathname() || ''
  const isActive = (p: string) => pathname.startsWith(p)

  return (
    <aside className="w-56 sidebar-floating flex flex-col">
      <div className="p-5 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">HB</div>
        <h1 className="text-lg font-bold text-slate-900">HaypBooks</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto" aria-label="Hub navigation">
        <Link href="/hub/companies" className={`sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg font-medium ${isActive('/hub/companies') ? 'text-slate-900 active' : 'text-slate-700'}`} aria-current={isActive('/hub/companies') ? 'page' : undefined}>
          <svg className="icon w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          <span className="flex-1">Companies</span>
          <span className={`ml-2 w-1 h-6 rounded-full ${isActive('/hub/companies') ? 'bg-emerald-500 rotate-0' : 'bg-transparent'}`} aria-hidden />
        </Link>

        <Link href="/hub/billing" className={`sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg font-medium ${isActive('/hub/billing') ? 'text-slate-900 active' : 'text-slate-700'}`} aria-current={isActive('/hub/billing') ? 'page' : undefined}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
          Billing Management
        </Link>

        <Link href="/hub/team" className={`sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg font-medium ${isActive('/hub/team') ? 'text-slate-900 active' : 'text-slate-700'}`} aria-current={isActive('/hub/team') ? 'page' : undefined}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          Team
        </Link>

        <Link href="/hub/reminders" className={`sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg font-medium ${isActive('/hub/reminders') ? 'text-slate-900 active' : 'text-slate-700'}`} aria-current={isActive('/hub/reminders') ? 'page' : undefined}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Reminders
        </Link>

        <Link href="/hub/support" className={`sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg font-medium ${isActive('/hub/support') ? 'text-slate-900 active' : 'text-slate-700'}`} aria-current={isActive('/hub/support') ? 'page' : undefined}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          Support
        </Link>

        <Link href="/hub/settings" className={`sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg font-medium ${isActive('/hub/settings') ? 'text-slate-900 active' : 'text-slate-700'}`} aria-current={isActive('/hub/settings') ? 'page' : undefined}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Settings
        </Link>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">JD</div>
          <div>
            <p className="font-semibold text-slate-900">Juan Dela Cruz</p>
            <p className="text-sm text-slate-600">juan@haypbooks.com</p>
          </div>
        </div>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            Switch Hub
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
