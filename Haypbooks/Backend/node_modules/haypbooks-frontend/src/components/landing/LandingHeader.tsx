"use client"
import Link from 'next/link'

export default function LandingHeader() {
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
              <Link href="/landing" className="inline-flex items-center">Home</Link>
              <Link href="/features" className="inline-flex items-center">Features</Link>

              <Link href="/accountants" className="inline-flex items-center">For accountants and bookkeepers</Link>
              <Link href="/pricing" className="inline-flex items-center">Pricing</Link>

              <Link href="/learn-and-support" className="inline-flex items-center">Learn & Support</Link>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/login?showLogin=1" className="btn-secondary !px-3 !py-1 text-sm">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
