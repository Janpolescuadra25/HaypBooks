"use client"
import Link from 'next/link'
import { useState } from 'react'

export default function LandingHeader() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="glass-topbar flex items-center gap-3" style={{ backgroundColor: 'rgba(255,255,255, var(--header-bg-opacity, 0.9))' }}>

        <div className="max-w-screen-xl mx-auto px-4 w-full">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/landing" className="inline-flex items-center gap-2" aria-label="HaypBooks Landing">
                <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 font-bold text-sm" style={{ color: '#fff' }}>HB</div>
                <span className="text-base font-semibold text-slate-800 hidden md:inline">HaypBooks</span>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-4 text-sm text-slate-700">
              <div className="relative group">
                <button className="inline-flex items-center gap-2" onMouseEnter={() => setOpen('biz')} onMouseLeave={() => setOpen(null)} aria-expanded={open === 'biz'}>
                  For Business <span className="text-xs">▾</span>
                </button>
                <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg text-sm p-2 hidden group-hover:block">
                  <a href="#features" className="block px-3 py-2 hover:bg-slate-50 rounded">Features</a>
                  <a href="#pricing" className="block px-3 py-2 hover:bg-slate-50 rounded">Pricing</a>
                </div>
              </div>

              <a href="/learn" className="inline-flex items-center">Learn & Support</a>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <a href="tel:+63282313135" className="hidden md:inline-flex items-center text-sm text-slate-600">Talk to Sales +63 282313135</a>
              <Link href="/login" className="btn-secondary !px-3 !py-1 text-sm">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
