'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Menu, X, UserCheck, LifeBuoy } from 'lucide-react'
import { usePathname } from 'next/navigation'

const PRODUCTS = [
  { category: 'Manage', items: ['Dashboard', 'Invoicing', 'Expenses', 'Inventory'] },
  { category: 'People', items: ['Team', 'Payroll', 'Time Tracking'] },
  { category: 'Money', items: ['Banking', 'Payments', 'Planning'] },
  { category: 'Insights', items: ['Reports', 'Analytics', 'Forecasts'] },
  { category: 'Compliance', items: ['Taxes', 'Audit Trail', 'Documents'] },
]

const INDUSTRIES = [
  'Retail & Shops', 'Restaurants & Cafes', 'Construction',
  'Professional Services', 'Manufacturing', 'E-commerce',
  'Healthcare & Clinics', 'Transportation', 'Real Estate',
]

export default function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdown, setDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const isHome = pathname === '/landing' || pathname === '/'

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Hero is light-coloured, so always use dark text
  const navText = 'text-slate-600 hover:text-emerald-600'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || !isHome ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-slate-100' : 'bg-white/80 backdrop-blur-sm py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-sm">HB</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-emerald-950">
            HaypBooks
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-5">

          {/* Products dropdown */}
          <div className="relative" onMouseEnter={() => setDropdown('products')} onMouseLeave={() => setDropdown(null)}>
            <button className={`flex items-center gap-1 font-medium text-sm transition-colors ${navText}`}>
              Products <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdown === 'products' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {dropdown === 'products' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 mt-2 w-[560px] bg-white shadow-2xl rounded-2xl p-8 grid grid-cols-3 gap-6 border border-slate-100"
                >
                  {PRODUCTS.map((cat, i) => (
                    <div key={i}>
                      <h4 className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">{cat.category}</h4>
                      <ul className="space-y-2">
                        {cat.items.map((item, j) => (
                          <li key={j} className="text-slate-600 hover:text-emerald-600 text-sm font-medium transition-colors cursor-default">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Industries dropdown */}
          <div className="relative" onMouseEnter={() => setDropdown('industries')} onMouseLeave={() => setDropdown(null)}>
            <button className={`flex items-center gap-1 font-medium text-sm transition-colors ${navText}`}>
              Industries <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdown === 'industries' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {dropdown === 'industries' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 mt-2 w-[440px] bg-white shadow-2xl rounded-2xl p-8 grid grid-cols-2 gap-3 border border-slate-100"
                >
                  {INDUSTRIES.map((ind, i) => (
                    <div key={i} className="text-slate-600 hover:text-emerald-600 text-sm font-medium p-2 rounded-lg hover:bg-emerald-50 transition-all cursor-default">{ind}</div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/accountants" className={`flex items-center gap-1.5 font-medium text-sm transition-colors ${navText}`}>
            <UserCheck className="w-4 h-4" /> Accountant & Bookkeeper
          </Link>

          <Link href="/pricing" className={`font-medium text-sm transition-colors ${navText}`}>Pricing</Link>

          <Link href="/learn-and-support" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
          }`}>
            <LifeBuoy className="w-4 h-4" /> Learn & Support
          </Link>
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login?showLogin=1" className={`font-medium px-3 py-1.5 text-sm transition-colors ${navText}`}>Login</Link>
          <Link href="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-full shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 text-sm">
            Get Started Free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-slate-900" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-3">
              <span className="text-base font-medium text-slate-500 cursor-default">Products</span>
              <span className="text-base font-medium text-slate-500 cursor-default">Industries</span>
              <Link href="/accountants" className="text-base font-medium text-slate-900">Accountant & Bookkeeper</Link>
              <Link href="/pricing" className="text-base font-medium text-slate-900">Pricing</Link>
              <Link href="/learn-and-support" className="text-base font-medium text-emerald-600">Learn & Support</Link>
              <hr className="border-slate-100" />
              <Link href="/login?showLogin=1" className="text-slate-600 font-medium">Login</Link>
              <Link href="/signup" className="bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl text-center">Get Started Free</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
